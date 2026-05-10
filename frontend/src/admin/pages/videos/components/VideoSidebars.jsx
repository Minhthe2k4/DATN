import React from 'react'
import { AdminSectionCard, PieDistribution } from '../../../components/console/AdminUi'

export function VideoSidebars({ topVideos, channelData }) {
  return (
    <div className="d-flex flex-column gap-3">
      <AdminSectionCard title="Top 5 video phổ biến">
        <div className="d-flex flex-column gap-2">
          {topVideos.length === 0 ? (
            <div className="text-center py-3 text-muted small">Chưa có dữ liệu.</div>
          ) : (
            topVideos.map((video, index) => {
              const maxViews = topVideos[0]?.views || 1
              const ratio = (video.views / maxViews) * 100
              const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : 'rank-other'

              return (
                <div key={video.id} className="lesson-rank-item d-flex align-items-center gap-3 p-2 rounded-3">
                  <div className={`rank-badge ${rankClass} flex-shrink-0`}>
                    {index + 1}
                  </div>
                  <div className="flex-grow-1 min-width-0">
                    <div className="text-truncate fw-bold text-dark mb-0" style={{ fontSize: '0.85rem' }}>{video.title}</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                      {(video.views ?? 0).toLocaleString()} lượt xem
                    </div>
                  </div>
                  <div className="lesson-rank-progress" style={{ width: `${ratio}%` }}></div>
                </div>
              )
            })
          )}
        </div>
      </AdminSectionCard>

      <AdminSectionCard title="Phân bổ theo Kênh">
        <div style={{ height: '200px' }}>
          <PieDistribution data={channelData} />
        </div>
        <div className="mt-3">
          {channelData.map((item, idx) => (
            <div key={item.name} className="d-flex justify-content-between align-items-center mb-1 small">
              <span className="text-muted text-truncate me-2">
                <span
                  className="d-inline-block rounded-circle me-2"
                  style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][idx % 5]
                  }}
                ></span>
                {item.name}
              </span>
              <span className="fw-bold flex-shrink-0">{item.count} video</span>
            </div>
          ))}
        </div>
      </AdminSectionCard>
    </div>
  )
}
