import React from 'react'

export function TopicImageCard({ topicImage, topicName }) {
  return (
    <div className="text-center">
      <img
        src={topicImage || 'https://via.placeholder.com/400x300?text=No+Image'}
        alt={topicName}
        className="img-fluid rounded border shadow-sm"
        style={{ maxHeight: '300px', objectFit: 'cover' }}
      />
    </div>
  )
}
