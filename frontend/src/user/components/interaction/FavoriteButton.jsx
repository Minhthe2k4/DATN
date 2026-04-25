import React from 'react';
import './interaction.css';

const FavoriteButton = ({ isFavorite, onToggle, loading }) => {
  return (
    <button 
      className={`favorite-btn ${isFavorite ? 'active' : ''} ${loading ? 'loading' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      disabled={loading}
      title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
    >
      <span className="heart-icon">{isFavorite ? '❤️' : '🤍'}</span>
      <span className="label">{isFavorite ? 'Đã thích' : 'Yêu thích'}</span>
    </button>
  );
};

export default FavoriteButton;
