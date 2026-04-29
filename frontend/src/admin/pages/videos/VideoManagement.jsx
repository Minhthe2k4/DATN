import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { videoLessons, youtubeChannels } from '../../data/adminData'
import { AdminPageHeader, AdminSectionCard, Badge, SimpleTable, StatGrid, Pagination } from '../../components/console/AdminUi'
import { usePagination } from '../../hooks/usePagination'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

function normalizeChannelRow(row) {
  return {
    id: row.id,
    name: row.name ?? '',
    handle: row.handle ?? '',
    url: row.url ?? '',
    subscriberCount: row.subscriberCount ?? 0,
    videoCount: row.videoCount ?? 0,
    status: row.status ?? 'Hoạt động',
    avatar: row.avatar ?? '',
    createdAt: row.createdAt ?? '',
    updatedAt: row.updatedAt ?? '',
    deletedAt: row.deletedAt ?? null
  }
}

function normalizeVideoRow(row) {
  return {
    id: row.id,
    channelId: row.channelId ?? null,
    channelName: row.channelName ?? '',
    title: row.title ?? '',
    youtubeUrl: row.url ?? '',
    difficulty: row.difficulty ?? 'Trung bình',
    duration: row.duration ?? '',
    wordsHighlighted: row.wordsHighlighted ?? 0,
    status: row.status ?? 'Chờ biên tập',
    thumbnail: row.thumbnail ?? '',
    filePath: row.filePath ?? '',
    subtitleStatus: row.subtitleStatus ?? 'PENDING',
    createdAt: row.createdAt ?? '',
    updatedAt: row.updatedAt ?? '',
    deletedAt: row.deletedAt ?? null
  }
}

