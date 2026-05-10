import React from 'react'
import { AdminSectionCard, Badge, SimpleTable } from '../../../components/console/AdminUi'
import { auditActionTone } from '../premiumUtils'
import { BarChart3, Search } from 'lucide-react'

export function PremiumAuditLogsTable({ filteredAudit, auditQuery, setAuditQuery }) {
  return (
    <AdminSectionCard>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h5 style={{ margin: 0 }}>
            <span className="section-header-icon"><BarChart3 size={18} /></span> Lịch sử thao tác
          </h5>
          <p style={{ margin: 0, marginTop: '0.25rem' }}>Theo dõi các hành động quản trị Premium ({filteredAudit.length} bản ghi)</p>
        </div>
        <div className="position-relative">
          <Search size={14} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
          <input
            type="search"
            className="form-control form-control-sm rounded-pill bg-light border-1 ps-5 pe-3 shadow-sm"
            style={{ width: '240px', borderColor: '#cbd5e1', height: '32px', fontSize: '0.8rem' }}
            placeholder="Tìm email, hành động..."
            value={auditQuery}
            onChange={(e) => setAuditQuery(e.target.value)}
          />
        </div>
      </div>
      <hr className="my-3" />
      <SimpleTable
        columns={[
          { key: 'createdAt', label: 'Thời gian', render: r => <small>{r.createdAt}</small> },
          { key: 'email', label: 'Email', render: r => <small>{r.email}</small> },
          { key: 'action', label: 'Hành động', render: r => <Badge tone={auditActionTone(r.action)}>{r.action}</Badge> },
          { key: 'adminActor', label: 'Admin', render: r => <small>{r.adminActor}</small> },
          { key: 'reason', label: 'Lý do', render: r => <small>{r.reason}</small> },
        ]}
        rows={filteredAudit}
        emptyMessage="Chưa có hoạt động nào được ghi nhận"
      />
    </AdminSectionCard>
  )
}
