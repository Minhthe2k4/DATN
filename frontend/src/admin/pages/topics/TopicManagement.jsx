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

export function TopicManagement() {
  const [topicRows, setTopicRows] = useState(topicSeed)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const [statsData, setStatsData] = useState(null)

  useEffect(() => {
    let isDisposed = false

    async function loadData() {
      try {
        const [topicResponse, statsResponse] = await Promise.all([
          adminFetch(`/api/admin/topics`),
          adminFetch(`/api/admin/reports/content-summary`),
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

        if (Array.isArray(topicPayload)) {
          setTopicRows(topicPayload.map(normalizeTopicRow))
        }
        if (statsPayload) {
          setStatsData(statsPayload.topic)
        }
        setLoadError('')
      } catch {
        if (isDisposed) return
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