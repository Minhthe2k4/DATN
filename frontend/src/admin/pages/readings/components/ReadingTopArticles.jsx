import React from 'react'
import { AdminSectionCard } from '../../../components/console/AdminUi'

export function ReadingTopArticles({ topArticles }) {
  return (
    <AdminSectionCard title="Top 5 bài đọc phổ biến">
      <div className="d-flex flex-column gap-2">
        {topArticles.length === 0 ? (
          <div className="text-center py-3 text-muted small">Chưa có dữ liệu.</div>
        ) : (
          topArticles.map((article, index) => {
            const maxViews = topArticles[0]?.views || 1
            const ratio = (article.views / maxViews) * 100
            const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : 'rank-other'
            
            return (
              <div key={article.id} className="lesson-rank-item d-flex align-items-center gap-3 p-2 rounded-3">
                <div className={`rank-badge ${rankClass} flex-shrink-0`}>
                  {index + 1}
                </div>
                <div className="flex-grow-1 min-width-0">
                  <div className="text-truncate fw-bold text-dark mb-0" style={{ fontSize: '0.85rem' }}>{article.title}</div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                    {(article.views ?? 0).toLocaleString()} lượt đọc
                  </div>
                </div>
                <div className="lesson-rank-progress" style={{ width: `${ratio}%` }}></div>
              </div>
            )
          })
        )}
      </div>
    </AdminSectionCard>
  )
}
