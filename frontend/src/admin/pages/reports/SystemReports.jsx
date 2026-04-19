import { useEffect, useMemo, useState } from 'react'
import { adminSummary, trendSeries } from '../../data/adminData'
import {
  AdminPageHeader,
  AdminSectionCard,
  LineTrend,
  MetricList,
  StatGrid,
} from '../../components/console/AdminUi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

function buildFallbackReportData() {
  const kpiOverview = [
    {
      label: 'Tỷ lệ hoàn thành bài học',
      value: `${adminSummary.lessonCompletionRate}%`,
      hint: 'Chỉ số chất lượng mức tiến độ học.',
    },
    {
      label: 'Tỷ lệ trả lời đúng trung bình',
      value: `${adminSummary.averageAccuracyRate}%`,
      hint: 'Đánh giá độ chính xác kiến thức toàn hệ thống.',
    },
    {
      label: 'Lượng từ được học mỗi ngày',
      value: adminSummary.dailyWordsLearned.toLocaleString('en-US'),
      hint: 'Theo dõi cường độ hấp thụ kiến thức.',
    },
    {
      label: 'Tỷ lệ hoạt động người dùng',
      value: `${Math.round((adminSummary.activeUsers / adminSummary.totalUsers) * 100)}%`,
      hint: 'Tỷ lệ active users trên tổng người dùng.',
    },
  ]

  const stats = [
    {
      label: 'Tăng trưởng người dùng ngày',
      value: `+${adminSummary.newUsersToday.toLocaleString('en-US')}`,
      meta: 'Số lượng đăng ký mới ghi nhận trong ngày',
      icon: 'iconoir-user-plus-circle',
    },
    {
      label: 'Độ phủ nội dung học',
      value: `${adminSummary.totalWords.toLocaleString('en-US')} từ`,
      meta: `${adminSummary.totalLessons} bài học, ${adminSummary.totalReadings + adminSummary.totalVideos} tư liệu`,
      icon: 'iconoir-journal-page',
    },
    {
      label: 'Hiệu suất học tập',
      value: `${adminSummary.averageAccuracyRate}%`,
      meta: `${adminSummary.lessonCompletionRate}% hoàn thành bài học`,
      icon: 'iconoir-brain',
    },
    {
      label: 'Sức tải ôn tập SRS',
      value: adminSummary.dailyReviews.toLocaleString('en-US'),
      meta: `${adminSummary.scheduledReviews.toLocaleString('en-US')} từ đã được lên lịch`,
      icon: 'iconoir-timer',
    },
  ]

  return {
    kpiOverview,
    stats,
    trendSeries,
  }
}

export function SystemReports() {
  const fallbackData = useMemo(() => buildFallbackReportData(), [])
  const [reportData, setReportData] = useState(fallbackData)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let isDisposed = false

    async function loadReports() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/reports/overview`)
        if (!response.ok) {
          throw new Error(`Cannot fetch reports overview: ${response.status}`)
        }

        const payload = await response.json()
        if (isDisposed) {
          return
        }

        setReportData({
          stats: payload?.stats ?? fallbackData.stats,
          kpiOverview: payload?.kpiOverview ?? fallbackData.kpiOverview,
          trendSeries: payload?.trendSeries ?? fallbackData.trendSeries,
        })
        setLoadError('')
      } catch (error) {
        if (isDisposed) {
          return
        }

        setReportData(fallbackData)
        setLoadError('Không thể tải dữ liệu báo cáo từ backend, đang hiển thị dữ liệu mẫu.')
      } finally {
        if (!isDisposed) {
          setIsLoading(false)
        }
      }
    }

    loadReports()

    return () => {
      isDisposed = true
    }
  }, [fallbackData])

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Analytics"
          title="Phân tích & báo cáo hệ thống"
          description="Màn hình phân tích theo xu hướng và KPI để phục vụ đánh giá tuần/tháng, không dùng cho tác vụ xử lý tức thời."
          actions={
            <>
              <button type="button" className="btn btn-primary">Xuất PDF</button>
            </>
          }
        />

        {isLoading ? <div className="alert alert-light border">Đang tải dữ liệu báo cáo từ backend...</div> : null}
        {loadError ? <div className="alert alert-warning border">{loadError}</div> : null}

        <StatGrid items={reportData.stats} />

        <div className="row g-3 mt-1">
          <div className="col-12 col-xl-7">
            <AdminSectionCard title="Xu hướng dữ liệu 7 ngày" description="Phân tích tăng trưởng người dùng, nội dung và hoạt động học để so sánh biến động theo ngày.">
              <div className="row g-4">
                <div className="col-12 col-md-6">
                  <div className="admin-kicker">Tăng trưởng người dùng</div>
                  <LineTrend data={reportData.trendSeries} valueKey="users" />
                </div>
                <div className="col-12 col-md-6">
                  <div className="admin-kicker">Khối lượng từ mới</div>
                  <LineTrend data={reportData.trendSeries} valueKey="words" />
                </div>
                <div className="col-12 col-md-6">
                  <div className="admin-kicker">Sản lượng bài học</div>
                  <LineTrend data={reportData.trendSeries} valueKey="lessons" />
                </div>
                <div className="col-12 col-md-6">
                  <div className="admin-kicker">Tăng trưởng ôn tập SRS</div>
                  <LineTrend data={reportData.trendSeries} valueKey="reviews" />
                </div>
              </div>
            </AdminSectionCard>
          </div>
          <div className="col-12 col-xl-5">
            <AdminSectionCard title="KPI trọng tâm" description="Nhóm KPI dùng để đánh giá hiệu quả tổng thể của hệ thống theo kỳ báo cáo.">
              <MetricList items={reportData.kpiOverview} />
            </AdminSectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}