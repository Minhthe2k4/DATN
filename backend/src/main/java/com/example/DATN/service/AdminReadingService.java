package com.example.DATN.service;

import com.example.DATN.dto.AdminReadingArticleDto;
import com.example.DATN.dto.AdminReadingTopicDto;
import com.example.DATN.dto.CrawlReadingArticleRequest;
import com.example.DATN.dto.CrawlReadingArticleResponse;
import com.example.DATN.dto.UpsertReadingArticleRequest;
import com.example.DATN.dto.UpsertReadingTopicRequest;
import com.example.DATN.entity.Article;
import com.example.DATN.entity.ArticleTopic;
import com.example.DATN.repository.ArticleManagementProjection;
import com.example.DATN.repository.ArticleRepository;
import com.example.DATN.repository.ArticleTopicRepository;
import com.example.DATN.repository.ArticleManagementProjection;
import com.example.DATN.repository.ArticleTopicManagementProjection;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminReadingService {
    private static final Pattern META_CONTENT_PATTERN = Pattern.compile("(?is)<meta[^>]+(?:property|name)\\s*=\\s*['\"]%s['\"][^>]+content\\s*=\\s*['\"](.*?)['\"][^>]*>");
    private static final Pattern TITLE_PATTERN = Pattern.compile("(?is)<title[^>]*>(.*?)</title>");
    private static final Pattern ARTICLE_PATTERN = Pattern.compile("(?is)<article[^>]*>(.*?)</article>");
    private static final Pattern MAIN_PATTERN = Pattern.compile("(?is)<main[^>]*>(.*?)</main>");
    private static final Pattern PARAGRAPH_PATTERN = Pattern.compile("(?is)<p[^>]*>(.*?)</p>");
    private static final Pattern CONTENT_BLOCK_PATTERN = Pattern.compile("(?is)<(p|h2|h3|blockquote|ul|ol|figure)\\b[^>]*>.*?</\\1>|<img\\b[^>]*>");
    private static final Pattern LIST_ITEM_PATTERN = Pattern.compile("(?is)<li[^>]*>(.*?)</li>");
    private static final Pattern FIGCAPTION_PATTERN = Pattern.compile("(?is)<figcaption[^>]*>(.*?)</figcaption>");
    private static final Pattern IMG_TAG_PATTERN = Pattern.compile("(?is)(<img\\b[^>]*>)");
    private static final Pattern IMAGE_PATTERN = Pattern.compile("(?is)<img[^>]+src\\s*=\\s*['\"](.*?)['\"][^>]*>");
    private static final Pattern CAPTION_CLASS_PATTERN = Pattern.compile("(?is)<p[^>]+(?:class|id)\\s*=\\s*['\"][^'\"]*(caption|legend|photo-caption|image-caption|figcaption|credit)[^'\"]*['\"][^>]*>");
    private static final int MAX_CONTENT_NODES = 140;
    private final ArticleRepository articleRepository;
    private final ArticleTopicRepository articleTopicRepository;
    private final HttpClient httpClient = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NORMAL).build();

    public AdminReadingService(ArticleRepository articleRepository, ArticleTopicRepository articleTopicRepository) {
        this.articleRepository = articleRepository;
        this.articleTopicRepository = articleTopicRepository;
    }

    public List<AdminReadingArticleDto> findAllArticles() {
        return articleRepository.findArticleManagementRows().stream().map(this::toArticleDto).toList();
    }

    public AdminReadingArticleDto findArticleById(Long id) {
        Article article = articleRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found"));

        Long topicId = null;
        String topicName = "Chưa gán chủ đề";
        if (article.topic != null && article.topic.id != null) {
            topicId = article.topic.id;
            topicName = defaultString(article.topic.name, "Chưa gán chủ đề");
        }

        return new AdminReadingArticleDto(
            toLong(Math.toIntExact(article.id)),
            defaultString(article.title, ""),
            topicId,
            topicName,
            normalizeDifficulty(article.difficulty),
            defaultString(article.content, ""),
            defaultString(article.articleImage, ""),
            article.createdAt,
            normalizeWordsHighlighted(article.wordsHighlighted),
            defaultString(article.source, ""),
            normalizeArticleStatus(article.status)
        );
    }

    public AdminReadingArticleDto createArticle(UpsertReadingArticleRequest request) {
        Article article = new Article();
        applyArticle(article, request);
        // Đảm bảo words_highlighted không null
        if (article.wordsHighlighted == null) {
            article.wordsHighlighted = 0;
        }
        Article saved = articleRepository.save(article);
        return findArticleById(toLong(Math.toIntExact(saved.id)));
    }

    public AdminReadingArticleDto updateArticle(Long id, UpsertReadingArticleRequest request) {
        Article article = articleRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found"));
        applyArticle(article, request);
        // Đảm bảo words_highlighted không null
        if (article.wordsHighlighted == null) {
            article.wordsHighlighted = 0;
        }
        articleRepository.save(article);
        return findArticleById(id);
    }

    public CrawlReadingArticleResponse crawlArticle(CrawlReadingArticleRequest request) {
        String sourceUrl = request == null ? "" : defaultString(request.sourceUrl(), "").trim();
        if (sourceUrl.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Source URL is required");
        }

        URI uri;
        try {
            uri = URI.create(sourceUrl);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Source URL is invalid");
        }

        if (uri.getScheme() == null || (!"http".equalsIgnoreCase(uri.getScheme()) && !"https".equalsIgnoreCase(uri.getScheme()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Source URL must use http or https");
        }

        try {
            HttpRequest httpRequest = HttpRequest.newBuilder(uri)
                .GET()
                .header("User-Agent", "Mozilla/5.0 DATN-AdminBot/1.0")
                .header("Accept", "text/html,application/xhtml+xml")
                .build();
            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Cannot fetch article content from source URL");
            }

            String html = defaultString(response.body(), "");
            String title = firstNonBlank(
                extractMetaContent(html, "og:title"),
                extractMetaContent(html, "twitter:title"),
                stripTags(extractFirstGroup(TITLE_PATTERN, html))
            );
            String content = extractReadableContent(html, uri);
            String articleImage = normalizeImageUrl(firstNonBlank(
                extractMetaContent(html, "og:image"),
                extractMetaContent(html, "twitter:image"),
                extractFirstGroup(IMAGE_PATTERN, html)
            ), uri);

            if (content.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Cannot extract article content from source URL");
            }

            return new CrawlReadingArticleResponse(
                defaultString(title, ""),
                content,
                defaultString(articleImage, ""),
                estimateWordsHighlighted(content),
                new Date()
            );
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Cannot crawl article from source URL");
        }
    }

    public void deleteArticle(Long id) {
        if (!articleRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found");
        }
        articleRepository.deleteById(id);
    }

    public List<AdminReadingTopicDto> findAllTopics() {
        return articleTopicRepository.findArticleTopicManagementRows().stream().map(this::toTopicDto).toList();
    }

    public AdminReadingTopicDto findTopicById(Long id) {
        ArticleTopic topic = articleTopicRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reading topic not found"));

        long articleCount = articleRepository.findArticleManagementRows().stream()
                .filter(row -> id.equals(row.getTopicId()))
                .count();

        return new AdminReadingTopicDto(
            toLong(Math.toIntExact(topic.id)),
            defaultString(topic.name, ""),
            defaultString(topic.description, ""),
            normalizeDifficulty(topic.level),
            normalizeTopicStatus(topic.status),
            defaultString(topic.articleTopicImage, ""),
            articleCount
        );
    }

    public AdminReadingTopicDto createTopic(UpsertReadingTopicRequest request) {
        ArticleTopic topic = new ArticleTopic();
        applyTopic(topic, request);
        ArticleTopic saved = articleTopicRepository.save(topic);
        return findTopicById(toLong(Math.toIntExact(saved.id)));
    }

    public AdminReadingTopicDto updateTopic(Long id, UpsertReadingTopicRequest request) {
        ArticleTopic topic = articleTopicRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reading topic not found"));
        applyTopic(topic, request);
        articleTopicRepository.save(topic);
        return findTopicById(id);
    }

    public void deleteTopic(Long id) {
        long linkedArticles = articleRepository.findArticleManagementRows().stream()
                .filter(row -> id.equals(row.getTopicId()))
                .count();
        if (linkedArticles > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete topic with linked articles");
        }
        if (!articleTopicRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Reading topic not found");
        }
        articleTopicRepository.deleteById(id);
    }

    private void applyArticle(Article article, UpsertReadingArticleRequest request) {
        String title = request == null ? "" : defaultString(request.title(), "").trim();
        if (title.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Article title is required");
        }
        if (request == null || request.topicId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Article topic is required");
        }

        ArticleTopic topic = articleTopicRepository.findById(request.topicId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reading topic not found"));

        article.title = title;
        article.topic = topic;
        if (request != null && request.content() != null) {
            article.content = request.content().trim();
        }
        article.source = defaultString(request.sourceUrl(), "").trim();
        article.difficulty = normalizeDifficulty(request == null ? null : request.difficulty());
        if (request != null && request.articleImage() != null) {
            article.articleImage = request.articleImage().trim();
        }

        if (article.createdAt == null) {
            article.createdAt = new Date();
        }
        if (request != null && request.createdAt() != null) {
            article.createdAt = request.createdAt();
        }

        if (request != null && request.wordsHighlighted() != null) {
            article.wordsHighlighted = normalizeWordsHighlighted(request.wordsHighlighted());
        } else if (article.wordsHighlighted == null) {
            article.wordsHighlighted = 0;
        }
        article.status = normalizeArticleStatus(request == null ? null : request.status());
    }

    private void applyTopic(ArticleTopic topic, UpsertReadingTopicRequest request) {
        String name = request == null ? "" : defaultString(request.name(), "").trim();
        if (name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reading topic name is required");
        }
        topic.name = name;
        topic.description = request == null ? "" : defaultString(request.description(), "").trim();
        topic.level = normalizeDifficulty(request == null ? null : request.defaultDifficulty());
        topic.articleTopicImage = request == null ? "" : defaultString(request.articleTopicImage(), "").trim();
        if (request != null && request.status() != null) {
            topic.status = normalizeTopicStatusValue(request.status());
        } else if (topic.status == null) {
            topic.status = Boolean.TRUE;
        }
    }

    private AdminReadingArticleDto toArticleDto(ArticleManagementProjection row) {
        return new AdminReadingArticleDto(
                row.getId(),
                defaultString(row.getTitle(), ""),
                row.getTopicId(),
                defaultString(row.getTopicName(), "Chưa gán chủ đề"),
            normalizeDifficulty(row.getDifficulty()),
            defaultString(row.getContent(), ""),
            defaultString(row.getArticleImage(), ""),
            row.getCreatedAt(),
            normalizeWordsHighlighted(row.getWordsHighlighted()),
                defaultString(row.getSource(), ""),
            normalizeArticleStatus(row.getStatus())
        );
    }

    private AdminReadingTopicDto toTopicDto(ArticleTopicManagementProjection row) {
        return new AdminReadingTopicDto(
                row.getId(),
                defaultString(row.getName(), ""),
                defaultString(row.getDescription(), ""),
                normalizeDifficulty(row.getLevel()),
                normalizeTopicStatus(row.getStatus()),
                defaultString(row.getArticleTopicImage(), ""),
                row.getArticleCount() == null ? 0 : row.getArticleCount()
        );
    }

    private String normalizeTopicStatus(Boolean value) {
        return Boolean.FALSE.equals(value) ? "Tạm dừng" : "Hoạt động";
    }

    private boolean normalizeTopicStatusValue(String value) {
        String normalized = defaultString(value, "Hoạt động").trim().toLowerCase(Locale.ROOT);
        return !normalized.equals("tam dung")
            && !normalized.equals("tạm dừng")
            && !normalized.equals("paused")
            && !normalized.equals("false")
            && !normalized.equals("0");
    }

    private String normalizeArticleStatus(String value) {
        String normalized = defaultString(value, "Chờ biên tập").trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "da xuat ban", "đã xuất bản", "published" -> "Đã xuất bản";
            case "nhap", "nháp", "draft" -> "Nháp";
            default -> "Chờ biên tập";
        };
    }

    private String normalizeDifficulty(String value) {
        String normalized = defaultString(value, "Trung bình").trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "co ban", "cơ bản", "basic" -> "Cơ bản";
            case "nang cao", "nâng cao", "advanced" -> "Nâng cao";
            default -> "Trung bình";
        };
    }

    private int normalizeWordsHighlighted(Integer value) {
        if (value == null) {
            return 0;
        }
        return Math.max(value, 0);
    }

    private String defaultString(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }

    private Long toLong(Integer value) {
        return value == null ? null : value.longValue();
    }

    private String extractMetaContent(String html, String key) {
        Pattern pattern = Pattern.compile(String.format(META_CONTENT_PATTERN.pattern(), Pattern.quote(key)), Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
        return decodeHtml(extractFirstGroup(pattern, html));
    }

    private String extractReadableContent(String html, URI baseUri) {
        String mainBlock = firstNonBlank(
            extractFirstGroup(ARTICLE_PATTERN, html),
            extractFirstGroup(MAIN_PATTERN, html),
            html
        );

        Matcher contentMatcher = CONTENT_BLOCK_PATTERN.matcher(defaultString(mainBlock, ""));
        StringBuilder htmlBuilder = new StringBuilder();
        int nodeCount = 0;
        while (contentMatcher.find() && nodeCount < MAX_CONTENT_NODES) {
            String node = toContentNode(contentMatcher.group(), baseUri);
            if (!node.isBlank()) {
                htmlBuilder.append(node);
                nodeCount += 1;
            }
        }

        String extractedHtml = htmlBuilder.toString().trim();
        if (!extractedHtml.isBlank()) {
            return extractedHtml;
        }

        Matcher paragraphMatcher = PARAGRAPH_PATTERN.matcher(defaultString(mainBlock, ""));
        StringBuilder builder = new StringBuilder();
        while (paragraphMatcher.find()) {
            String paragraph = stripTags(paragraphMatcher.group(1));
            if (!paragraph.isBlank()) {
                if (builder.length() > 0) {
                    builder.append("\n\n");
                }
                builder.append(paragraph);
            }
        }

        String extracted = builder.toString().trim();
        if (!extracted.isBlank()) {
            return toParagraphHtml(extracted);
        }

        String fallback = stripTags(mainBlock);
        String shortened = fallback.length() > 6000 ? fallback.substring(0, 6000).trim() : fallback;
        return toParagraphHtml(shortened);
    }

    private int estimateWordsHighlighted(String content) {
        if (content == null || content.isBlank()) {
            return 0;
        }
        String plainText = stripTags(content);
        int wordCount = plainText.isBlank() ? 0 : plainText.trim().split("\\s+").length;
        int estimated = wordCount / 80;
        return Math.max(5, Math.min(estimated, 40));
    }

    private String toContentNode(String rawNode, URI baseUri) {
        String node = defaultString(rawNode, "").trim();
        if (node.isBlank()) {
            return "";
        }

        String lower = node.toLowerCase(Locale.ROOT);
        if (lower.startsWith("<img")) {
            return buildImageFigure(node, baseUri, extractInlineImageCaption(node));
        }

        if (lower.startsWith("<figure")) {
            String imageTag = extractFirstGroup(IMG_TAG_PATTERN, node);
            String caption = firstNonBlank(
                stripTags(extractFirstGroup(FIGCAPTION_PATTERN, node)),
                extractInlineImageCaption(imageTag)
            );
            return buildImageFigure(imageTag, baseUri, caption);
        }

        if (lower.startsWith("<ul") || lower.startsWith("<ol")) {
            String listTag = lower.startsWith("<ol") ? "ol" : "ul";
            Matcher listMatcher = LIST_ITEM_PATTERN.matcher(node);
            StringBuilder listBuilder = new StringBuilder();
            while (listMatcher.find()) {
                String itemText = stripTags(listMatcher.group(1));
                if (!itemText.isBlank()) {
                    listBuilder.append("<li>")
                        .append(escapeHtmlText(itemText))
                        .append("</li>");
                }
            }
            if (listBuilder.length() == 0) {
                String fallbackText = stripTags(node);
                return fallbackText.isBlank() ? "" : "<p>" + escapeHtmlText(fallbackText) + "</p>";
            }
            return "<" + listTag + ">" + listBuilder + "</" + listTag + ">";
        }

        String tagName = "p";
        if (lower.startsWith("<h2")) {
            tagName = "h2";
        } else if (lower.startsWith("<h3")) {
            tagName = "h3";
        } else if (lower.startsWith("<blockquote")) {
            tagName = "blockquote";
        }

        String text = stripTags(node);
        if (text.isBlank()) {
            return "";
        }

        if (lower.startsWith("<p") && looksLikeCaption(node, text)) {
            return "<figcaption class=\"article-inline-caption\">"
                + escapeHtmlText(text)
                + "</figcaption>";
        }
        return "<" + tagName + ">" + escapeHtmlText(text) + "</" + tagName + ">";
    }

    private String buildImageFigure(String imgTag, URI baseUri, String fallbackCaption) {
        String normalizedTag = defaultString(imgTag, "");
        if (normalizedTag.isBlank()) {
            return "";
        }

        String srcRaw = firstNonBlank(
            extractAttribute(normalizedTag, "src"),
            extractAttribute(normalizedTag, "data-src"),
            extractAttribute(normalizedTag, "data-original"),
            extractAttribute(normalizedTag, "data-lazy-src"),
            extractAttribute(normalizedTag, "srcset"),
            extractAttribute(normalizedTag, "data-srcset")
        );
        String src = normalizeImageUrl(srcRaw, baseUri);
        if (src.isBlank()) {
            return "";
        }

        String caption = firstNonBlank(
            defaultString(fallbackCaption, ""),
            stripTags(extractAttribute(normalizedTag, "data-caption")),
            stripTags(extractAttribute(normalizedTag, "title"))
        );

        String alt = firstNonBlank(
            stripTags(extractAttribute(normalizedTag, "alt")),
            defaultString(caption, "")
        );

        StringBuilder builder = new StringBuilder();
        builder.append("<figure class=\"article-inline-image\">")
            .append("<img src=\"")
            .append(escapeHtmlAttribute(src))
            .append("\" alt=\"")
            .append(escapeHtmlAttribute(defaultString(alt, "Article image")))
            .append("\" loading=\"lazy\" referrerpolicy=\"no-referrer\" />");

        if (!caption.isBlank()) {
            builder.append("<figcaption>")
            .append(escapeHtmlText(caption))
                .append("</figcaption>");
        }

        builder.append("</figure>");
        return builder.toString();
    }

    private String extractInlineImageCaption(String imgTag) {
        String tag = defaultString(imgTag, "");
        if (tag.isBlank()) {
            return "";
        }
        return firstNonBlank(
            stripTags(extractAttribute(tag, "data-caption")),
            stripTags(extractAttribute(tag, "title"))
        );
    }

    private boolean looksLikeCaption(String rawNode, String text) {
        String raw = defaultString(rawNode, "");
        String normalizedText = defaultString(text, "").trim();
        if (normalizedText.isBlank()) {
            return false;
        }

        int wordCount = normalizedText.split("\\s+").length;
        if (wordCount > 32) {
            return false;
        }

        String lowerText = normalizedText.toLowerCase(Locale.ROOT);
        if (CAPTION_CLASS_PATTERN.matcher(raw).find()) {
            return true;
        }

        if ((raw.toLowerCase(Locale.ROOT).contains("<em") || raw.toLowerCase(Locale.ROOT).contains("<i")) && wordCount <= 24) {
            return true;
        }

        return lowerText.startsWith("anh:")
            || lowerText.startsWith("ảnh:")
            || lowerText.startsWith("photo:")
            || lowerText.startsWith("credit:")
            || lowerText.startsWith("nguon:")
            || lowerText.startsWith("nguồn:")
            || lowerText.startsWith("source:");
    }

    private String extractAttribute(String tag, String attributeName) {
        String tagContent = defaultString(tag, "");
        if (tagContent.isBlank()) {
            return "";
        }

        Pattern quotedPattern = Pattern.compile("(?is)\\b" + Pattern.quote(attributeName) + "\\s*=\\s*(['\"])(.*?)\\1");
        Matcher quotedMatcher = quotedPattern.matcher(tagContent);
        if (quotedMatcher.find()) {
            return decodeHtml(defaultString(quotedMatcher.group(2), "")).trim();
        }

        Pattern unquotedPattern = Pattern.compile("(?is)\\b" + Pattern.quote(attributeName) + "\\s*=\\s*([^\\s>]+)");
        Matcher unquotedMatcher = unquotedPattern.matcher(tagContent);
        if (unquotedMatcher.find()) {
            return decodeHtml(defaultString(unquotedMatcher.group(1), "")).trim();
        }

        return "";
    }

    private String normalizeImageUrl(String rawUrl, URI baseUri) {
        String value = defaultString(rawUrl, "").trim();
        if (value.isBlank()) {
            return "";
        }

        String firstUrl = value.split(",")[0].trim();
        if (firstUrl.contains(" ")) {
            firstUrl = firstUrl.split("\\s+")[0].trim();
        }

        String candidate = firstUrl;
        if (candidate.startsWith("//")) {
            String scheme = baseUri != null && baseUri.getScheme() != null ? baseUri.getScheme() : "https";
            candidate = scheme + ":" + candidate;
        }

        try {
            URI parsed = URI.create(candidate);
            URI resolved = parsed.isAbsolute() ? parsed : (baseUri == null ? parsed : baseUri.resolve(parsed));
            String scheme = resolved.getScheme();
            if (scheme == null) {
                return "";
            }
            if (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme)) {
                return "";
            }
            return resolved.toString();
        } catch (IllegalArgumentException ex) {
            return "";
        }
    }

    private String toParagraphHtml(String plainText) {
        String text = defaultString(plainText, "").trim();
        if (text.isBlank()) {
            return "";
        }

        String[] paragraphs = text.split("\\n{2,}");
        StringBuilder builder = new StringBuilder();
        for (String paragraph : paragraphs) {
            String normalized = defaultString(paragraph, "").trim();
            if (!normalized.isBlank()) {
                builder.append("<p>")
                    .append(escapeHtmlText(normalized))
                    .append("</p>");
            }
        }
        return builder.toString();
    }

    private String escapeHtmlText(String value) {
        return defaultString(value, "")
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;");
    }

    private String escapeHtmlAttribute(String value) {
        return escapeHtmlText(value)
            .replace("\"", "&quot;")
            .replace("'", "&#39;");
    }

    private String extractFirstGroup(Pattern pattern, String input) {
        Matcher matcher = pattern.matcher(defaultString(input, ""));
        if (!matcher.find()) {
            return "";
        }
        return decodeHtml(defaultString(matcher.group(1), "")).trim();
    }

    private String stripTags(String value) {
        String normalized = defaultString(value, "")
            .replaceAll("(?is)<script[^>]*>.*?</script>", " ")
            .replaceAll("(?is)<style[^>]*>.*?</style>", " ")
            .replaceAll("(?is)<br\\s*/?>", "\n")
            .replaceAll("(?is)</p>", "\n")
            .replaceAll("(?is)<[^>]+>", " ")
            .replaceAll("[ \\t\\x0B\\f\\r]+", " ")
            .replaceAll("\\n{3,}", "\n\n")
            .trim();
        return decodeHtml(normalized);
    }

    private String decodeHtml(String value) {
        return defaultString(value, "")
            .replace("&nbsp;", " ")
            .replace("&amp;", "&")
            .replace("&quot;", "\"")
            .replace("&#39;", "'")
            .replace("&lt;", "<")
            .replace("&gt;", ">");
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return "";
    }
}
