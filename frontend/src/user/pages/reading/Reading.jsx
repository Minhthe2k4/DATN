
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './reading.css';

const FALLBACK_TOPIC_IMAGE = 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=1200&q=80';
const FALLBACK_ARTICLE_IMAGE = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80';

function formatDate(value) {
  if (!value) return 'Moi cap nhat';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Moi cap nhat';
  return date.toLocaleDateString('vi-VN');
}

function normalizeTopic(row) {
  return {
    id: Number(row?.id),
    name: row?.name || 'Khong ro chu de',
    description: row?.description || 'Chua co mo ta',
    defaultDifficulty: row?.defaultDifficulty || row?.level || 'Trung binh',
    articleCount: Number(row?.articleCount || 0),
    articleTopicImage: row?.articleTopicImage || row?.topicImage || '',
  };
}

function normalizeArticle(row) {
  return {
    id: Number(row?.id),
    topicId: Number(row?.topicId),
    title: row?.title || 'Bai viet chua co tieu de',
    source: row?.source || 'Nguon noi bo',
    difficulty: row?.difficulty || 'Trung binh',
    createdAt: row?.createdAt || row?.created_at || null,
    wordsHighlighted: Number(row?.wordsHighlighted || row?.words_highlighted || 0),
    articleImage: row?.articleImage || row?.article_image || '',
  };
}

function getExternalReadingUrl(topic) {
  if (!topic) return '#';
  const searchQuery = `${topic.name || topic.label} tin tức tiếng Anh`;
  return `https://news.google.com/search?q=${encodeURIComponent(searchQuery)}`;
}

function Reading() {
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [articles, setArticles] = useState([]);
  const selectedTopic = useMemo(
    () => topics.find((topic) => topic.id === selectedTopicId) || null,
    [topics, selectedTopicId]
  );

  // Lấy danh sách chủ đề từ backend
  useEffect(() => {
    axios.get('/api/article/topics')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data.map(normalizeTopic) : [];
        setTopics(data);
        if (data.length > 0) {
          setSelectedTopicId(data[0].id);
        }
      })
      .catch(() => setTopics([]));
  }, []);

  // Khi chọn chủ đề, lấy danh sách bài báo
  useEffect(() => {
    if (!selectedTopicId) return;
    axios.get('/api/article/list', { params: { topicId: selectedTopicId } })
      .then(res => {
        const rows = Array.isArray(res.data) ? res.data.map(normalizeArticle) : [];
        setArticles(rows);
      })
      .catch(() => setArticles([]));
  }, [selectedTopicId]);

  return (
    <section className="reading-page">
      <div className="reading-page__container">
        <header className="reading-page__header">
          <p className="reading-page__eyebrow">Luyện đọc</p>
          <h1 className="reading-page__title">Chọn chủ đề và bắt đầu đọc</h1>
          <p className="reading-page__subtitle">
            Chọn một chủ đề bên dưới để xem các bài viết liên quan.
          </p>
          <a
            href={getExternalReadingUrl(selectedTopic)}
            className="reading-page__external-btn"
            target="_blank"
            rel="noreferrer"
          >
            Đọc nguồn báo ngoài
          </a>
        </header>

        <div className="reading-topics" role="tablist" aria-label="Chủ đề luyện đọc">
          {topics.map((topic) => {
            const isActive = topic.id === selectedTopicId;
            return (
              <button
                key={topic.id}
                type="button"
                className={`reading-topic${isActive ? ' is-active' : ''}`}
                onClick={() => setSelectedTopicId(topic.id)}
                role="tab"
                aria-selected={isActive}
              >
                <img
                  src={topic.articleTopicImage || FALLBACK_TOPIC_IMAGE}
                  alt={topic.name}
                  className="reading-topic__image"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <span className="reading-topic__label">{topic.name}</span>
                <span className="reading-topic__description">{topic.description}</span>
              </button>
            );
          })}
        </div>

        <section className="reading-articles" aria-live="polite">
          <div className="reading-articles__head">
            <h2>Bài viết chủ đề {selectedTopic?.name}</h2>
            <span>{articles.length} bài</span>
          </div>

          <div className="reading-articles__list">
            {articles.map((article) => (
              <article key={article.id} className="reading-article-card">
                <img
                  src={article.articleImage || FALLBACK_ARTICLE_IMAGE}
                  alt={article.title}
                  className="reading-article-card__image"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <h3>{article.title}</h3>
                <div className="reading-article-card__meta">
                  <span>{article.source}</span>
                  <span>{article.difficulty}</span>
                  <span>{formatDate(article.createdAt)}</span>
                  <span>{article.wordsHighlighted} tu khoa</span>
                </div>
                <Link
                  to={`/reading/${selectedTopicId}/${article.id}`}
                  className="reading-article-card__button"
                >
                  Đọc bài
                </Link>
              </article>
            ))}
            {articles.length === 0 && <p>Không có bài viết nào cho chủ đề này.</p>}
          </div>
        </section>
      </div>
    </section>
  );
}

export default Reading;

