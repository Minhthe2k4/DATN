import { adminFetch } from '../../../utils/api'

export function formatDateTime(value) {
  if (!value) return '---'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '---'
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatCurrency(value) {
  if (value === undefined || value === null) return '0 đ'
  return `${value.toLocaleString('vi-VN')} đ`
}

export async function fetchRevenueOverview() {
  const response = await adminFetch(`/api/admin/revenue/overview`)
  if (!response.ok) throw new Error('Cannot fetch revenue overview')
  return await response.json()
}

export async function fetchRevenueTransactions(filter) {
  const query = new URLSearchParams({ status: filter.status || 'ALL', limit: '100' })
  if (filter.email.trim()) query.set('email', filter.email.trim())
  if (filter.fromDate) query.set('fromDate', filter.fromDate)
  if (filter.toDate) query.set('toDate', filter.toDate)

  const response = await adminFetch(`/api/admin/revenue/transactions?${query.toString()}`)
  if (!response.ok) throw new Error('Cannot fetch revenue transactions')
  return await response.json()
}

export function exportTransactionsToCsv(transactionRows) {
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

export function normalizeSummary(payload) {
  const s = payload?.summary
  return {
    totalRevenueToday: s?.totalRevenueToday ?? 0,
    totalRevenueYesterday: s?.totalRevenueYesterday ?? 0,
    totalRevenueThisMonth: s?.totalRevenueThisMonth ?? 0,
    totalRevenueLastMonth: s?.totalRevenueLastMonth ?? 0,
    totalRefundThisMonth: s?.totalRefundThisMonth ?? 0,
    totalAllTimeRevenue: s?.totalAllTimeRevenue ?? 0,
    arpu: s?.arpu ?? 0,
    conversionRate: s?.conversionRate ?? 0,
  }
}

export function normalizePlanRows(payload) {
  return Array.isArray(payload?.revenueByPlan)
    ? payload.revenueByPlan.map((item) => ({
        plan: item.plan,
        subscribers: item.subscribers,
        gross: item.gross,
        refunds: item.refunds,
        net: item.net,
      }))
    : []
}

export function normalizeTransactionRows(payload) {
  const data = Array.isArray(payload) ? payload : (Array.isArray(payload?.transactions) ? payload.transactions : [])
  return data.map((item) => ({
    id: item.id,
    email: item.email,
    plan: item.plan,
    amount: item.amount,
    gateway: item.gateway,
    status: item.status,
    createdAt: formatDateTime(item.createdAt),
  }))
}
