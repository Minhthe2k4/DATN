export function normalizeArticle(row) {
    return {
        id: Number(row?.id),
        topicId: Number(row?.topicId),
        topicName: row?.topicName || 'Khong ro chu de',
        topicImage: row?.topicImage || '',
        title: row?.title || 'Bai viet chua co tieu de',
        content: row?.content || '',
        source: row?.source || 'Nguon noi bo',
        createdAt: row?.createdAt || row?.created_at || null,
        difficulty: row?.difficulty || 'Trung binh',
        wordsHighlighted: Number(row?.wordsHighlighted || row?.words_highlighted || 0),
        articleImage: row?.articleImage || row?.article_image || '',
    }
}

export function formatDate(value) {
    if (!value) return 'Moi cap nhat'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Moi cap nhat'
    return date.toLocaleString('vi-VN')
}

export function estimateMinutes(content) {
    if (!content) return 1
    const words = content
        .replace(/<[^>]+>/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean).length
    return Math.max(1, Math.ceil(words / 180))
}

export function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

export function normalizeContentHtml(content) {
    const raw = String(content ?? '').trim()
    if (!raw) {
        return ''
    }

    const hasHtml = /<\/?[a-z][\s\S]*>/i.test(raw)
    const html = hasHtml
        ? raw
        : raw
            .split(/\n{2,}/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean)
            .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
            .join('')

    return html
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
        .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '')
        .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '')
        .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '')
        .replace(/javascript:/gi, '')
}

export function normalizeWordToken(value) {
    return String(value ?? '')
        .toLowerCase()
        .replace(/^[^\p{L}]+/u, '')
        .replace(/[^\p{L}'-]+$/u, '')
        .trim()
}

export function tokenizeContentHtml(html, activeWord, savedVocab = []) {
    if (!html) {
        return ''
    }

    if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
        return html
    }

    const parser = new DOMParser()
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html')
    const root = doc.body.firstElementChild
    if (!root) {
        return html
    }

    const textNodes = []
    const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    let current = walker.nextNode()
    while (current) {
        const parentTag = current.parentElement?.tagName?.toLowerCase() || ''
        if (!['script', 'style', 'code', 'pre'].includes(parentTag) && current.nodeValue?.trim()) {
            textNodes.push(current)
        }
        current = walker.nextNode()
    }

    const sortedVocab = [...savedVocab].sort((a, b) => (b.word || '').length - (a.word || '').length)

    textNodes.forEach((node) => {
        const text = node.nodeValue || ''
        const fragment = doc.createDocumentFragment()
        const parts = text.split(/(\p{L}[\p{L}'-]*)/u)

        parts.forEach((part) => {
            if (!part) {
                return
            }

            if (/^\p{L}[\p{L}'-]*$/u.test(part)) {
                const word = normalizeWordToken(part)
                if (!word) {
                    fragment.appendChild(doc.createTextNode(part))
                    return
                }

                const span = doc.createElement('span')
                const isSaved = sortedVocab.find(v => (v.word || '').toLowerCase() === word)

                let className = 'reading-inline-word'
                if (word === activeWord) className += ' is-context-word'
                if (isSaved) className += ' highlighted-word'

                span.className = className
                span.setAttribute('data-word', word)
                span.textContent = part

                if (isSaved) {
                    const tooltip = doc.createElement('span')
                    tooltip.className = 'vocab-tooltip'

                    const tWord = doc.createElement('span')
                    tWord.className = 'tooltip-word'
                    tWord.textContent = `${isSaved.word} ${isSaved.pronunciation ? `[${isSaved.pronunciation}]` : ''}`

                    const tMeaning = doc.createElement('span')
                    tMeaning.className = 'tooltip-meaning'
                    tMeaning.textContent = isSaved.meaningVi || isSaved.meaningEn

                    tooltip.appendChild(tWord)
                    tooltip.appendChild(tMeaning)
                    span.appendChild(tooltip)
                }

                fragment.appendChild(span)
            } else {
                fragment.appendChild(doc.createTextNode(part))
            }
        })

        node.replaceWith(fragment)
    })

    return root.innerHTML
}

export function cleanContextSentence(value) {
    return String(value ?? '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 420)
}

export function extractSentence(text, word) {
    if (!text || !word) return text;
    const lowerText = text.toLowerCase();
    const lowerWord = word.toLowerCase();
    const wordIndex = lowerText.indexOf(lowerWord);
    if (wordIndex === -1) return text;

    let start = wordIndex;
    while (start > 0) {
        const char = text[start - 1];
        const prevChar = start > 1 ? text[start - 2] : '';
        if (/[.!?]/.test(prevChar) && /\s/.test(char)) break;
        start--;
    }

    let end = wordIndex + word.length;
    while (end < text.length) {
        const char = text[end];
        if (/[.!?]/.test(char)) {
            end++;
            break;
        }
        end++;
    }

    return text.substring(start, end).trim();
}

export function normalizeTopic(row) {
    return {
        id: Number(row?.id),
        name: row?.name || 'Khong ro chu de',
        description: row?.description || 'Chua co mo ta',
        defaultDifficulty: row?.defaultDifficulty || row?.level || 'Trung binh',
        articleCount: Number(row?.articleCount || 0),
        articleTopicImage: row?.articleTopicImage || row?.topicImage || '',
    };
}

export function getExternalReadingUrl(topic) {
    if (!topic) return '#';
    const searchQuery = `${topic.name || topic.label} tin tức tiếng Anh`;
    return `https://news.google.com/search?q=${encodeURIComponent(searchQuery)}`;
}
