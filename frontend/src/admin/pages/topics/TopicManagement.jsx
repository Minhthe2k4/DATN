import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { topics as topicSeed } from '../../data/adminData'
import { AdminPageHeader } from '../../components/console/AdminUi'
import { usePagination } from '../../hooks/usePagination'
import { adminFetch } from '../../utils/api'

import { TopicStats } from './components/TopicStats'
import { TopicCharts } from './components/TopicCharts'
import { TopicTable } from './components/TopicTable'

function normalizeTopicRow(row) {
  return {
    id: row.id,
    name: row.name ?? '',
    description: row.description ?? '',
    lessons: row.lessons ?? 0,
    status: row.status ?? 'Hoạt động',
    topicImage: row.topicImage ?? '',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  }
}

/**
 * Component quản lý danh sách chủ đề bài học dành cho Admin.
 * Cho phép xem thống kê, tìm kiếm, lọc và điều hướng đến trang tạo mới/chỉnh sửa chủ đề.
 */
export function TopicManagement() {
  // Danh sách dòng dữ liệu chủ đề hiển thị trên bảng
  const [topicRows, setTopicRows] = useState(topicSeed)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  
  // Các trạng thái phục vụ bộ lọc (Search & Filter)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Dữ liệu thống kê tổng quan (số lượng chủ đề, tỉ lệ bài học)
  const [statsData, setStatsData] = useState(null)

  useEffect(() => {
    let isDisposed = false

    /**
     * Tải dữ liệu chủ đề và thống kê từ Backend.
     * Sử dụng Promise.all để tối ưu hóa thời gian tải bằng cách gọi song song các API.
     */
    async function loadData() {
      try {
        const [topicResponse, statsResponse] = await Promise.all([
          adminFetch(`/api/admin/topics`),             // Lấy danh sách toàn bộ chủ đề
          adminFetch(`/api/admin/reports/content-summary`), // Lấy báo cáo thống kê nội dung
        ])

        if (!topicResponse.ok) {
          throw new Error(`Cannot fetch topics: ${topicResponse.status}`)
        }

        const topicPayload = await topicResponse.json()
        let statsPayload = null
        if (statsResponse.ok) {
          statsPayload = await statsResponse.json()
        }

        if (isDisposed) return

        // Cập nhật danh sách chủ đề (thực hiện chuẩn hóa dữ liệu trước khi set state)
        if (Array.isArray(topicPayload)) {
          setTopicRows(topicPayload.map(normalizeTopicRow))
        }
        // Cập nhật số liệu thống kê cho Dashboard con
        if (statsPayload) {
          setStatsData(statsPayload.topic)
        }
        setLoadError('')
      } catch {
        if (isDisposed) return
        // Dự phòng (Fallback): Nếu Backend lỗi, hiển thị dữ liệu mẫu để Admin vẫn thấy được giao diện
        setTopicRows(topicSeed)
        setLoadError('Không thể tải danh sách chủ đề từ backend, đang hiển thị dữ liệu mẫu.')
      } finally {
        if (!isDisposed) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isDisposed = true
    }
  }, [])

  const distributionData = useMemo(() => {
    return topicRows
      .filter(t => t.lessons > 0)
      .map(t => ({
        name: t.name,
        value: t.lessons
      }))
      .sort((a, b) => b.value - a.value)
  }, [topicRows])

  const filteredTopics = useMemo(() => {
    let result = topicRows

    if (statusFilter !== 'All') {
      result = result.filter(topic => topic.status === statusFilter)
    }

    const term = searchTerm.toLowerCase().trim()
    if (term) {
      result = result.filter((topic) =>
        topic.name.toLowerCase().includes(term) ||
        topic.description.toLowerCase().includes(term)
      )
    }

    return result
  }, [topicRows, searchTerm, statusFilter])

  const pagination = usePagination(filteredTopics, 10)

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Content Management"
          title="Quản lý chủ đề"
          description="Tổ chức hệ thống chủ đề để đồng bộ việc quản lý bài học và tư liệu học tập."
          actions={
            <div className="d-flex gap-2">
              <Link to="/admin/topics/new" className="btn btn-primary d-flex align-items-center gap-2">
                <Plus size={18} /> Thêm chủ đề
              </Link>
            </div>
          }
        />

        {isLoading ? <div className="alert alert-light border">Đang tải dữ liệu...</div> : null}
        {loadError ? <div className="alert alert-warning border">{loadError}</div> : null}

        <TopicStats statsData={statsData} topicRows={topicRows} />

        <TopicCharts distributionData={distributionData} topicRows={topicRows} />

        <TopicTable
          pagination={pagination}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          filteredCount={filteredTopics.length}
        />
      </div>
    </div>
  )
}