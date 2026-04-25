
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getUserSession, getAuthHeader } from '../../utils/authSession';
import ProgressBar from '../../components/interaction/ProgressBar';
import './reading.css';
import '../../components/interaction/interaction.css';

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
  const session = getUserSession();
  const userId = session?.userId ? Number(session.userId) : null;

  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [showFavorites, setShowFavorites] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [interactionStats, setInteractionStats] = useState({}); // { articleId: { isFavorite, progressPercent } }
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
    if (showFavorites) {
        if (!userId) return;
        setIsLoading(true);
        axios.get('/api/user/interaction/favorites/ARTICLE', {
            headers: getAuthHeader()
        })
            .then(res => {
                // res.data is a list of UserFavorite objects, we need the actual articles
                // For simplicity, let's assume we need to fetch them or the backend returns them
                // Actually, let's update the backend to return the article data in favorites or fetch them here
                const favoriteIds = res.data.map(f => f.targetId);
                if (favoriteIds.length === 0) {
                    setArticles([]);
                    setIsLoading(false);
                    return;
                }
                // Fetch full article details for these IDs
                // For now, let's just fetch all and filter (not efficient but works for now)
                axios.get('/api/article/list')
                    .then(allRes => {
                        const rows = allRes.data
                            .filter(a => favoriteIds.includes(a.id))
                            .map(normalizeArticle);
                        setArticles(rows);
                    })
                    .finally(() => setIsLoading(false));
            })
            .catch(() => {
                setArticles([]);
                setIsLoading(false);
            });
        return;
    }

    if (!selectedTopicId) return;
    setIsLoading(true);
    axios.get('/api/article/list', { params: { topicId: selectedTopicId } })
      .then(res => {
        const rows = Array.isArray(res.data) ? res.data.map(normalizeArticle) : [];
        setArticles(rows);
      })
      .catch(() => setArticles([]))
      .finally(() => setIsLoading(false));
  }, [selectedTopicId, showFavorites, userId]);

  useEffect(() => {
    if (articles.length > 0 && userId) {
        axios.post('/api/user/interaction/bulk-stats', {
            targetIds: articles.map(a => a.id),
            targetType: 'ARTICLE'
        }, { headers: getAuthHeader() })
        .then(res => setInteractionStats(res.data))
        .catch(err => console.error('Failed to fetch bulk stats', err));
    }
  }, [articles, userId]);

  const handleToggleFavorite = async (e, articleId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) {
        alert('Vui lòng đăng nhập!');
        return;
    }
    try {
        const res = await axios.post('/api/user/interaction/favorite/toggle', null, {
            params: { targetId: articleId, targetType: 'ARTICLE' },
            headers: getAuthHeader()
        });
        setInteractionStats(prev => ({
            ...prev,
            [articleId]: { ...prev[articleId], isFavorite: res.data.isFavorite }
        }));
    } catch (err) {
        console.error('Failed to toggle favorite', err);
    }
  };

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             article.source.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDifficulty = difficultyFilter === 'All' || article.difficulty === difficultyFilter;
        return matchesSearch && matchesDifficulty;
    });
  }, [articles, searchTerm, difficultyFilter]);

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
            const isActive = topic.id === selectedTopicId && !showFavorites;
            return (
              <button
                key={topic.id}
                type="button"
                className={`reading-topic${isActive ? ' is-active' : ''}`}
                onClick={() => {
                    setSelectedTopicId(topic.id);
                    setShowFavorites(false);
                }}
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
              </button>
            );
          })}
          
          {userId && (
            <button
                type="button"
                className={`reading-topic favorite-topic${showFavorites ? ' is-active' : ''}`}
                onClick={() => setShowFavorites(true)}
                role="tab"
                aria-selected={showFavorites}
            >
                <div className="favorite-icon-container">❤️</div>
                <span className="reading-topic__label">Yêu thích</span>
            </button>
          )}
        </div>

        <div className="reading-controls">
            <div className="search-box">
                <input 
                    type="text" 
                    placeholder="Tìm kiếm bài viết..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="filter-box">
                <select 
                    value={difficultyFilter} 
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                >
                    <option value="All">Tất cả trình độ</option>
                    <option value="Easy">Dễ</option>
                    <option value="Intermediate">Trung bình</option>
                    <option value="Advanced">Khó</option>
                </select>
            </div>
        </div>

        <section className="reading-articles" aria-live="polite">
          <div className="reading-articles__head">
            <h2>{showFavorites ? 'Bài viết đã lưu' : `Bài viết chủ đề ${selectedTopic?.name}`}</h2>
            <span>{filteredArticles.length} bài</span>
          </div>

          <div className="reading-articles__list">
            {isLoading ? (
                <p>Đang tải bài viết...</p>
            ) : (
                filteredArticles.map((article) => (
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
                    </div>
                    
                    {userId && (
                        <div className="reading-article-card__interaction">
                            <button 
                                className={`list-favorite-btn ${interactionStats[article.id]?.isFavorite ? 'active' : ''}`}
                                onClick={(e) => handleToggleFavorite(e, article.id)}
                            >
                                {interactionStats[article.id]?.isFavorite ? '❤️' : '🤍'}
                            </button>
                            <div className="list-progress-container">
                                <ProgressBar percent={interactionStats[article.id]?.progressPercent || 0} />
                            </div>
                        </div>
                    )}

                    <Link
                      to={`/reading/${article.topicId}/${article.id}`}
                      className="reading-article-card__button"
                    >
                      Đọc bài
                    </Link>
                  </article>
                ))
            )}
            {!isLoading && filteredArticles.length === 0 && (
                <p>{showFavorites ? 'Bạn chưa lưu bài viết nào.' : 'Không có bài viết nào khớp với tìm kiếm.'}</p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

export default Reading;

