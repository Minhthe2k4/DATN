import React from 'react';
import ProgressBar from '../../../components/interaction/ProgressBar';
import { formatDate } from '../utils';

const FALLBACK_ARTICLE_IMAGE = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80';

export function ReadingDetailHero({ article, minutes, progressPercent }) {
    return (
        <header className="reading-detail-hero">
            <img 
                src={article.articleImage || FALLBACK_ARTICLE_IMAGE} 
                alt={article.title} 
                className="reading-detail-hero__image" 
                referrerPolicy="no-referrer" 
            />
            <div className="reading-detail-hero__content">
                <p>{article.topicName}</p>
                <h1>{article.title}</h1>
                <div className="reading-detail-hero__meta">
                    <span>{article.source}</span>
                    <span>{minutes} min read</span>
                    <span>{article.difficulty}</span>
                    <span>{article.wordsHighlighted} từ khóa</span>
                    <span>{formatDate(article.createdAt)}</span>
                </div>
                <ProgressBar percent={progressPercent} label="Tiến độ đọc" />
            </div>
        </header>
    );
}
