import { useEffect, useRef, useState, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AdminPageHeader, AdminSectionCard } from '../../components/console/AdminUi'
import { SegmentsEditor } from './SegmentsEditor'
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
} from 'lucide-react'

// Reuse User-side Styles
import '../../../user/pages/video/videoWatch.css'
import '../../../user/components/interaction/interaction.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function VideoCrudPage({ mode }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const videoRef = useRef(null)

  // --- Video Metadata & Upload State ---
  const [channels, setChannels] = useState([])
  const [videoDraft, setVideoDraft] = useState({
    title: '',
    channelId: '',
    difficulty: 'Trung bình',
    status: 'Chờ biên tập',
    youtubeUrl: '',
    thumbnail: '',
    duration: '',
    transcript: '',
    segments: []
  })
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(mode !== 'create')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [subtitleStatus, setSubtitleStatus] = useState('IDLE')
  const [uploadedVideoId, setUploadedVideoId] = useState(null)

  // --- Player State (Matching VideoWatch.jsx) ---
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [activeSubtitleId, setActiveSubtitleId] = useState(null)

  // Computed active segment for preview
  const activeSegment = useMemo(() => {
    const list = videoDraft.segments || []
    if (list.length === 0) return null

    if (activeSubtitleId) {
      const byId = list.find((s) => s.id === activeSubtitleId)
      if (byId) return byId
    }

    return list.find(s => currentTime >= s.startSec && currentTime <= s.endSec)
  }, [videoDraft.segments, activeSubtitleId, currentTime])

  useEffect(() => {
    let disposed = false
    async function loadInitialData() {
      try {
        const channelRes = await fetch(`${API_BASE_URL}/api/admin/video-channels`)
        if (channelRes.ok) {
          const data = await channelRes.json()
          if (!disposed) setChannels(data)
        }

        if (mode !== 'create' && id) {
          const [videoRes, segmentsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/admin/videos/${id}`),
            fetch(`${API_BASE_URL}/api/videos/${id}/segments`),
          ])

          if (videoRes.ok) {
            const videoData = await videoRes.json()
            if (!disposed) {
              setVideoDraft(prev => ({
                ...prev,
                title: videoData.title || '',
                channelId: videoData.channelId || '',
                difficulty: videoData.difficulty || 'Trung bình',
                status: videoData.status || 'Chờ biên tập',
                youtubeUrl: videoData.youtubeUrl || '',
                thumbnail: videoData.thumbnail || '',
                duration: videoData.duration || '',
                transcript: videoData.transcript || '',
              }))
            }
          }

          if (segmentsRes.ok) {
            const segs = await segmentsRes.json()
            if (!disposed) {
              setVideoDraft(prev => ({
                ...prev,
                segments: Array.isArray(segs) ? segs : []
              }))
            }
          }
        }
      } catch (err) {
        if (!disposed) setError('Không thể tải dữ liệu ban đầu.')
      } finally {
        if (!disposed) setIsLoading(false)
      }
    }
    loadInitialData()
    return () => { disposed = true }
  }, [id, mode])

  // Polling for subtitle status
  useEffect(() => {
    if (subtitleStatus !== 'PROCESSING' || !uploadedVideoId) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/videos/${uploadedVideoId}/status`)
        if (res.ok) {
          const data = await res.json()
          setSubtitleStatus(data.status)
          if (data.status === 'DONE' || data.status === 'ERROR') {
            clearInterval(interval)
            // If done, reload segments
            if (data.status === 'DONE') {
              const videoRes = await fetch(`${API_BASE_URL}/api/admin/videos/${uploadedVideoId}`)
              const segsRes = await fetch(`${API_BASE_URL}/api/videos/${uploadedVideoId}/segments`)
              if (videoRes.ok && segsRes.ok) {
                const videoData = await videoRes.json()
                const segsData = await segsRes.json()
                setVideoDraft({
                  title: videoData.title || '',
                  channelId: videoData.channelId || '',
                  difficulty: videoData.difficulty || 'Trung bình',
                  status: videoData.status || 'Chờ biên tập',
                  youtubeUrl: videoData.youtubeUrl || '',
                  transcript: videoData.transcript || '',
                  segments: Array.isArray(segsData) ? segsData : []
                })
              }
            }
          }
        }
      } catch (err) {
        console.error('Polling error', err)
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [subtitleStatus, uploadedVideoId])

  const setField = (field, value) => setVideoDraft(prev => ({ ...prev, [field]: value }))

  const extractError = async (res, defaultMsg) => {
    try {
      const data = await res.json()
      return data.message || defaultMsg
    } catch {
      return defaultMsg
    }
  }

  function extractVideoId(url) {
    if (!url) return null
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    return match ? match[1] : null
  }

  // Auto-generate thumbnail when URL changes
  useEffect(() => {
    const videoId = extractVideoId(videoDraft.youtubeUrl)
    if (videoId) {
      setField('thumbnail', `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`)
    }
  }, [videoDraft.youtubeUrl])

  const handleUpload = async () => {
    if (!videoDraft.title.trim()) { setError('Tiêu đề không được để trống.'); return }
    if (!videoDraft.channelId) { setError('Vui lòng chọn kênh.'); return }
    if (!videoDraft.youtubeUrl.trim()) { setError('Vui lòng nhập URL YouTube.'); return }

    setIsUploading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/videos/upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: videoDraft.title.trim(),
          channelId: Number(videoDraft.channelId),
          youtubeUrl: videoDraft.youtubeUrl.trim(),
          difficulty: videoDraft.difficulty,
          status: videoDraft.status,
          thumbnail: videoDraft.thumbnail,
        }),
      })

      if (!response.ok) throw new Error(await extractError(response, 'Xử lý thất bại'))
      const data = await response.json()
      setUploadedVideoId(data.videoId)
      setSubtitleStatus('PROCESSING')
      setSuccess('Video đang được xử lý và tạo phụ đề AI. Bạn đang được chuyển hướng về trang danh sách...')
      window.setTimeout(() => navigate('/admin/videos'), 2000)
    } catch (err) {
      setError(err.message || 'Thao tác thất bại.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFetchMetadata = async () => {
    if (!videoDraft.youtubeUrl.trim()) { setError('Vui lòng nhập URL YouTube.'); return }
    setIsUploading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/videos/fetch-captions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl: videoDraft.youtubeUrl.trim() }),
      })
      if (!response.ok) throw new Error('Lấy dữ liệu thất bại')
      const data = await response.json()
      if (data.error) throw new Error(data.error)

      setVideoDraft(prev => ({
        ...prev,
        title: prev.title || data.title,
        transcript: data.transcript || '',
        segments: data.segments || [],
        thumbnail: data.thumbnailUrl || prev.thumbnail,
        duration: data.duration || prev.duration,
      }))
      setSuccess('Đã lấy metadata và phụ đề thành công.')
    } catch (err) {
      setError(err.message || 'Thao tác thất bại.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveMetadata = async () => {
    if (!videoDraft.title.trim()) { setError('Tiêu đề không được để trống.'); return }
    setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/videos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...videoDraft,
          channelId: Number(videoDraft.channelId)
        }),
      })
      if (!res.ok) throw new Error(await extractError(res, 'Cập nhật thất bại'))
      setSuccess('Đã lưu thay đổi thành công.')
      window.setTimeout(() => navigate('/admin/videos'), 1500)
    } catch (err) {
      setError(err.message || 'Thao tác thất bại.')
    }
  }

  // --- Player Logic ---
  const togglePlay = () => {
    const videoEl = videoRef.current
    if (!videoEl) return
    if (videoEl.paused) {
      videoEl.play()
      setIsPlaying(true)
    } else {
      videoEl.pause()
      setIsPlaying(false)
    }
  }

  const handleSkip = (seconds) => {
    if (videoRef.current) videoRef.current.currentTime += seconds
  }

  const changeSpeed = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
      setPlaybackRate(speed)
    }
  }

  const handleProgressChange = (e) => {
    const time = Number(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const onMetadataLoaded = () => {
    if (videoRef.current) setDuration(videoRef.current.duration)
  }

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime
      setCurrentTime(time)

      if (videoDraft.segments.length > 0) {
        const found = videoDraft.segments.find((s) => time >= s.startSec && time <= s.endSec)
        if (found && found.id !== activeSubtitleId) {
          setActiveSubtitleId(found.id)
        }
      }
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted
      videoRef.current.muted = newMuted
      setIsMuted(newMuted)
      if (newMuted) setVolume(0)
      else setVolume(videoRef.current.volume || 1)
    }
  }

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement
    if (!container) return
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => console.error(err))
    } else {
      document.exitFullscreen()
    }
  }

  const videoStreamUrl = id || uploadedVideoId ? `${API_BASE_URL}/api/videos/${id || uploadedVideoId}/stream` : ''

  const handleDelete = async (force = false) => {
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/videos/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' })
      if (!response.ok && response.status !== 204) throw new Error(await extractError(response, 'Xóa thất bại'))
      setSuccess(force ? 'Đã xóa vĩnh viễn video.' : 'Đã xóa tạm thời video.')
      window.setTimeout(() => navigate('/admin/videos'), 1500)
    } catch (err) {
      setError(err.message || 'Thao tác thất bại.')
    }
  }

  if (isLoading) return <div className="p-4">Đang tải...</div>

  const pageTitle = mode === 'create' ? 'Thêm video mới' : mode === 'edit' ? 'Chỉnh sửa video' : 'Xóa video'

  return (
    <div className="page-content video-watch-page admin-mode">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Video Content"
          title={pageTitle}
          description={mode === 'delete' ? 'Xác nhận xóa video' : 'Thiết lập thông tin video và quản lý phụ đề AI với trình xem trước thực tế.'}
          actions={<Link to="/admin/videos" className="btn btn-outline-secondary">Quay lại danh sách</Link>}
        />

        {mode === 'delete' ? (
          <div className="row g-3">
            <div className="col-12">
              <AdminSectionCard title={pageTitle}>
                <div className="alert alert-danger">
                  Bạn đang chuẩn bị xóa video <strong>{videoDraft.title || id}</strong>.
                  <br /><br />
                  - <strong>Xóa tạm thời:</strong> Video sẽ được chuyển sang trạng thái "Nháp" và ẩn khỏi website, nhưng vẫn được lưu lại để biên tập.
                  <br />
                  - <strong>Xóa vĩnh viễn:</strong> Toàn bộ dữ liệu của video này sẽ bị gỡ bỏ hoàn toàn khỏi hệ thống.
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-warning" onClick={() => handleDelete(false)}>Xóa tạm thời</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(true)}>Xóa vĩnh viễn</button>
                  <Link to="/admin/videos" className="btn btn-outline-secondary ms-2">Hủy</Link>
                </div>
                {error && <div className="text-danger mt-3">{error}</div>}
                {success && <div className="text-success mt-3">{success}</div>}
              </AdminSectionCard>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            <div className="col-12 col-xl-7">
              <AdminSectionCard title="Thông tin cơ bản">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Tiêu đề video <span className="text-danger">*</span></label>
                  <input className="form-control" value={videoDraft.title} onChange={e => setField('title', e.target.value)} />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Kênh <span className="text-danger">*</span></label>
                    <select className="form-select" value={videoDraft.channelId} onChange={e => setField('channelId', e.target.value)}>
                      <option value="">Chọn kênh</option>
                      {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Độ khó</label>
                    <select className="form-select" value={videoDraft.difficulty} onChange={e => setField('difficulty', e.target.value)}>
                      {['Cơ bản', 'Trung bình', 'Nâng cao'].map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Trạng thái</label>
                  <select className="form-select" value={videoDraft.status} onChange={e => setField('status', e.target.value)}>
                    <option value="Công khai">Đã xuất bản</option>
                    <option value="Chờ biên tập">Chờ biên tập</option>
                    <option value="Nháp">Nháp</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Thumbnail (URL)</label>
                  <input className="form-control" placeholder="Link ảnh thumbnail..." value={videoDraft.thumbnail} onChange={e => setField('thumbnail', e.target.value)} />
                  {videoDraft.thumbnail && (
                    <div className="mt-2 text-center">
                      <img src={videoDraft.thumbnail} alt="Thumbnail preview" className="img-fluid rounded border" style={{ maxHeight: '150px' }} />
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Thời lượng</label>
                  <input className="form-control" placeholder="Ví dụ: 5:30" value={videoDraft.duration} onChange={e => setField('duration', e.target.value)} />
                </div>

                {mode === 'create' ? (
                  <div className="mt-4 p-3 border rounded bg-light">
                    <h6 className="mb-3">YouTube Link & Phụ đề AI</h6>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">URL YouTube <span className="text-danger">*</span></label>
                      <div className="input-group mb-2">
                        <input className="form-control" placeholder="https://youtube.com/watch?v=..." value={videoDraft.youtubeUrl} onChange={e => setField('youtubeUrl', e.target.value)} />
                        <button className="btn btn-outline-info" type="button" onClick={handleFetchMetadata}>Lấy Metadata</button>
                      </div>
                    </div>
                    <button className="btn btn-primary w-100" onClick={handleUpload} disabled={isUploading}>
                      {isUploading ? 'Đang xử lý...' : 'Bắt đầu xử lý video & phụ đề AI'}
                    </button>
                  </div>
                ) : (
                  <div className="mt-4">
                    <button className="btn btn-primary" onClick={handleSaveMetadata}>Lưu thay đổi</button>
                  </div>
                )}

                {error && <div className="alert alert-danger mt-3">{error}</div>}
                {success && <div className="alert alert-success mt-3">{success}</div>}
              </AdminSectionCard>

              {subtitleStatus !== 'IDLE' && (
                <AdminSectionCard title="Trạng thái xử lý AI" className="mt-3">
                  <div className="text-center p-3">
                    {subtitleStatus === 'PROCESSING' && (
                      <>
                        <div className="spinner-border text-primary mb-2" />
                        <p>AI đang bóc tách âm thanh và tạo phụ đề. Vui lòng đợi...</p>
                      </>
                    )}
                    {subtitleStatus === 'DONE' && <p className="text-success">✅ Đã hoàn thành! Bạn có thể xem và sửa phụ đề bên phải.</p>}
                    {subtitleStatus === 'ERROR' && <p className="text-danger">❌ Lỗi trong quá trình xử lý AI.</p>}
                  </div>
                </AdminSectionCard>
              )}
            </div>

            {/* REALISTIC PREVIEW COLUMN */}
            <div className="col-12 col-xl-5">
              <AdminSectionCard title="Xem trước thực tế">
                <div
                  className="video-watch__player-container mb-3"
                  onMouseEnter={() => setShowControls(true)}
                  onMouseLeave={() => isPlaying && setShowControls(false)}
                  style={{ width: '100%', margin: '0' }}
                >
                  {videoStreamUrl ? (
                    <video
                      ref={videoRef}
                      src={videoStreamUrl}
                      onTimeUpdate={handleVideoTimeUpdate}
                      onLoadedMetadata={onMetadataLoaded}
                      onClick={togglePlay}
                      className="video-watch__video-element"
                    />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center text-muted h-100 bg-dark">
                      {videoDraft.youtubeUrl ? (
                        <div className="p-4 text-center">
                          <p>Chưa có luồng video.</p>
                          <small>Nhấn "Bắt đầu xử lý" để stream trực tiếp từ server.</small>
                        </div>
                      ) : 'Chưa có nguồn video'}
                    </div>
                  )}

                  {/* Player Controls Overlay */}
                  <div className={`video-watch__controls ${showControls ? 'is-visible' : 'is-hidden'}`}>
                    <div className="video-watch__progress-container">
                      <input type="range" min="0" max={duration} step="0.1" value={currentTime} onChange={handleProgressChange} className="video-watch__progress-bar" />
                    </div>
                    <div className="video-watch__controls-main">
                      <div className="video-watch__controls-left">
                        <button onClick={() => handleSkip(-10)} className="video-watch__skip-btn"><RotateCcw size={18} /></button>
                        <button onClick={togglePlay} className="video-watch__play-btn">{isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}</button>
                        <button onClick={() => handleSkip(10)} className="video-watch__skip-btn"><RotateCw size={18} /></button>
                        <span className="video-watch__time-display small">{formatTime(currentTime)} / {formatTime(duration)}</span>
                      </div>
                      <div className="video-watch__controls-right">
                        <button onClick={toggleMute} className="video-watch__volume-btn">{isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
                        <div className="video-watch__speed-selector ms-2">
                          <button className="video-watch__speed-btn">{playbackRate}x</button>
                          <div className="video-watch__speed-options">
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => <button key={s} onClick={() => changeSpeed(s)} className={playbackRate === s ? 'is-active' : ''}>{s}x</button>)}
                          </div>
                        </div>
                        <button onClick={toggleFullscreen} className="video-watch__fullscreen-btn ms-2" title="Toàn màn hình">
                          <Maximize size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subtitle Preview Box */}
                <div className="video-watch__line-preview mb-3" style={{ padding: '10px' }}>
                  {activeSegment ? (
                    <div className="video-watch__clickable-text-wrapper">
                      <div className="video-watch__clickable-text">
                        <p className="m-0 text-white text-center fw-medium" style={{ fontSize: '1.2rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                          {activeSegment.text}
                        </p>
                      </div>
                    </div>
                  ) : <span className="text-muted small">Phụ đề sẽ hiển thị ở đây khi video chạy...</span>}
                </div>

                <SegmentsEditor
                  segments={videoDraft.segments}
                  onSegmentsChange={newSegments => setField('segments', newSegments)}
                  activeId={activeSubtitleId}
                  onSegmentClick={(seg) => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = seg.startSec
                      videoRef.current.play()
                      setIsPlaying(true)
                    }
                  }}
                />
              </AdminSectionCard>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
