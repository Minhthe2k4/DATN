import React from 'react'
import { AdminSectionCard, LineTrend } from '../../../components/console/AdminUi'

export function LearningPerformanceCharts({ trends }) {
  return (
    <div className="col-12 col-xl-8">
      <AdminSectionCard
        title="Hiệu suất học tập 7 ngày"
        description="Phân tích tăng trưởng tri thức và cường độ hoạt động của cộng đồng người học."
      >
        <div className="row g-4">
          <div className="col-12 col-md-4">
            <div className="admin-kicker">Sản lượng từ vựng (Yield)</div>
            <p className="text-muted small mb-2" style={{ fontSize: '0.75rem' }}>Số lượng từ vựng nắm vững hoàn toàn mỗi ngày.</p>
            <LineTrend data={trends} valueKey="words" color="#10b981" suffix=" từ" />
          </div>
          <div className="col-12 col-md-4">
            <div className="admin-kicker">Khối lượng bài học (Sessions)</div>
            <p className="text-muted small mb-2" style={{ fontSize: '0.75rem' }}>Tổng số lượt hoàn thành bài học/luyện tập.</p>
            <LineTrend data={trends} valueKey="lessons" color="#3b82f6" suffix=" lượt" />
          </div>
          <div className="col-12 col-md-4">
            <div className="admin-kicker">Chất lượng ghi nhớ (%)</div>
            <p className="text-muted small mb-2" style={{ fontSize: '0.75rem' }}>Độ chính xác trung bình trong các phiên ôn tập.</p>
            <LineTrend data={trends} valueKey="reviews" color="#f59e0b" suffix="%" />
          </div>
        </div>
      </AdminSectionCard>
    </div>
  )
}
