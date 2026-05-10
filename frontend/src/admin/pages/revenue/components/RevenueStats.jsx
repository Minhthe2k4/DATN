import React from 'react'
import { StatGrid } from '../../../components/console/AdminUi'
import { formatCurrency } from '../utils/revenueUtils'

export function RevenueStats({ summary, todayGrowth }) {
  const stats = [
    {
      label: 'Tổng doanh thu',
      value: formatCurrency(summary.totalAllTimeRevenue),
      meta: 'Tổng doanh thu lũy kế toàn thời gian',
      icon: 'iconoir-coins',
    },
    {
      label: 'Doanh thu hôm nay',
      value: formatCurrency(summary.totalRevenueToday),
      meta: `So với hôm qua: ${todayGrowth >= 0 ? '+' : ''}${todayGrowth}%`,
      icon: 'iconoir-flash',
    },
    {
      label: 'Tỷ lệ chuyển đổi',
      value: `${summary.conversionRate}%`,
      meta: 'Tỷ lệ người dùng chuyển sang gói Premium',
      icon: 'iconoir-percentage-circle',
    },
    {
      label: 'ARPU (Trung bình/User)',
      value: formatCurrency(summary.arpu),
      meta: 'Doanh thu trung bình mỗi khách hàng',
      icon: 'iconoir-coin-slash',
    },
  ]

  return <StatGrid items={stats} />
}
