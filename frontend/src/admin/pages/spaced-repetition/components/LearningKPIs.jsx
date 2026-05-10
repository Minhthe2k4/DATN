import React from 'react'
import { AdminSectionCard, MetricList } from '../../../components/console/AdminUi'

export function LearningKPIs({ kpiMetrics }) {
  return (
    <div className="col-12 col-xl-4">
      <AdminSectionCard
        title="Chỉ số KPI học tập"
        description="Các chỉ số then chốt đánh giá chất lượng học tập."
      >
        <MetricList items={kpiMetrics} />
        <div className="mt-4 p-3 bg-light rounded-3 border border-dashed text-center">
          <div className="fw-bold text-dark mb-1">Mục tiêu quý này</div>
          <div className="text-muted small">Tăng tỷ lệ hoàn thành lên 85% và duy trì độ chính xác trên 75%.</div>
        </div>
      </AdminSectionCard>
    </div>
  )
}
