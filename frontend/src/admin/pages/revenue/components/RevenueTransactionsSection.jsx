import React from 'react'
import { AdminSectionCard, SimpleTable, Badge, Pagination } from '../../../components/console/AdminUi'
import { formatCurrency } from '../utils/revenueUtils'

export function RevenueTransactionsSection({
  transactionFilter,
  setTransactionFilter,
  handleApplyTransactionFilter,
  handleResetTransactionFilter,
  reconciliation,
  pagination
}) {
  return (
    <div className="col-12">
      <AdminSectionCard
        title="Lịch sử giao dịch"
        description="Danh sách các giao dịch thanh toán Premium gần đây trên hệ thống."
        className="revenue-transactions-card"
      >
        <div className="revenue-transactions-toolbar mb-3">
          <div className="revenue-transactions-toolbar__heading">Bộ lọc giao dịch</div>
          <div className="revenue-transactions-toolbar__grid">
            <div className="revenue-transactions-toolbar__field">
              <label htmlFor="revenue-status-filter" className="form-label">Trạng thái</label>
              <select
                id="revenue-status-filter"
                className="form-select form-select-sm"
                value={transactionFilter.status}
                onChange={(event) => setTransactionFilter((prev) => ({ ...prev, status: event.target.value }))}
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="SUCCESS">Thành công</option>
                <option value="REFUND">Hoàn tiền</option>
                <option value="PENDING">Đang xử lý</option>
              </select>
            </div>
            <div className="revenue-transactions-toolbar__field">
              <label htmlFor="revenue-email-filter" className="form-label">Email khách hàng</label>
              <input
                id="revenue-email-filter"
                className="form-control form-control-sm"
                placeholder="Tìm theo email"
                value={transactionFilter.email}
                onChange={(event) => setTransactionFilter((prev) => ({ ...prev, email: event.target.value }))}
              />
            </div>
            <div className="revenue-transactions-toolbar__field">
              <label htmlFor="revenue-from-date" className="form-label">Từ ngày</label>
              <input
                id="revenue-from-date"
                type="date"
                className="form-control form-control-sm"
                value={transactionFilter.fromDate}
                onChange={(event) => setTransactionFilter((prev) => ({ ...prev, fromDate: event.target.value }))}
              />
            </div>
            <div className="revenue-transactions-toolbar__field">
              <label htmlFor="revenue-to-date" className="form-label">Đến ngày</label>
              <input
                id="revenue-to-date"
                type="date"
                className="form-control form-control-sm"
                value={transactionFilter.toDate}
                onChange={(event) => setTransactionFilter((prev) => ({ ...prev, toDate: event.target.value }))}
              />
            </div>
            <div className="revenue-transactions-toolbar__actions">
              <button type="button" className="btn btn-sm btn-primary revenue-btn" onClick={handleApplyTransactionFilter}>
                Áp dụng
              </button>
              <button type="button" className="btn btn-sm btn-outline-primary revenue-btn revenue-btn--ghost" onClick={handleResetTransactionFilter}>
                Làm mới
              </button>
            </div>
          </div>
        </div>
        <div className="revenue-transactions-kpi mb-3">
          <div className="revenue-transactions-kpi__item is-info">
            <span>Tổng giao dịch</span>
            <strong>{reconciliation.total}</strong>
          </div>
          <div className="revenue-transactions-kpi__item is-success">
            <span>Thành công</span>
            <strong>{reconciliation.success}</strong>
          </div>
          <div className="revenue-transactions-kpi__item is-danger">
            <span>Hoàn tiền</span>
            <strong>{reconciliation.refund}</strong>
          </div>
          <div className="revenue-transactions-kpi__item is-warning">
            <span>Đang xử lý</span>
            <strong>{reconciliation.pending}</strong>
          </div>
        </div>
        <div className="revenue-transactions-table-wrap">
          <SimpleTable
            columns={[
              { key: 'id', label: 'Mã giao dịch' },
              { key: 'email', label: 'Email khách hàng' },
              { key: 'plan', label: 'Gói dịch vụ' },
              { key: 'amount', label: 'Số tiền', render: (row) => <strong>{formatCurrency(row.amount)}</strong> },
              { key: 'gateway', label: 'Cổng thanh toán' },
              {
                key: 'status',
                label: 'Trạng thái',
                render: (row) => {
                  const tone =
                    row.status === 'Thành công'
                      ? 'success'
                      : row.status === 'Hoàn tiền'
                        ? 'danger'
                        : 'warning'
                  return <Badge tone={tone}>{row.status}</Badge>
                },
              },
              { key: 'createdAt', label: 'Thời gian' },
            ]}
            rows={pagination.paginatedData}
          />
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.handlePageChange}
          />
        </div>
      </AdminSectionCard>
    </div>
  )
}
