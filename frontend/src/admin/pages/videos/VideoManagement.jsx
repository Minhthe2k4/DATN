import { useEffect, useMemo, useState } from 'react'
import { topics, videoLessons, youtubeChannels } from '../../data/adminData'
import { AdminPageHeader, AdminSectionCard, Badge, SimpleTable, StatGrid } from '../../components/console/AdminUi'
import { SegmentsEditor } from './SegmentsEditor'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
const DIFFICULTY_OPTIONS = ['Cơ bản', 'Trung bình', 'Nâng cao']
const VIDEO_STATUS_OPTIONS = ['Chờ biên tập', 'Đã xuất bản', 'Nháp']

function emptyChannelDraft() {
  return { name: '', handle: '', topic: '', status: 'Hoạt động' }
}

function emptyVideoDraft() {
  return { title: '', youtubeUrl: '', channelId: '', topicId: '', difficulty: 'Trung bình', duration: '', status: 'Chờ biên tập', transcript: '' }
}

function normalizeChannelRow(row) {
  return {
    id: row.id,
    name: row.name ?? '',
    handle: row.handle ?? '',
    topic: row.topic ?? 'General',
    videoCount: row.videoCount ?? 0,
    status: row.status ?? 'Hoạt động',
  }
}

function normalizeVideoRow(row) {
  return {
    id: row.id,
    channelId: row.channelId ?? null,
    channelName: row.channelName ?? '',
    title: row.title ?? '',
    youtubeUrl: row.youtubeUrl ?? '',
    topicId: row.topicId ?? null,
    topic: row.topic ?? '',
    difficulty: row.difficulty ?? 'Trung bình',
    duration: row.duration ?? '',
    wordsHighlighted: row.wordsHighlighted ?? 0,
    status: row.status ?? 'Chờ biên tập',
  }
}

function normalizeTopicOption(row) {
  return {
    id: row.id,
    name: row.name ?? '',
  }
}

