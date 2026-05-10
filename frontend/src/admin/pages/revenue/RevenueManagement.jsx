import { useEffect, useMemo, useState } from 'react'
import {
  monthlyRevenueTrend,
  revenueByPlan,
  revenueSummary,
  revenueTransactions,
} from '../../data/adminData'
import {
  AdminPageHeader,
} from '../../components/console/AdminUi'
import { usePagination } from '../../hooks/usePagination'

import { 
  fetchRevenueOverview, 
  fetchRevenueTransactions, 
  exportTransactionsToCsv,
  normalizeSummary,
  normalizePlanRows,
  normalizeTransactionRows
} from './utils/revenueUtils'

import { RevenueStats } from './components/RevenueStats'
import { RevenueTrendsChart } from './components/RevenueTrendsChart'
import { RevenuePlansTable } from './components/RevenuePlansTable'
import { RevenueTransactionsSection } from './components/RevenueTransactionsSection'

export function RevenueManagement() {
  const [summary, setSummary] = useState({
    ...revenueSummary,
    totalRevenueToday: 0,
    totalRevenueYesterday: 0,
    totalAllTimeRevenue: 0
  })
  const [planRows, setPlanRows] = useState(revenueByPlan.map((item) => ({ ...item, net: item.gross - item.refunds })))
  
  // Trends
  const [dailyTrend, setDailyTrend] = useState([])
  const [monthlyTrend, setMonthlyTrend] = useState(monthlyRevenueTrend)
  const [yearlyTrend, setYearlyTrend] = useState([])
  
  const [activeTrend, setActiveTrend] = useState('MONTH') // DAY, MONTH, YEAR

  const [transactionRows, setTransactionRows] = useState(revenueTransactions)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [transactionFilter, setTransactionFilter] = useState({ status: 'ALL', email: '', fromDate: '', toDate: '' })

  const todayGrowth = useMemo(() => {
    if (!summary.totalRevenueYesterday) {
      return summary.totalRevenueToday > 0 ? 100 : 0
    }
    return Math.round(
      ((summary.totalRevenueToday - summary.totalRevenueYesterday) / summary.totalRevenueYesterday) *
        100
    )
  }, [summary.totalRevenueToday, summary.totalRevenueYesterday])

  const applyFallbackData = () => {
    setSummary({
      ...revenueSummary,
      totalRevenueToday: 0,
      totalRevenueYesterday: 0,
      totalAllTimeRevenue: 0
    })
    setPlanRows(revenueByPlan.map((item) => ({ ...item, net: item.gross - item.refunds })))
    setMonthlyTrend(monthlyRevenueTrend)
    setTransactionRows(revenueTransactions)
  }

  const reloadData = async () => {
    const payload = await fetchRevenueOverview()
    setSummary(normalizeSummary(payload))
    setPlanRows(normalizePlanRows(payload))

    setDailyTrend(
      (payload?.dailyRevenueTrend || []).map((item) => {
        const today = new Date()
        const todayStr = `${today.getDate()}/${today.getMonth() + 1}`
        return {
          ...item,
          label: item.label === todayStr ? `${item.label} (Hôm nay)` : item.label
        }
      })
    )
    setMonthlyTrend(payload?.monthlyRevenueTrend || [])
    setYearlyTrend(payload?.yearlyRevenueTrend || [])
    setTransactionRows(normalizeTransactionRows(payload))
  }

  const reloadTransactions = async (filter = transactionFilter) => {
    const payload = await fetchRevenueTransactions(filter)
    setTransactionRows(normalizeTransactionRows(payload))
  }

  useEffect(() => {
    let disposed = false

    async function loadData() {
      try {
        await reloadData()
        if (!disposed) setLoadError('')
      } catch {
        if (!disposed) {
          applyFallbackData()
          setLoadError('Không thể tải dữ liệu doanh thu từ backend, đang hiển thị dữ liệu mẫu.')
        }
      } finally {
        if (!disposed) setIsLoading(false)
      }
    }

    loadData()
    return () => { disposed = true }
  }, [])

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

  const currentTrendData = useMemo(() => {
    let raw = activeTrend === 'DAY' ? dailyTrend : activeTrend === 'YEAR' ? yearlyTrend : monthlyTrend
    return raw.map((item) => ({ 
        ...item, 
        revenueInMillions: Number(item.revenue ?? 0) / 1000000 
    }))
  }, [activeTrend, dailyTrend, monthlyTrend, yearlyTrend])

  const pagination = usePagination(transactionRows, 15)

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Revenue Ops"
          title="Quản lý doanh thu"
          description="Phân tích hiệu quả kinh doanh qua các biểu đồ tương tác theo ngày, tháng, năm."
          actions={
            <>
              <button type="button" className="btn btn-primary revenue-btn" onClick={() => exportTransactionsToCsv(transactionRows)}>Xuất báo cáo</button>
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
                Làm mới
              </button>
            </>
          }
        />

        <RevenueStats summary={summary} todayGrowth={todayGrowth} />
        {isLoading && <div className="alert alert-info mt-3 mb-0">Đang tải dữ liệu doanh thu...</div>}
        {loadError && <div className="alert alert-warning mt-3 mb-0">{loadError}</div>}

        <div className="row g-3 mt-1">
          <RevenueTrendsChart 
            activeTrend={activeTrend} 
            setActiveTrend={setActiveTrend} 
            currentTrendData={currentTrendData} 
          />
          <RevenuePlansTable planRows={planRows} />
          <RevenueTransactionsSection 
            transactionFilter={transactionFilter}
            setTransactionFilter={setTransactionFilter}
            handleApplyTransactionFilter={handleApplyTransactionFilter}
            handleResetTransactionFilter={handleResetTransactionFilter}
            reconciliation={reconciliation}
            pagination={pagination}
          />
        </div>
      </div>
    </div>
  )
}
