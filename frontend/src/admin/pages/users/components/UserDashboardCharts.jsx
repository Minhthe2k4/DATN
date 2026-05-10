import React from 'react'
import { AdminSectionCard, PieDistribution } from '../../components/console/AdminUi'

export function UserDashboardCharts({ newestUsers, premiumData, statusData }) {
  return (
    <div className="row g-3 mt-1">
      <div className="col-12 col-md-4">
        <AdminSectionCard title="Top 5 đăng ký mới nhất">
          <div className="d-flex flex-column gap-2">
            {newestUsers.length === 0 ? (
              <div className="text-center py-3 text-muted small">Chưa có dữ liệu.</div>
            ) : (
              newestUsers.map((user, index) => {
                const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : 'rank-other'
                
                return (
                  <div key={user.id} className="lesson-rank-item d-flex align-items-center gap-3 p-2 rounded-3">
                    <div className={`rank-badge ${rankClass} flex-shrink-0`}>
                      {index + 1}
                    </div>
                    <div className="flex-grow-1 min-width-0">
                      <div className="text-truncate fw-bold text-dark mb-0" style={{ fontSize: '0.85rem' }}>{user.fullname || user.username}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        Đăng ký: {user.createdAt}
                      </div>
                    </div>
                    <div className="lesson-rank-progress" style={{ width: `100%`, opacity: 0.1 }}></div>
                  </div>
                )
              })
            )}
          </div>
        </AdminSectionCard>
      </div>

      <div className="col-12 col-md-4">
        <AdminSectionCard title="Tỷ lệ Premium">
          <div style={{ height: '180px' }}>
            <PieDistribution data={premiumData} colors={['#f59e0b', '#94a3b8']} />
          </div>
          <div className="mt-3">
            {premiumData.map((item, idx) => (
              <div key={item.name} className="d-flex justify-content-between align-items-center mb-1 small">
                <span className="text-muted">
                  <span className="d-inline-block rounded-circle me-2" style={{ width: '8px', height: '8px', backgroundColor: ['#f59e0b', '#94a3b8'][idx] }}></span>
                  {item.name}
                </span>
                <span className="fw-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </AdminSectionCard>
      </div>

      <div className="col-12 col-md-4">
        <AdminSectionCard title="Trạng thái tài khoản">
          <div style={{ height: '180px' }}>
            <PieDistribution data={statusData} colors={['#10b981', '#ef4444']} />
          </div>
          <div className="mt-3">
            {statusData.map((item, idx) => (
              <div key={item.name} className="d-flex justify-content-between align-items-center mb-1 small">
                <span className="text-muted">
                  <span className="d-inline-block rounded-circle me-2" style={{ width: '8px', height: '8px', backgroundColor: ['#10b981', '#ef4444'][idx] }}></span>
                  {item.name}
                </span>
                <span className="fw-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </AdminSectionCard>
      </div>
    </div>
  )
}
