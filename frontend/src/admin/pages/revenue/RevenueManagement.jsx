import { useEffect, useMemo, useState } from 'react'
import {
  monthlyRevenueTrend,
  revenueByPlan,
  revenueSummary,
  revenueTransactions,
} from '../../data/adminData'
import {
  AdminPageHeader,
  AdminSectionCard,
  Badge,
  LineTrend,
  SimpleTable,
  StatGrid,
} from '../../components/console/AdminUi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

function formatDateTime(value) {
  if (!value) {
    return '---'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '---'
  }
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCurrency(value) {
  return `${value.toLocaleString('en-US')} đ`
}

export function RevenueManagement() {
  const [summary, setSummary] = useState(revenueSummary)
  const [planRows, setPlanRows] = useState(revenueByPlan.map((item) => ({ ...item, net: item.gross - item.refunds })))
  const [trendRows, setTrendRows] = useState(monthlyRevenueTrend)
  const [transactionRows, setTransactionRows] = useState(revenueTransactions)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [transactionFilter, setTransactionFilter] = useState({ status: 'ALL', email: '', fromDate: '', toDate: '' })

  const monthGrowth = useMemo(() => {
    if (!summary.totalRevenueLastMonth) {
      return summary.totalRevenueThisMonth > 0 ? 100 : 0
    }
    return Math.round(
      ((summary.totalRevenueThisMonth - summary.totalRevenueLastMonth) / summary.totalRevenueLastMonth) *
        100
    )
  }, [summary.totalRevenueLastMonth, summary.totalRevenueThisMonth])

  const applyFallbackData = () => {
    setSummary(revenueSummary)
    setPlanRows(revenueByPlan.map((item) => ({ ...item, net: item.gross - item.refunds })))
    setTrendRows(monthlyRevenueTrend)
    setTransactionRows(revenueTransactions)
  }

  const reloadData = async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/revenue/overview`)
    if (!response.ok) {
      throw new Error('Cannot fetch revenue overview')
    }

    const payload = await response.json()
    const summaryPayload = payload?.summary
    setSummary({
      totalRevenueThisMonth: summaryPayload?.totalRevenueThisMonth ?? 0,
      totalRevenueLastMonth: summaryPayload?.totalRevenueLastMonth ?? 0,
      totalRefundThisMonth: summaryPayload?.totalRefundThisMonth ?? 0,
      arpu: summaryPayload?.arpu ?? 0,
      conversionRate: summaryPayload?.conversionRate ?? 0,
    })

    setPlanRows(
      Array.isArray(payload?.revenueByPlan)
        ? payload.revenueByPlan.map((item) => ({
            plan: item.plan,
            subscribers: item.subscribers,
            gross: item.gross,
            refunds: item.refunds,
            net: item.net,
          }))
        : []
    )

    setTrendRows(
      Array.isArray(payload?.monthlyRevenueTrend)
        ? payload.monthlyRevenueTrend.map((item) => ({
            label: item.label,
            revenue: item.revenue,
          }))
        : []
    )

    setTransactionRows(
      Array.isArray(payload?.transactions)
        ? payload.transactions.map((item) => ({
            id: item.id,
            email: item.email,
            plan: item.plan,
            amount: item.amount,
            gateway: item.gateway,
            status: item.status,
            createdAt: formatDateTime(item.createdAt),
          }))
        : []
    )
  }

  const reloadTransactions = async (filter = transactionFilter) => {
    const query = new URLSearchParams({ status: filter.status || 'ALL', limit: '100' })
    if (filter.email.trim()) {
      query.set('email', filter.email.trim())
    }
    if (filter.fromDate) {
      query.set('fromDate', filter.fromDate)
    }
    if (filter.toDate) {
      query.set('toDate', filter.toDate)
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/revenue/transactions?${query.toString()}`)
    if (!response.ok) {
      throw new Error('Cannot fetch revenue transactions')
    }

    const payload = await response.json()
    setTransactionRows(
      Array.isArray(payload)
        ? payload.map((item) => ({
            id: item.id,
            email: item.email,
            plan: item.plan,
            amount: item.amount,
            gateway: item.gateway,
            status: item.status,
            createdAt: formatDateTime(item.createdAt),
          }))
        : []
    )
  }

  useEffect(() => {
    let disposed = false

    async function loadData() {
      try {
        await reloadData()
        if (!disposed) {
          setLoadError('')
        }
      } catch {
        if (!disposed) {
          applyFallbackData()
          setLoadError('Không thể tải dữ liệu doanh thu từ backend, đang hiển thị dữ liệu mẫu.')
        }
      } finally {
        if (!disposed) {
          setIsLoading(false)
        }
      }
    }

    loadData()
    return () => {
      disposed = true
    }
  }, [])

  const handleExportCsv = () => {
    const header = ['id', 'email', 'plan', 'amount', 'gateway', 'status', 'createdAt']
    const rows = transactionRows.map((row) => [
      row.id,
      row.email,
      row.plan,
      row.amount,
      row.gateway,
      row.status,
      row.createdAt,
    ])

    const csv = [header, ...rows]
      .map((line) => line.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'revenue-report.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleApplyTransactionFilter = async () => {
    try {
      await reloadTransactions(transactionFilter)
      setLoadError('')
    } catch {
      setLoadError('Không thể lọc giao dịch doanh thu theo điều kiện đã chọn.')
    }
  }

  const handleResetTransactionFilter = async () => {
    const nextFilter = { status: 'ALL', email: '', fromDate: '', toDate: '' }
    setTransactionFilter(nextFilter)
    try {
      await reloadTransactions(nextFilter)
      setLoadError('')
    } catch {
      setLoadError('Không thể đặt lại bộ lọc giao dịch doanh thu.')
    }
  }

  const reconciliation = useMemo(() => {
    const total = transactionRows.length
    const success = transactionRows.filter((item) => item.status === 'Thành công').length
    const refund = transactionRows.filter((item) => item.status === 'Hoàn tiền').length
    const pending = transactionRows.filter((item) => item.status === 'Đang xử lý').length
    return { total, success, refund, pending }
  }, [transactionRows])

  const trendChartRows = useMemo(
    () => trendRows.map((item) => ({ ...item, revenueInMillions: Number(item.revenue ?? 0) / 1000000 })),
    [trendRows]
  )

  const stats = [
    {
      label: 'Doanh thu tháng này',
      value: formatCurrency(summary.totalRevenueThisMonth),
      meta: `So với tháng trước: ${monthGrowth >= 0 ? '+' : ''}${monthGrowth}%`,
      icon: 'iconoir-wallet-solid',
    },
    {
      label: 'Hoàn tiền tháng này',
      value: formatCurrency(summary.totalRefundThisMonth),
      meta: 'Theo dõi rủi ro giao dịch và chất lượng vận hành',
      icon: 'iconoir-undo-circle',
    },
    {
      label: 'ARPU ước tính',
      value: formatCurrency(summary.arpu),
      meta: 'Doanh thu trung bình trên mỗi người dùng trả phí',
      icon: 'iconoir-coin-slash',
    },
    {
      label: 'Tỷ lệ chuyển đổi Premium',
      value: `${summary.conversionRate}%`,
      meta: 'Tỷ lệ user free chuyển thành user trả phí',
      icon: 'iconoir-percentage-circle',
    },
  ]

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Revenue Ops"
          title="Quản lý doanh thu"
          description="Theo dõi doanh thu Premium, hoàn tiền và hiệu quả chuyển đổi để ra quyết định vận hành thương mại."
          actions={
            <>
              <button type="button" className="btn btn-primary revenue-btn" onClick={handleExportCsv}>Xuất báo cáo doanh thu</button>
              <button
                type="button"
                className="btn btn-outline-primary revenue-btn revenue-btn--ghost"
                onClick={() => {
                  setIsLoading(true)
                  reloadData()
                    .then(() => setLoadError(''))
                    .catch(() => setLoadError('Không thể làm mới dữ liệu doanh thu.'))
                    .finally(() => setIsLoading(false))
                }}
              >
                Làm mới dữ liệu
              </button>
            </>
          }
        />

        <StatGrid items={stats} />
        {isLoading ? <div className="alert alert-info mt-3 mb-0">Đang tải dữ liệu doanh thu...</div> : null}
        {loadError ? <div className="alert alert-warning mt-3 mb-0">{loadError}</div> : null}

        <div className="row g-3 mt-1">
          <div className="col-12 col-xl-6">
            <AdminSectionCard
              title="Doanh thu theo gói Premium"
              description="Đánh giá doanh thu gộp, hoàn tiền và doanh thu ròng theo từng gói dịch vụ."
            >
              <SimpleTable
                columns={[
                  { key: 'plan', label: 'Gói' },
                  { key: 'subscribers', label: 'Số thuê bao' },
                  { key: 'gross', label: 'Doanh thu gộp', render: (row) => formatCurrency(row.gross) },
                  { key: 'refunds', label: 'Hoàn tiền', render: (row) => formatCurrency(row.refunds) },
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

          <div className="col-12 col-xl-6">
            <AdminSectionCard
              title="Xu hướng doanh thu 6 tháng"
              description="Dữ liệu tổng hợp theo tháng, phục vụ theo dõi đà tăng trưởng doanh thu."
            >
              <div className="admin-kicker">Biểu đồ đường - đơn vị: triệu đồng</div>
              <LineTrend data={trendChartRows} valueKey="revenueInMillions" />
              <div className="mt-3">
                <SimpleTable
                  columns={[
                    { key: 'label', label: 'Tháng' },
                    {
                      key: 'revenue',
                      label: 'Doanh thu',
                      render: (row) => formatCurrency(row.revenue),
                    },
                  ]}
                  rows={trendRows}
                />
              </div>
            </AdminSectionCard>
          </div>

          <div className="col-12">
            <AdminSectionCard
              title="Giao dịch gần đây"
              description="Danh sách giao dịch gần nhất để theo dõi trạng thái thanh toán và xử lý bất thường."
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
                    <label htmlFor="revenue-email-filter" className="form-label">Email</label>
                    <input
                      id="revenue-email-filter"
                      className="form-control form-control-sm"
                      placeholder="Tìm email"
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
                      Lọc
                    </button>
                    <button type="button" className="btn btn-sm btn-outline-primary revenue-btn revenue-btn--ghost" onClick={handleResetTransactionFilter}>
                      Reset
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
                    { key: 'email', label: 'Email' },
                    { key: 'plan', label: 'Gói' },
                    { key: 'amount', label: 'Số tiền', render: (row) => formatCurrency(row.amount) },
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
                  rows={transactionRows}
                />
              </div>
            </AdminSectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}
