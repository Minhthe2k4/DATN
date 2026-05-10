import React from 'react'
import { AdminSectionCard, SimpleTable } from '../../../components/console/AdminUi'
import { formatCurrency } from '../utils/revenueUtils'

export function RevenuePlansTable({ planRows }) {
  return (
    <div className="col-12 col-xl-4">
      <AdminSectionCard
        title="Gói Premium bán chạy"
        description="Phân bổ doanh thu theo từng gói dịch vụ."
      >
        <SimpleTable
          columns={[
            { key: 'plan', label: 'Gói' },
            { key: 'subscribers', label: 'Lượt mua' },
            {
              key: 'net',
              label: 'Doanh thu ròng',
              render: (row) => <strong>{formatCurrency(row.net)}</strong>,
            },
          ]}
          rows={planRows}
        />
      </AdminSectionCard>
    </div>
  )
}
