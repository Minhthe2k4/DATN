import { useEffect, useMemo, useState } from 'react'
import { adminSummary, trendSeries } from '../../data/adminData'
import { 
  AdminPageHeader, 
} from '../../components/console/AdminUi'
import { RefreshCw } from 'lucide-react'
import { adminFetch } from '../../utils/api'

import { LearningStats } from './components/LearningStats'
import { LearningPerformanceCharts } from './components/LearningPerformanceCharts'
import { LearningKPIs } from './components/LearningKPIs'

export function LearningManagement() {
  const [statsData, setStatsData] = useState({
    dailyReviews: adminSummary.dailyReviews,
    wordsInReview: adminSummary.wordsInReview,
    scheduledReviews: adminSummary.scheduledReviews,
    masteredWords: adminSummary.masteredWords,
    lessonCompletionRate: adminSummary.lessonCompletionRate,
    averageAccuracyRate: adminSummary.averageAccuracyRate,
    dailyWordsLearned: adminSummary.dailyWordsLearned,
  })
  const [trends, setTrends] = useState(trendSeries)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const kpiMetrics = useMemo(() => [
    {
      label: 'Hoàn thành bài học',
      value: `${statsData.lessonCompletionRate}%`,
      hint: 'Tỷ lệ người dùng hoàn thành toàn bộ nội dung bài học.',
    },
    {
      label: 'Độ chính xác trung bình',
      value: `${statsData.averageAccuracyRate}%`,
      hint: 'Tỷ lệ trả lời đúng trong các bài tập ôn luyện.',
    },
    {
      label: 'Từ vựng mới mỗi ngày',
      value: statsData.dailyWordsLearned.toLocaleString(),
      hint: 'Số lượng từ vựng trung bình người dùng học mới mỗi ngày.',
    },
    {
      label: 'Sức tải hệ thống SRS',
      value: statsData.dailyReviews.toLocaleString(),
      hint: 'Tổng số phiên ôn tập được tạo ra trên toàn hệ thống.',
    },
  ], [statsData])

  const reloadData = async () => {
    try {
      const response = await adminFetch(`/api/admin/spaced-repetition/learning-overview`)
      if (!response.ok) throw new Error('Cannot fetch reports')
      const payload = await response.json()
      
      const summary = payload?.summary
      if (summary) {
        setStatsData({
          dailyReviews: summary.dailyReviews,
          wordsInReview: summary.wordsInReview,
          scheduledReviews: summary.scheduledReviews,
          masteredWords: summary.masteredWords,
          lessonCompletionRate: summary.lessonCompletionRate,
          averageAccuracyRate: summary.averageAccuracyRate,
          dailyWordsLearned: summary.dailyWordsLearned,
        })
      }

      if (Array.isArray(payload?.trendSeries)) {
        setTrends(payload.trendSeries)
      }
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  useEffect(() => {
    let disposed = false
    async function init() {
      try {
        await reloadData()
        if (!disposed) setLoadError('')
      } catch {
        if (!disposed) setLoadError('Không thể tải dữ liệu học tập từ backend, đang hiển thị dữ liệu mẫu.')
      } finally {
        if (!disposed) setIsLoading(false)
      }
    }
    init()
    return () => { disposed = true }
  }, [])

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Learning Analytics & Operations"
          title="Quản lý học tập"
          description="Theo dõi hiệu suất học tập toàn diện và đánh giá tiến độ của cộng đồng người học."
          actions={
            <button
              type="button"
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              onClick={() => {
                setIsLoading(true)
                reloadData().then(() => setLoadError('')).finally(() => setIsLoading(false))
              }}
            >
              <RefreshCw size={18} className={isLoading ? 'spin' : ''} /> Làm mới báo cáo
            </button>
          }
        />

        <LearningStats statsData={statsData} />
        
        {loadError && <div className="alert alert-warning mt-3">{loadError}</div>}

        <div className="row g-3 mt-1">
          <LearningPerformanceCharts trends={trends} />
          <LearningKPIs kpiMetrics={kpiMetrics} />
        </div>
      </div>
    </div>
  )
}