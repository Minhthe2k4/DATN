import React from 'react';
import './interaction.css';

const HighlightWrapper = ({ text, savedVocab }) => {
  if (!text || !savedVocab || savedVocab.length === 0) return <>{text}</>;

  // Sort words by length descending to avoid partial matches on longer words
  const sortedVocab = [...savedVocab].sort((a, b) => b.word.length - a.word.length);
  
  // Create a regex to match any of the words (case insensitive, word boundary)
  const pattern = sortedVocab.map(v => v.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');

  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => {
        const match = sortedVocab.find(v => v.word.toLowerCase() === part.toLowerCase());
        if (match) {
          return (
            <span key={i} className="highlighted-word">
              {part}
              <span className="vocab-tooltip">
                <span className="tooltip-word">{match.word} {match.pronunciation ? `[${match.pronunciation}]` : ''}</span>
                <span className="tooltip-meaning">{match.meaningVi || match.meaningEn}</span>
              </span>
            </span>
          );
        }
        return part;
      })}
    </>
  );
};

export default HighlightWrapper;
