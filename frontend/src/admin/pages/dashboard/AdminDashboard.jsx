import { useEffect, useMemo, useState } from 'react'
import {
  fetchAdminSummary,
  fetchTrendSeries,
  fetchUserActivityLeaders,
  fetchTopics,
  fetchLessons,
  fetchReadingArticles,
  fetchUsers,
  fetchPremiumRequests,
} from '@/lib/api/admin-api'
import {
  AdminPageHeader,
  AdminSectionCard,
  Badge,
  Checklist,
  MetricList,
  QuickLinks,
  SimpleTable,
  StatGrid,
} from '../../components/console/AdminUi'

// Default governance checklist - can be hardcoded as it's a static checklist
const defaultGovernanceChecklist = [
  { task: 'Duyệt Premium (yêu cầu chờ)', completed: false },
  { task: 'Kiểm tra báo cáo lỗi từ người dùng', completed: false },
  { task: 'Cập nhật đạo tục hành chính', completed: false },
  { task: 'Sao lưu dữ liệu hàng ngày', completed: false },
]

function buildFallbackDashboardData() {
  return {
    stats: [
      {
        label: 'Người dùng đang hoạt động',
        value: '0',
        meta: 'Đang tải...',
        icon: 'iconoir-user-circle',
      },
      {
        label: 'Yêu cầu Premium chờ xử lý',
        value: '0',
        meta: 'Đang tải...',
        icon: 'iconoir-star',
      },
      {
        label: 'Nội dung cần rà soát',
        value: '0',
        meta: 'Đang tải...',
        icon: 'iconoir-edit-pencil',
      },
      {
        label: 'Tài khoản cần can thiệp',
        value: '0',
        meta: 'Đang tải...',
        icon: 'iconoir-warning-triangle',
      },
    ],
    dailyOperations: [
      {
        label: 'Buổi học phát sinh hôm nay',
        value: '0',
        hint: 'Đang tải...',
      },
      {
        label: 'Lượt xem lại trong ngày',
        value: '0',
        hint: 'Đang tải...',
      },
      {
        label: 'Người dùng mới trong ngày',
        value: '0',
        hint: 'Đang tải...',
      },
    ],
    moderationRows: [],
    premiumRequests: [],
    userActivityLeaders: [],
    governanceChecklist: defaultGovernanceChecklist,
  }
}

