import React from 'react';
import { Link } from 'react-router-dom';
import ProgressBar from '../../../components/interaction/ProgressBar';
import { formatDate } from '../utils';

const FALLBACK_ARTICLE_IMAGE = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80';

export function ArticleList({ 
    articles, 
    isLoading, 
    showFavorites, 
    selectedTopic, 
    userId, 
    interactionStats, 
    onToggleFavorite 
}) {
    return (
        <section className="reading-articles" aria-live="polite">
            <div className="reading-articles__head">
                <h2>{showFavorites ? 'Bài viết đã lưu' : `Bài viết chủ đề ${selectedTopic?.name || ''}`}</h2>
                <span>{articles.length} bài</span>
            </div>

            <div className="reading-articles__list">
                {isLoading ? (
                    <p>Đang tải bài viết...</p>
                ) : (
                    articles.map((article) => (
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
                                        onClick={(e) => onToggleFavorite(e, article.id)}
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
                {!isLoading && articles.length === 0 && (
                    <p>{showFavorites ? 'Bạn chưa lưu bài viết nào.' : 'Không có bài viết nào khớp với tìm kiếm.'}</p>
                )}
            </div>
        </section>
    );
}