export function VideoManagement() {
  const navigate = useNavigate()
  const [channels, setChannels] = useState(youtubeChannels)
  const [videos, setVideos] = useState(videoLessons)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [searchChannelTerm, setSearchChannelTerm] = useState('')
  const [filterChannelId, setFilterChannelId] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesChannel = !filterChannelId || String(video.channelId) === String(filterChannelId)
      const matchesDifficulty = !filterDifficulty || video.difficulty === filterDifficulty
      const matchesStatus = !filterStatus || video.status === filterStatus
      return matchesSearch && matchesChannel && matchesDifficulty && matchesStatus
    })
  }, [videos, searchTerm, filterChannelId, filterDifficulty, filterStatus])

  const filteredChannels = useMemo(() => {
    return channels.filter((c) => c.name.toLowerCase().includes(searchChannelTerm.toLowerCase()))
  }, [channels, searchChannelTerm])

  const videosPagination = usePagination(filteredVideos, 10)
  const channelsPagination = usePagination(filteredChannels, 10)

  useEffect(() => {
    let disposed = false
    async function loadData() {
      try {
        const [channelResponse, videoResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/video-channels`),
          fetch(`${API_BASE_URL}/api/admin/videos`),
        ])
        if (!channelResponse.ok || !videoResponse.ok) throw new Error('Cannot fetch video data')
        const [channelPayload, videoPayload] = await Promise.all([channelResponse.json(), videoResponse.json()])
        if (disposed) return
        setChannels(Array.isArray(channelPayload) ? channelPayload.map(normalizeChannelRow) : youtubeChannels)
        setVideos(Array.isArray(videoPayload) ? videoPayload.map(normalizeVideoRow) : videoLessons)
        setLoadError('')
      } catch {
        if (disposed) return
        setChannels(youtubeChannels)
        setVideos(videoLessons)
        setLoadError('Không thể tải dữ liệu video từ backend.')
      } finally {
        if (!disposed) setIsLoading(false)
      }
    }
    loadData()
    return () => { disposed = true }
  }, [])

  const stats = [
    { label: 'Kênh YouTube', value: channels.length.toString(), meta: 'Kênh đang được quản lý', icon: 'iconoir-youtube' },
    { label: 'Tổng video', value: videos.length.toString(), meta: 'Trong toàn bộ kênh', icon: 'iconoir-play-solid' },
    { label: 'Đã xuất bản', value: videos.filter((v) => v.status === 'Đã xuất bản').length.toString(), meta: 'Đang hiển thị cho người học', icon: 'iconoir-check-circle' },
    { label: 'Chờ biên tập', value: videos.filter((v) => v.status === 'Chờ biên tập').length.toString(), meta: 'Cần rà soát trước khi xuất bản', icon: 'iconoir-edit-pencil' },
  ]

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Video Content"
          title="Quản lý video"
          description="Tổ chức nội dung video theo kênh YouTube và quản lý quá trình biên tập."
          actions={
            <>
              <Link to="/admin/video-channels/new" className="btn btn-outline-primary">+ Thêm kênh</Link>
              <Link to="/admin/videos/new" className="btn btn-primary">+ Thêm video</Link>
            </>
          }
        />

        {isLoading ? <div className="alert alert-light border">Đang tải dữ liệu...</div> : null}
        {loadError ? <div className="alert alert-warning border">{loadError}</div> : null}

        <StatGrid items={stats} />

        <div className="row g-3 mt-1">
          <div className="col-12">
            <AdminSectionCard
              title="Kênh YouTube"
              description="Quản lý các kênh YouTube cung cấp nội dung."
              actions={<div className="input-group input-group-sm" style={{ width: '200px' }}><input type="text" className="form-control" placeholder="Tìm tên kênh..." value={searchChannelTerm} onChange={(e) => setSearchChannelTerm(e.target.value)} /></div>}
            >
              <SimpleTable
                columns={[
                  {
                    key: 'avatar',
                    label: 'Ảnh',
                    render: (row) => (
                      <img
                        src={row.avatar || 'https://via.placeholder.com/40'}
                        alt={row.name}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }}
                      />
                    )
                  },
                  { key: 'name', label: 'Tên kênh' },
                  { key: 'handle', label: 'Handle' },
                  { 
                    key: 'subscriberCount', 
                    label: 'Subscribers',
                    render: (row) => row.subscriberCount ? row.subscriberCount.toLocaleString() : '0'
                  },
                  { key: 'videoCount', label: 'Số video' },
                  { key: 'status', label: 'Trạng thái', render: (row) => <Badge tone={row.status === 'Hoạt động' ? 'success' : 'neutral'}>{row.status}</Badge> },
                  {
                    key: 'actions',
                    label: 'Hành động',
                    render: (row) => (
                      <div className="d-flex flex-wrap gap-2 flex-nowrap text-nowrap">
                        <Link to={`/admin/video-channels/${row.id}`} className="btn btn-sm btn-soft-info">Chi tiết</Link>
                        <Link to={`/admin/video-channels/${row.id}/edit`} className="btn btn-sm btn-soft-primary">Sửa</Link>
                        <Link to={`/admin/video-channels/${row.id}/delete`} className="btn btn-sm btn-soft-danger">Xóa</Link>
                      </div>
                    ),
                  },
                ]}
                rows={channelsPagination.paginatedData}
              />
              <Pagination
                currentPage={channelsPagination.currentPage}
                totalPages={channelsPagination.totalPages}
                onPageChange={channelsPagination.handlePageChange}
              />
            </AdminSectionCard>
          </div>

          <div className="col-12">
            <AdminSectionCard
              title="Danh sách video"
              description="Quản lý tất cả video trong hệ thống."
              actions={
                <div className="d-flex flex-wrap gap-2">
                  <select className="form-select form-select-sm" style={{ width: '150px' }} value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}>
                    <option value="">Độ khó (Tất cả)</option>
                    <option value="Dễ">Dễ</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Khó">Khó</option>
                  </select>
                  <select className="form-select form-select-sm" style={{ width: '150px' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">Trạng thái (Tất cả)</option>
                    <option value="Đã xuất bản">Đã xuất bản</option>
                    <option value="Chờ biên tập">Chờ biên tập</option>
                    <option value="Nháp">Nháp</option>
                  </select>
                  <select className="form-select form-select-sm" style={{ width: '180px' }} value={filterChannelId} onChange={(e) => setFilterChannelId(e.target.value)}>
                    <option value="">Kênh (Tất cả)</option>
                    {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <div className="input-group input-group-sm" style={{ width: '250px' }}>
                    <span className="input-group-text bg-light border-end-0"><i className="iconoir-search"></i></span>
                    <input type="text" className="form-control border-start-0" placeholder="Tìm tiêu đề video..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                </div>
              }
            >
              <SimpleTable
                columns={[
                  {
                    key: 'thumbnail',
                    label: 'Ảnh',
                    render: (row) => (
                      <img
                        src={row.thumbnail || 'https://via.placeholder.com/40'}
                        alt={row.title}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    )
                  },
                  { key: 'title', label: 'Tiêu đề video' },
                  { key: 'channelName', label: 'Kênh' },
                  { key: 'difficulty', label: 'Độ khó' },
                  { key: 'status', label: 'Trạng thái', render: (row) => <Badge tone={row.status === 'Đã xuất bản' ? 'success' : row.status === 'Chờ biên tập' ? 'warning' : 'neutral'}>{row.status}</Badge> },
                  {
                    key: 'actions',
                    label: 'Hành động',
                    render: (row) => (
                      <div className="d-flex flex-wrap gap-2 flex-nowrap text-nowrap">
                        <Link to={`/admin/videos/${row.id}`} className="btn btn-sm btn-soft-info">Chi tiết</Link>
                        <Link to={`/admin/videos/${row.id}/edit`} className="btn btn-sm btn-soft-primary">Sửa</Link>
                        <Link to={`/admin/videos/${row.id}/delete`} className="btn btn-sm btn-soft-danger">Xóa</Link>
                      </div>
                    ),
                  },
                ]}
                rows={videosPagination.paginatedData}
              />
              <Pagination
                currentPage={videosPagination.currentPage}
                totalPages={videosPagination.totalPages}
                onPageChange={videosPagination.handlePageChange}
              />
            </AdminSectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}