export function AdminDashboard() {
  const fallbackData = useMemo(() => buildFallbackDashboardData(), [])
  const [dashboardData, setDashboardData] = useState(fallbackData)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let isDisposed = false

    async function loadOverview() {
      try {
        // Fetch all-in-one overview data from backend
        const data = await fetchAdminSummary()

        if (isDisposed) return

        setDashboardData({
          stats: data.stats || fallbackData.stats,
          dailyOperations: data.dailyOperations || fallbackData.dailyOperations,
          moderationRows: data.moderationRows || [],
          premiumRequests: data.premiumRequests || [],
          userActivityLeaders: data.userActivityLeaders || [],
          governanceChecklist: data.governanceChecklist || defaultGovernanceChecklist,
        })
        setLoadError('')
      } catch (error) {
        if (isDisposed) return

        console.warn('Failed to load dashboard overview:', error)
        setDashboardData(fallbackData)
        setLoadError('Không thể tải dữ liệu backend, đang hiển thị dữ liệu mẫu.')
      } finally {
        if (!isDisposed) {
          setIsLoading(false)
        }
      }
    }

    loadOverview()

    return () => {
      isDisposed = true
    }
  }, [fallbackData])

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Operations"
          title="Tổng quan điều hành hằng ngày"
          description="Màn hình trực vận hành: ưu tiên việc cần xử lý ngay, tình trạng người dùng và hàng đợi nội dung."
          actions={
            <>
              <button type="button" className="btn btn-primary">Xuất báo cáo tuần</button>
              <button type="button" className="btn btn-outline-primary">Đi tới quản lý chủ đề</button>
            </>
          }
        />

        {isLoading ? <div className="alert alert-light border">Đang tải dữ liệu tổng quan từ backend...</div> : null}
        {loadError ? <div className="alert alert-warning border">{loadError}</div> : null}

        <StatGrid items={dashboardData.stats} />

        <div className="row g-3 mt-1">
          <div className="col-12 col-xl-7">
            <AdminSectionCard title="Điều phối nhanh" description="Lối tắt vào các khu vực bạn phải thao tác thường xuyên trong ca trực.">
              <QuickLinks
                links={[
                  {
                    to: '/admin/premium',
                    title: 'Duyệt Premium',
                    description: 'Xử lý yêu cầu chờ duyệt và đối soát thanh toán.',
                    icon: 'iconoir-star',
                  },
                  {
                    to: '/admin/topics',
                    title: 'Rà soát chủ đề',
                    description: 'Bật lại chủ đề tạm dừng hoặc tạo chủ đề mới.',
                    icon: 'iconoir-folder',
                  },
                  {
                    to: '/admin/users',
                    title: 'Can thiệp tài khoản',
                    description: 'Xử lý tài khoản bị khóa hoặc chờ xác minh.',
                    icon: 'iconoir-community',
                  },
                  {
                    to: '/admin/spaced-repetition',
                    title: 'Cấu hình SRS',
                    description: 'Kiểm tra tham số ôn tập trước giờ cao điểm.',
                    icon: 'iconoir-refresh-double',
                  },
                ]}
              />
            </AdminSectionCard>
          </div>
          <div className="col-12 col-xl-5">
            <AdminSectionCard title="Checklist ca trực" description="Danh sách kiểm tra trước khi kết thúc ca để tránh bỏ sót tác vụ quan trọng.">
              <Checklist items={dashboardData.governanceChecklist} />
            </AdminSectionCard>
          </div>
        </div>

        <div className="row g-3 mt-1">
          <div className="col-12 col-xl-7">
            <AdminSectionCard title="Yêu cầu Premium gần nhất" description="Theo dõi nhanh yêu cầu mới phát sinh để ưu tiên xử lý theo thời gian.">
              <SimpleTable
                columns={[
                  { key: 'email', label: 'Người dùng' },
                  { key: 'requestedAt', label: 'Thời điểm yêu cầu' },
                  { key: 'packageName', label: 'Gói đăng ký' },
                  {
                    key: 'status',
                    label: 'Trạng thái',
                    render: (row) => <Badge tone={row.status === 'Chờ duyệt' ? 'warning' : 'info'}>{row.status}</Badge>,
                  },
                ]}
                rows={dashboardData.premiumRequests}
              />
            </AdminSectionCard>
          </div>
          <div className="col-12 col-xl-5">
            <AdminSectionCard title="Khối nội dung chờ xử lý" description="Nội dung chưa sẵn sàng xuất bản cần biên tập hoặc kích hoạt lại.">
              <SimpleTable
                columns={[
                  { key: 'type', label: 'Loại' },
                  { key: 'name', label: 'Nội dung' },
                  {
                    key: 'state',
                    label: 'Trạng thái',
                    render: (row) => <Badge tone={row.state === 'Tạm dừng' ? 'warning' : 'neutral'}>{row.state}</Badge>,
                  },
                ]}
                rows={dashboardData.moderationRows}
                emptyMessage="Không có nội dung chờ xử lý."
              />
            </AdminSectionCard>
          </div>
        </div>

        <div className="row g-3 mt-1">
          <div className="col-12">
            <AdminSectionCard title="Người dùng hoạt động nổi bật" description="Khối tham khảo nhanh để nhận diện nhóm người học tích cực trong tuần.">
              <SimpleTable
                columns={[
                  { key: 'name', label: 'Người dùng' },
                  { key: 'streak', label: 'Chuỗi ngày học' },
                  { key: 'learnedWords', label: 'Số từ đã học' },
                  {
                    key: 'completion',
                    label: 'Mức hoàn thành',
                    render: (row) => <Badge tone="info">{row.completion}%</Badge>,
                  },
                ]}
                rows={dashboardData.userActivityLeaders}
              />
            </AdminSectionCard>
          </div>
        </div>

        <div className="row g-3 mt-1">
          <div className="col-12 col-xl-6">
            <AdminSectionCard title="Nhịp vận hành trong ngày" description="Các chỉ số nhịp độ để cân đối nguồn lực và thời gian phản hồi.">
              <MetricList items={dashboardData.dailyOperations} />
            </AdminSectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}
