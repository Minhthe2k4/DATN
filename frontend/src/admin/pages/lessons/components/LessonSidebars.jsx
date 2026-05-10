import React from 'react'
import { AdminSectionCard } from '../../../components/console/AdminUi'
import { Star } from 'lucide-react'

export function LessonSidebars({ topLessons, difficultyDistribution }) {
  return (
    <div className="d-flex flex-column gap-3">
      <AdminSectionCard
        title="Top 5 bài học phổ biến"
        description="Dựa trên tổng lượt truy cập"
      >
        <div className="d-flex flex-column gap-2">
          {topLessons.length === 0 ? (
            <div className="text-center py-3 text-muted small">Chưa có dữ liệu truy cập.</div>
          ) : (
            topLessons.map((lesson, index) => {
              const maxViews = topLessons[0]?.views || 1;
              const ratio = (lesson.views / maxViews) * 100;
              const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : 'rank-other';

              return (
                <div key={lesson.id} className="lesson-rank-item d-flex align-items-center gap-3 p-2 rounded-3">
                  <div className={`rank-badge ${rankClass} flex-shrink-0`}>
                    {index + 1}
                  </div>
                  <div className="flex-grow-1 min-width-0">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="text-truncate fw-bold text-dark mb-0" style={{ fontSize: '0.85rem' }}>{lesson.name}</div>
                      {lesson.isPremium && (
                        <span className="badge bg-soft-info text-info p-1 d-flex align-items-center gap-1" style={{ fontSize: '0.65rem' }}>
                          <Star size={10} /> PREMIUM
                        </span>
                      )}
                    </div>
                    <div className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                      {(lesson.views ?? 0).toLocaleString()} lượt học
                    </div>
                  </div>
                  <div className="lesson-rank-progress" style={{ width: `${ratio}%` }}></div>
                </div>
              )
            })
          )}
        </div>
      </AdminSectionCard>

      <AdminSectionCard title="Phân bổ độ khó" description="Thống kê bài học">
        <div className="lesson-difficulty-grid">
          {difficultyDistribution.map((item) => (
            <div className={`lesson-difficulty-item ${item.tone}`} key={item.difficulty}>
              <div className="lesson-difficulty-item__header">
                <span className="lesson-difficulty-item__label">{item.difficulty}</span>
                <span className="lesson-difficulty-item__count">{item.count}</span>
              </div>
              <div className="lesson-difficulty-item__track" role="progressbar">
                <div className="lesson-difficulty-item__fill" style={{ width: `${item.ratio}%` }}></div>
              </div>
              <div className="lesson-difficulty-item__meta">{Math.round(item.ratio)}%</div>
            </div>
          ))}
        </div>
      </AdminSectionCard>
    </div>
  )
}
