import React from 'react';

const FALLBACK_TOPIC_IMAGE = 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=1200&q=80';

export function TopicTabs({ 
    topics, 
    selectedTopicId, 
    showFavorites, 
    userId, 
    onSelectTopic, 
    onSelectFavorites 
}) {
    return (
        <div className="reading-topics" role="tablist" aria-label="Chủ đề luyện đọc">
            {topics.map((topic) => {
                const isActive = topic.id === selectedTopicId && !showFavorites;
                return (
                    <button
                        key={topic.id}
                        type="button"
                        className={`reading-topic${isActive ? ' is-active' : ''}`}
                        onClick={() => onSelectTopic(topic.id)}
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
                    onClick={onSelectFavorites}
                    role="tab"
                    aria-selected={showFavorites}
                >
                    <div className="favorite-icon-container">❤️</div>
                    <span className="reading-topic__label">Yêu thích</span>
                </button>
            )}
        </div>
    );
}