export function VideoManagement() {
  const [channels, setChannels] = useState(youtubeChannels)
  const [videos, setVideos] = useState(videoLessons)
  const [topicOptions, setTopicOptions] = useState(topics)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false)
  const [editingChannelId, setEditingChannelId] = useState(null)
  const [channelDraft, setChannelDraft] = useState(emptyChannelDraft())
  const [channelError, setChannelError] = useState('')

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [editingVideoId, setEditingVideoId] = useState(null)
  const [videoDraft, setVideoDraft] = useState(emptyVideoDraft())
  const [videoError, setVideoError] = useState('')

  // Nâng cấp: Tìm kiếm và Lọc
  const [searchTerm, setSearchTerm] = useState('')
  const [searchChannelTerm, setSearchChannelTerm] = useState('')
  const [filterChannelId, setFilterChannelId] = useState('')

  // Lọc danh sách video
  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesChannel = !filterChannelId || String(video.channelId) === String(filterChannelId)
      return matchesSearch && matchesChannel
    })
  }, [videos, searchTerm, filterChannelId])

  // Lọc danh sách kênh
  const filteredChannels = useMemo(() => {
    return channels.filter((c) => c.name.toLowerCase().includes(searchChannelTerm.toLowerCase()))
  }, [channels, searchChannelTerm])

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [previewVideo, setPreviewVideo] = useState(null)
  const [previewSegments, setPreviewSegments] = useState([])
  const [previewCaptionsLoading, setPreviewCaptionsLoading] = useState(false)
  const [previewSaving, setPreviewSaving] = useState(false)

  useEffect(() => {
    let disposed = false

    async function loadData() {
      try {
        const [channelResponse, videoResponse, topicResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/video-channels`),
          fetch(`${API_BASE_URL}/api/admin/videos`),
          fetch(`${API_BASE_URL}/api/admin/topics`),
        ])

        if (!channelResponse.ok || !videoResponse.ok || !topicResponse.ok) {
          throw new Error('Cannot fetch video data')
        }

        const [channelPayload, videoPayload, topicPayload] = await Promise.all([
          channelResponse.json(),
          videoResponse.json(),
          topicResponse.json(),
        ])

        if (disposed) {
          return
        }

        setChannels(Array.isArray(channelPayload) ? channelPayload.map(normalizeChannelRow) : youtubeChannels)
        setVideos(Array.isArray(videoPayload) ? videoPayload.map(normalizeVideoRow) : videoLessons)
        setTopicOptions(Array.isArray(topicPayload) ? topicPayload.map(normalizeTopicOption) : topics)
        setLoadError('')
      } catch {
        if (disposed) {
          return
        }

        setChannels(youtubeChannels)
        setVideos(videoLessons)
        setTopicOptions(topics)
        setLoadError('Không thể tải dữ liệu video từ backend, đang hiển thị dữ liệu mẫu.')
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

  // Fetch YouTube captions when preview modal opens
  useEffect(() => {
    if (!previewVideo || !isPreviewModalOpen) {
      return
    }

    let disposed = false

    async function fetchCaptions() {
      setPreviewCaptionsLoading(true)
      try {
        console.log('🎥 Fetching captions for video:', {
          id: previewVideo.id,
          title: previewVideo.title,
          youtubeUrl: previewVideo.youtubeUrl
        })

        if (!previewVideo.youtubeUrl) {
          console.warn('⚠️ YouTube URL is empty!')
          setPreviewSegments([])
          setPreviewCaptionsLoading(false)
          return
        }

        const response = await fetch(`${API_BASE_URL}/api/admin/videos/fetch-captions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ youtubeUrl: previewVideo.youtubeUrl }),
        })

        console.log('📡 API Response Status:', response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ API Error:', errorText)
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        console.log('✓ API Response Data:', data)

        if (!disposed) {
          if (data.error) {
            console.error('API Error:', data.error)
            const errorMessage = data.error.includes('Failed to fetch captions') 
              ? `❌ Video này không có phụ đề tiếng Anh. Hãy chọn video khác có bật phụ đề.`
              : `Lỗi: ${data.error}`
            alert(errorMessage)
            setPreviewSegments([])
          } else {
            const segments = data.segments && Array.isArray(data.segments) ? data.segments : []
            
            setPreviewSegments(segments)
            
            if (segments.length === 0) {
              alert('⚠️ Không tìm thấy phụ đề cho video này. Hãy kiểm tra video có bật phụ đề tiếng Anh không.')
            } else {
              console.log(`✓ Successfully loaded ${segments.length} segments from video`)
            }
          }
        }
      } catch (error) {
        if (!disposed) {
          console.error('❌ Error fetching captions:', error)
          alert('Lỗi tải phụ đề: ' + error.message)
        }
      } finally {
        if (!disposed) {
          setPreviewCaptionsLoading(false)
        }
      }
    }

    fetchCaptions()

    return () => {
      disposed = true
    }
  }, [previewVideo, isPreviewModalOpen])

  const reloadData = async () => {
    const [channelResponse, videoResponse, topicResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/admin/video-channels`),
      fetch(`${API_BASE_URL}/api/admin/videos`),
      fetch(`${API_BASE_URL}/api/admin/topics`),
    ])

    if (!channelResponse.ok || !videoResponse.ok || !topicResponse.ok) {
      throw new Error('Cannot refresh video data')
    }

    const [channelPayload, videoPayload, topicPayload] = await Promise.all([
      channelResponse.json(),
      videoResponse.json(),
      topicResponse.json(),
    ])

    setChannels(Array.isArray(channelPayload) ? channelPayload.map(normalizeChannelRow) : youtubeChannels)
    setVideos(Array.isArray(videoPayload) ? videoPayload.map(normalizeVideoRow) : videoLessons)
    setTopicOptions(Array.isArray(topicPayload) ? topicPayload.map(normalizeTopicOption) : topics)
  }

  const topicNames = useMemo(() => topicOptions.map((t) => t.name), [topicOptions])

  // Extract YouTube video ID from various URL formats
  const extractYouTubeVideoId = (url) => {
    if (!url) return ''
    
    // Format: https://youtu.be/VIDEO_ID or https://youtu.be/VIDEO_ID?t=...
    let match = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
    if (match) return match[1]
    
    // Format: https://www.youtube.com/watch?v=VIDEO_ID or youtube.com/watch?v=VIDEO_ID
    match = url.match(/(?:youtube\.com|youtube-nocookie\.com).*[?&]v=([a-zA-Z0-9_-]{11})/)
    if (match) return match[1]
    
    // Fallback: just look for the ID pattern
    match = url.match(/([a-zA-Z0-9_-]{11})/)
    if (match) return match[1]
    
    return ''
  }

  const setChannelField = (field, value) => setChannelDraft((prev) => ({ ...prev, [field]: value }))
  const setVideoField = (field, value) => setVideoDraft((prev) => ({ ...prev, [field]: value }))

  const openChannelModal = () => {
    setEditingChannelId(null)
    setChannelDraft(emptyChannelDraft())
    setChannelError('')
    setIsChannelModalOpen(true)
  }

  const openEditChannelModal = (channel) => {
    setEditingChannelId(channel.id)
    setChannelDraft({
      name: channel.name,
      handle: channel.handle,
      topic: channel.topic,
      status: channel.status,
    })
    setChannelError('')
    setIsChannelModalOpen(true)
  }

  const closeChannelModal = () => {
    setChannelError('')
    setEditingChannelId(null)
    setIsChannelModalOpen(false)
  }

  const openVideoModal = () => {
    setEditingVideoId(null)
    setVideoDraft(emptyVideoDraft())
    setVideoError('')
    setIsVideoModalOpen(true)
  }

  const openEditVideoModal = (video) => {
    setEditingVideoId(video.id)
    setVideoDraft({
      title: video.title,
      youtubeUrl: video.youtubeUrl || '',
      channelId: video.channelId || '',
      topicId: video.topicId || '',
      difficulty: video.difficulty || 'Trung bình',
      duration: video.duration || '',
      status: video.status || 'Chờ biên tập',
    })
    setVideoError('')
    setIsVideoModalOpen(true)
  }

  const closeVideoModal = () => {
    setVideoError('')
    setEditingVideoId(null)
    setIsVideoModalOpen(false)
  }

  const handleSaveChannel = async () => {
    if (!channelDraft.name.trim()) { setChannelError('Tên kênh không được để trống.'); return }
    if (!channelDraft.handle.trim()) { setChannelError('Hãy nhập handle kênh YouTube (ví dụ: @TenKenh).'); return }

    try {
      const payload = {
        name: channelDraft.name.trim(),
        handle: channelDraft.handle.trim(),
        topic: channelDraft.topic || 'General',
        status: channelDraft.status,
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/video-channels${editingChannelId ? `/${editingChannelId}` : ''}`, {
        method: editingChannelId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Cannot save channel')
      }

      await reloadData()
      setChannelError('')
      closeChannelModal()
    } catch {
      setChannelError('Lưu kênh thất bại. Vui lòng thử lại.')
    }
  }

  const handleDeleteChannel = async (channel) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/video-channels/${channel.id}`, { method: 'DELETE' })
      if (!response.ok && response.status !== 204) {
        throw new Error('Cannot delete channel')
      }
      await reloadData()
    } catch {
      setChannelError('Không thể xóa kênh này (có thể còn video liên kết).')
      setIsChannelModalOpen(true)
    }
  }

  const handleSaveVideo = async () => {
    if (!videoDraft.title.trim()) { setVideoError('Tiêu đề video không được để trống.'); return }
    if (!videoDraft.channelId) { setVideoError('Vui lòng chọn kênh YouTube chứa video này.'); return }

    try {
      const payload = {
        title: videoDraft.title.trim(),
        youtubeUrl: videoDraft.youtubeUrl.trim(),
        channelId: Number(videoDraft.channelId),
        topicId: videoDraft.topicId ? Number(videoDraft.topicId) : null,
        difficulty: videoDraft.difficulty,
        duration: videoDraft.duration,
        status: videoDraft.status,
        transcript: '', // Lúc này transcript còn trống, sẽ fill ở preview modal
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/videos${editingVideoId ? `/${editingVideoId}` : ''}`, {
        method: editingVideoId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Cannot save video')
      }

      const savedVideo = await response.json()

      // Nếu là thêm mới, hiện preview modal để pick transcript
      if (!editingVideoId) {
        setPreviewVideo(savedVideo)
        setPreviewSegments([])
        setIsPreviewModalOpen(true)
        closeVideoModal()
      } else {
        // Nếu sửa existing video, reload và close
        await reloadData()
        setVideoError('')
        closeVideoModal()
      }
    } catch {
      setVideoError('Lưu video thất bại. Vui lòng thử lại.')
    }
  }

  const handleDeleteVideo = async (video) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/videos/${video.id}`, { method: 'DELETE' })
      if (!response.ok && response.status !== 204) {
        throw new Error('Cannot delete video')
      }
      await reloadData()
    } catch {
      setVideoError('Xóa video thất bại. Vui lòng thử lại.')
      setIsVideoModalOpen(true)
    }
  }

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
          description="Tổ chức nội dung video theo kênh YouTube. Người học nhấn vào kênh để xem danh sách video thuộc kênh đó."
          actions={
            <>
              <button type="button" className="btn btn-outline-primary" onClick={openChannelModal}>+ Thêm kênh</button>
              <button type="button" className="btn btn-primary" onClick={openVideoModal}>+ Thêm video</button>
            </>
          }
        />

        {isLoading ? <div className="alert alert-light border">Đang tải dữ liệu video từ backend...</div> : null}
        {loadError ? <div className="alert alert-warning border">{loadError}</div> : null}

        <StatGrid items={stats} />

        <div className="row g-3 mt-1">
          <div className="col-12">
            <AdminSectionCard
              title="Kênh YouTube"
              description="Mỗi kênh là một nhà cung cấp nội dung video. Người học sẽ nhấn vào kênh để xem video."
              actions={
                <div className="input-group input-group-sm" style={{ width: '200px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm tên kênh..."
                    value={searchChannelTerm}
                    onChange={(e) => setSearchChannelTerm(e.target.value)}
                  />
                </div>
              }
            >
              <SimpleTable
                columns={[
                  { key: 'name', label: 'Tên kênh' },
                  { key: 'handle', label: 'Handle' },
                  { key: 'topic', label: 'Chủ đề tập trung' },
                  { key: 'videoCount', label: 'Số video' },
                  {
                    key: 'status',
                    label: 'Trạng thái',
                    render: (row) => <Badge tone={row.status === 'Hoạt động' ? 'success' : 'neutral'}>{row.status}</Badge>,
                  },
                  {
                    key: 'actions',
                    label: 'Hành động',
                    render: (row) => (
                      <div className="d-flex flex-wrap gap-2">
                        <button type="button" className="btn btn-sm btn-soft-primary" onClick={() => openEditChannelModal(row)}>Sửa</button>
                        <button type="button" className="btn btn-sm btn-soft-danger" onClick={() => handleDeleteChannel(row)}>Xóa</button>
                      </div>
                    ),
                  },
                ]}
                rows={filteredChannels}
              />
            </AdminSectionCard>
          </div>

          <div className="col-12">
            <AdminSectionCard
              title="Danh sách video"
              description="Tất cả video trong hệ thống, sắp xếp theo kênh. Biên tập xong thì xuất bản để hiển thị cho người học."
              actions={
                <div className="d-flex gap-2">
                  <select 
                    className="form-select form-select-sm" 
                    style={{ width: '180px' }}
                    value={filterChannelId}
                    onChange={(e) => setFilterChannelId(e.target.value)}
                  >
                    <option value="">Tất cả các kênh</option>
                    {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <div className="input-group input-group-sm" style={{ width: '250px' }}>
                    <span className="input-group-text bg-light border-end-0">
                      <i className="iconoir-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Tìm tiêu đề video..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              }
            >
              <SimpleTable
                columns={[
                  { key: 'title', label: 'Tiêu đề video' },
                  { key: 'channelName', label: 'Kênh' },
                  { key: 'topic', label: 'Chủ đề' },
                  { key: 'difficulty', label: 'Độ khó' },
                  { key: 'duration', label: 'Thời lượng' },
                  { key: 'wordsHighlighted', label: 'Từ nổi bật' },
                  {
                    key: 'status',
                    label: 'Trạng thái',
                    render: (row) => {
                      const tone = row.status === 'Đã xuất bản' ? 'success' : row.status === 'Chờ biên tập' ? 'warning' : 'neutral'
                      return <Badge tone={tone}>{row.status}</Badge>
                    },
                  },
                  {
                    key: 'actions',
                    label: 'Hành động',
                    render: (row) => (
                      <div className="d-flex flex-wrap gap-2">
                        <button type="button" className="btn btn-sm btn-soft-primary" onClick={() => openEditVideoModal(row)}>Sửa</button>
                        <button type="button" className="btn btn-sm btn-soft-danger" onClick={() => handleDeleteVideo(row)}>Xóa</button>
                      </div>
                    ),
                  },
                ]}
                rows={filteredVideos}
              />
            </AdminSectionCard>
          </div>
        </div>
      </div>

      {isChannelModalOpen ? (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="modal-dialog modal-dialog-centered" role="document" style={{ maxWidth: '90%', width: '900px' }}>
              <div className="modal-content topic-bulk-modal">
                <div className="modal-header">
                  <div>
                    <h5 className="modal-title mb-1">{editingChannelId ? 'Sửa kênh YouTube' : 'Thêm kênh YouTube'}</h5>
                    <div className="topic-bulk-modal__subtitle">Kênh mới sẽ hiển thị trên trang video của người học.</div>
                  </div>
                  <button type="button" className="btn-close" aria-label="Đóng" onClick={closeChannelModal}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Tên kênh <span className="text-danger">*</span></label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Ví dụ: Business English Pod"
                      value={channelDraft.name}
                      onChange={(e) => setChannelField('name', e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Handle YouTube <span className="text-danger">*</span></label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="@TenKenh"
                      value={channelDraft.handle}
                      onChange={(e) => setChannelField('handle', e.target.value)}
                    />
                    <div className="form-text">Tìm trong URL kênh YouTube: youtube.com/@TenKenh</div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Chủ đề tập trung</label>
                      <select className="form-select" value={channelDraft.topic} onChange={(e) => setChannelField('topic', e.target.value)}>
                        <option value=""> General </option>
                        {topicNames.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Trạng thái</label>
                      <select className="form-select" value={channelDraft.status} onChange={(e) => setChannelField('status', e.target.value)}>
                        <option>Hoạt động</option>
                        <option>Tạm dừng</option>
                      </select>
                    </div>
                  </div>
                  {channelError ? <div className="text-danger mt-2">{channelError}</div> : null}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={closeChannelModal}>Hủy</button>
                  <button type="button" className="btn btn-primary" onClick={handleSaveChannel}>{editingChannelId ? 'Lưu cập nhật' : 'Thêm kênh'}</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      ) : null}

      {isVideoModalOpen ? (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="modal-dialog modal-dialog-centered" role="document" style={{ maxWidth: '90%', width: '1000px' }}>
              <div className="modal-content topic-bulk-modal">
                <div className="modal-header">
                  <div>
                    <h5 className="modal-title mb-1">{editingVideoId ? 'Sửa video' : 'Thêm video mới'}</h5>
                    <div className="topic-bulk-modal__subtitle">Video mới sẽ vào hàng chờ biên tập để đánh dấu từ nổi bật trước khi xuất bản.</div>
                  </div>
                  <button type="button" className="btn-close" aria-label="Đóng" onClick={closeVideoModal}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Tiêu đề video <span className="text-danger">*</span></label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Ví dụ: Business Meeting Vocabulary in Context"
                      value={videoDraft.title}
                      onChange={(e) => setVideoField('title', e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Link YouTube</label>
                    <input
                      className="form-control"
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={videoDraft.youtubeUrl}
                      onChange={(e) => setVideoField('youtubeUrl', e.target.value)}
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Kênh YouTube <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={videoDraft.channelId}
                        onChange={(e) => setVideoField('channelId', e.target.value)}
                      >
                        <option value=""> Chọn kênh </option>
                        {channels.filter((c) => c.status === 'Hoạt động').map((c) => (
                          <option key={c.id} value={c.id}>{c.name} ({c.handle})</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Chủ đề</label>
                      <select
                        className="form-select"
                        value={videoDraft.topicId}
                        onChange={(e) => setVideoField('topicId', e.target.value)}
                      >
                        <option value=""> Chọn chủ đề </option>
                        {topicOptions.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Độ khó</label>
                      <select className="form-select" value={videoDraft.difficulty} onChange={(e) => setVideoField('difficulty', e.target.value)}>
                        {DIFFICULTY_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Thời lượng</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Ví dụ: 12:30"
                        value={videoDraft.duration}
                        onChange={(e) => setVideoField('duration', e.target.value)}
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Trạng thái</label>
                      <select className="form-select" value={videoDraft.status} onChange={(e) => setVideoField('status', e.target.value)}>
                        {VIDEO_STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  {videoError ? <div className="text-danger mt-3">{videoError}</div> : null}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={closeVideoModal}>Hủy</button>
                  <button type="button" className="btn btn-primary" onClick={handleSaveVideo}>{editingVideoId ? 'Lưu cập nhật' : 'Thêm vào hàng chờ biên tập'}</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      ) : null}
      {isPreviewModalOpen && previewVideo ? (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="modal-dialog modal-dialog-centered" role="document" style={{ maxWidth: '90%', width: '1200px' }}>
              <div className="modal-content topic-bulk-modal">
                <div className="modal-header">
                  <div>
                    <h5 className="modal-title mb-1">Xem trước & Chỉnh sửa phụ đề</h5>
                    <div className="topic-bulk-modal__subtitle">Bạn có thể sao chép từng dòng phụ đề hoặc chỉnh sửa trực tiếp. Sau đó bấm lưu để cập nhật.</div>
                  </div>
                  <button type="button" className="btn-close" aria-label="Đóng" onClick={() => setIsPreviewModalOpen(false)}></button>
                </div>
                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Xem trước video</label>
                      <div style={{ backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden', aspectRatio: '16/9' }}>
                        {previewVideo.youtubeUrl ? (
                          <iframe
                            width="100%"
                            height="300"
                            src={`https://www.youtube.com/embed/${extractYouTubeVideoId(previewVideo.youtubeUrl)}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                            Không có link video
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-12 col-md-6" style={{ display: 'flex', flexDirection: 'column' }}>
                      <SegmentsEditor 
                        segments={previewSegments}
                        onSegmentsChange={setPreviewSegments}
                        isLoading={previewCaptionsLoading}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setIsPreviewModalOpen(false)} disabled={previewSaving}>Hủy</button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={previewSaving || previewCaptionsLoading}
                    onClick={async () => {
                      try {
                        setPreviewSaving(true)
                        // PUT update video with segments
                        const updatePayload = {
                          title: previewVideo.title,
                          youtubeUrl: previewVideo.youtubeUrl,
                          channelId: previewVideo.channelId,
                          topicId: previewVideo.topicId,
                          difficulty: previewVideo.difficulty,
                          duration: previewVideo.duration || '',
                          status: previewVideo.status,
                          segments: previewSegments,
                        }

                        const updateResponse = await fetch(`${API_BASE_URL}/api/admin/videos/${previewVideo.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(updatePayload),
                        })

                        if (!updateResponse.ok) {
                          throw new Error('Cannot update transcript')
                        }

                        await reloadData()
                        setIsPreviewModalOpen(false)
                        setPreviewVideo(null)
                        alert('Phụ đề đã được lưu thành công!')
                      } catch (err) {
                        alert('Lỗi lưu phụ đề: ' + err.message)
                      } finally {
                        setPreviewSaving(false)
                      }
                    }}
                  >
                    {previewSaving ? '⏳ Đang lưu...' : '✓ Lưu phụ đề'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      ) : null}
    </div>
  )
}
