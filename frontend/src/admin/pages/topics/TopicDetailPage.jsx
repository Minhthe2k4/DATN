import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AdminPageHeader, AdminSectionCard, Badge } from '../../components/console/AdminUi'

import { adminFetch } from '../../utils/api'

import { TopicInfoTable } from './components/TopicInfoTable'
import { TopicImageCard } from './components/TopicImageCard'

export function TopicDetailPage() {
  const { id } = useParams()
  const [topic, setTopic] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isDisposed = false
    async function loadTopic() {
      try {
        const response = await adminFetch(`/api/admin/topics/${id}`)
        if (!response.ok) throw new Error(`Cannot fetch topic ${id}`)
        const payload = await response.json()
        if (!isDisposed) setTopic(payload)
      } catch (err) {
        if (!isDisposed) setError('Không thể tải thông tin chủ đề.')
      } finally {
        if (!isDisposed) setIsLoading(false)
      }
    }
    loadTopic()
    return () => { isDisposed = true }
  }, [id])

  if (isLoading) return <div className="p-4">Đang tải dữ liệu...</div>
  if (error) return <div className="alert alert-danger m-4">{error}</div>
  if (!topic) return <div className="alert alert-warning m-4">Không tìm thấy chủ đề.</div>

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Topic Management"
          title={`Chi tiết chủ đề: ${topic.name}`}
          description="Xem chi tiết thông tin tất cả các trường trong hệ thống."
          actions={<Link to="/admin/topics" className="btn btn-outline-secondary">Quay lại danh sách</Link>}
        />

        <div className="row mt-4">
          <div className="col-12 col-xl-8">
            <AdminSectionCard title="Thông tin cơ bản">
              <TopicInfoTable topic={topic} />
            </AdminSectionCard>
          </div>
          <div className="col-12 col-xl-4">
            <AdminSectionCard title="Ảnh chủ đề">
              <TopicImageCard 
                topicImage={topic.topicImage} 
                topicName={topic.name} 
              />
            </AdminSectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}
