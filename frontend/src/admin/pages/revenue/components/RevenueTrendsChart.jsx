import React from 'react'
import { AdminSectionCard, FilterTabs, LineTrend } from '../../../components/console/AdminUi'

export function RevenueTrendsChart({ activeTrend, setActiveTrend, currentTrendData }) {
  return (
    <div className="col-12 col-xl-8">
      <AdminSectionCard
        title="Biểu đồ xu hướng doanh thu"
        description="Xem chi tiết doanh thu theo từng mốc thời gian (Rê chuột vào điểm để xem số tiền cụ thể)."
        actions={
          <FilterTabs
            items={[
              { label: 'Theo Ngày', value: 'DAY' },
              { label: 'Theo Tháng', value: 'MONTH' },
              { label: 'Theo Năm', value: 'YEAR' }
            ]}
            active={activeTrend}
            onChange={setActiveTrend}
          />
        }
      >
        <div className="admin-kicker mb-3">
          Đơn vị: {activeTrend === 'YEAR' ? 'Triệu đồng' : 'VNĐ'}
        </div>
        <LineTrend
          data={currentTrendData}
          valueKey="revenueInMillions"
          label={activeTrend === 'DAY' ? 'Doanh thu ngày' : activeTrend === 'YEAR' ? 'Doanh thu năm' : 'Doanh thu tháng'}
        />
      </AdminSectionCard>
    </div>
  )
}
