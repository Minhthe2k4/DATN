import React from 'react';
import './interaction.css';

const ProgressBar = ({ percent, label }) => {
  return (
    <div className="interaction-progress-container">
      {label && <div className="progress-label">{label}: {Math.round(percent)}%</div>}
      <div className="progress-bar-bg">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
