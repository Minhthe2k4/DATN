import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { getUserSession, getAuthHeader } from '../../utils/authSession';
import { normalizeTopic, normalizeArticle, getExternalReadingUrl } from './utils';
import { TopicTabs } from './components/TopicTabs';
import { ReadingControls } from './components/ReadingControls';
import { ArticleList } from './components/ArticleList';

import './reading.css';
import '../../components/interaction/interaction.css';

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
          const favoriteIds = res.data.map(f => f.targetId);
          if (favoriteIds.length === 0) {
            setArticles([]);
            setIsLoading(false);
            return;
          }
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
        </header>

        <TopicTabs
          topics={topics}
          selectedTopicId={selectedTopicId}
          showFavorites={showFavorites}
          userId={userId}
          onSelectTopic={(id) => {
            setSelectedTopicId(id);
            setShowFavorites(false);
          }}
          onSelectFavorites={() => setShowFavorites(true)}
        />

        <ReadingControls
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          difficultyFilter={difficultyFilter}
          onDifficultyChange={setDifficultyFilter}
        />

        <ArticleList
          articles={filteredArticles}
          isLoading={isLoading}
          showFavorites={showFavorites}
          selectedTopic={selectedTopic}
          userId={userId}
          interactionStats={interactionStats}
          onToggleFavorite={handleToggleFavorite}
        />
      </div>
    </section>
  );
}

export default Reading;
