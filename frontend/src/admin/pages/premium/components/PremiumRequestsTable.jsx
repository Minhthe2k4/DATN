import React from 'react'
import { AdminSectionCard, Badge, SimpleTable, FilterTabs, Pagination } from '../../../components/console/AdminUi'
import { requestStatusTone } from '../premiumUtils'
import { ClipboardList, Search, Check, X, CheckCircle } from 'lucide-react'

export function PremiumRequestsTable({
  requestsPagination,
  requestFilter,
  setRequestFilter,
  requestsQuery,
  setRequestsQuery,
  handleApprove,
  handleReject
}) {
  return (
    <AdminSectionCard>
      <h5><span className="section-header-icon"><ClipboardList size={18} /></span> Yêu cầu nâng cấp</h5>
      <p>Duyệt các yêu cầu từ người dùng ({requestsPagination.totalItems} bản ghi)</p>

      <div className="mb-3 d-flex flex-wrap gap-2 justify-content-between align-items-center">
        <div style={{ flex: '1 1 200px' }}>
          <FilterTabs
            items={[
              { label: 'Tất cả', value: 'ALL' },
              { label: 'Chờ duyệt', value: 'PENDING' },
              { label: 'Đã duyệt', value: 'APPROVED' },
              { label: 'Từ chối', value: 'REJECTED' }
            ]}
            active={requestFilter.status}
            onChange={(val) => setRequestFilter(prev => ({ ...prev, status: val }))}
          />
        </div>
        <div className="position-relative" style={{ flex: '0 1 220px' }}>
          <Search size={14} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
          <input
            type="search"
            className="form-control form-control-sm rounded-pill bg-light border-1 ps-5 pe-3 shadow-sm"
            style={{ borderColor: '#cbd5e1', height: '32px', fontSize: '0.8rem' }}
            placeholder="Tìm email, gói..."
            value={requestsQuery}
            onChange={(e) => setRequestsQuery(e.target.value)}
          />
        </div>
      </div>

      <hr className="my-3" />
      <SimpleTable
        columns={[
          { key: 'email', label: 'Email', render: r => <small>{r.email}</small> },
          { key: 'packageName', label: 'Gói' },
          { key: 'requestedAt', label: 'Ngày gửi', render: r => <small>{r.requestedAt}</small> },
          { key: 'status', label: 'Trạng thái', render: r => <Badge tone={requestStatusTone(r.status)}>{r.status}</Badge> },
          {
            key: 'actions', label: '', render: r => (
              r.status === 'Chờ duyệt' ? (
                <div className="premium-row-actions">
                  <button className="btn btn-sm btn-success" onClick={() => handleApprove(r)} title="Duyệt">
                    <Check size={14} />
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleReject(r)} title="Từ chối">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="text-center text-muted" title="Đã xử lý">
                  <small><CheckCircle size={14} /></small>
                </div>
              )
            )
          },
        ]}
        rows={requestsPagination.paginatedData}
        emptyMessage="Không có yêu cầu nào trùng khớp"
      />
      <Pagination
        currentPage={requestsPagination.currentPage}
        totalPages={requestsPagination.totalPages}
        onPageChange={requestsPagination.handlePageChange}
      />
    </AdminSectionCard>
  )
}
