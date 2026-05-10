import { useEffect, useRef, useState, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AdminPageHeader, AdminSectionCard } from '../../components/console/AdminUi'
import { modal } from '../../../utils/modalUtils'

// Reuse User-side Styles
import '../../../user/pages/video/videoWatch.css'
import '../../../user/components/interaction/interaction.css'

import { adminFetch } from '../../utils/api'
import { 
  extractVideoId, 
  uploadVideoUrl, 
  fetchVideoCaptions, 
  updateVideo, 
  deleteVideo 
} from './utils/videoUtils'

import { VideoForm } from './components/VideoForm'
import { VideoPlayerPreview } from './components/VideoPlayerPreview'
import { VideoProcessingStatus } from './components/VideoProcessingStatus'
import { VideoDeleteConfirmation } from './components/VideoDeleteConfirmation'

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
  const [subtitleStatus, setSubtitleStatus] = useState('IDLE')
  const [uploadedVideoId, setUploadedVideoId] = useState(null)

  // --- Player State ---
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
        const channelRes = await adminFetch(`/api/admin/video-channels`)
        if (channelRes.ok) {
          const data = await channelRes.json()
          if (!disposed) setChannels(data)
        }

        if (mode !== 'create' && id) {
          const [videoRes, segmentsRes] = await Promise.all([
            adminFetch(`/api/admin/videos/${id}`),
            adminFetch(`/api/videos/${id}/segments`),
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
        if (!disposed) modal.error('Không thể tải dữ liệu ban đầu.')
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
        const res = await adminFetch(`/api/admin/videos/${uploadedVideoId}/status`)
        if (res.ok) {
          const data = await res.json()
          setSubtitleStatus(data.status)
          if (data.status === 'DONE' || data.status === 'ERROR') {
            clearInterval(interval)
            // If done, reload segments
            if (data.status === 'DONE') {
              const videoRes = await adminFetch(`/api/admin/videos/${uploadedVideoId}`)
              const segsRes = await adminFetch(`/api/videos/${uploadedVideoId}/segments`)
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

  // Auto-generate thumbnail when URL changes
  useEffect(() => {
    const videoId = extractVideoId(videoDraft.youtubeUrl)
    if (videoId) {
      setField('thumbnail', `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`)
    }
  }, [videoDraft.youtubeUrl])

  const handleUpload = async () => {
    if (!videoDraft.title.trim() || !videoDraft.channelId || !videoDraft.youtubeUrl.trim()) { 
      modal.warning('Vui lòng nhập đầy đủ các trường thông tin bắt buộc.')
      return 
    }

    setIsUploading(true)
    try {
      const data = await uploadVideoUrl(videoDraft)
      setUploadedVideoId(data.videoId)
      setSubtitleStatus('PROCESSING')
      modal.success('Video đang được xử lý và tạo phụ đề AI. Bạn đang được chuyển hướng về trang danh sách...')
      navigate('/admin/videos')
    } catch (err) {
      modal.error(err.message || 'Thao tác thất bại.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFetchMetadata = async () => {
    if (!videoDraft.youtubeUrl.trim()) { modal.warning('Vui lòng nhập URL YouTube.'); return }
    setIsUploading(true)
    try {
      const data = await fetchVideoCaptions(videoDraft.youtubeUrl)
      if (data.error) throw new Error(data.error)

      setVideoDraft(prev => ({
        ...prev,
        title: prev.title || data.title,
        transcript: data.transcript || '',
        segments: data.segments || [],
        thumbnail: data.thumbnailUrl || prev.thumbnail,
        duration: data.duration || prev.duration,
      }))
      modal.success('Đã lấy metadata và phụ đề thành công.')
    } catch (err) {
      modal.error(err.message || 'Thao tác thất bại.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveMetadata = async () => {
    if (!videoDraft.title.trim()) { modal.warning('Vui lòng nhập đầy đủ các trường thông tin bắt buộc.'); return }
    try {
      await updateVideo(id, videoDraft)
      modal.success('Đã lưu thay đổi thành công.')
      navigate('/admin/videos')
    } catch (err) {
      modal.error(err.message || 'Thao tác thất bại.')
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

  const videoStreamUrl = id || uploadedVideoId ? `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'}/api/videos/${id || uploadedVideoId}/stream` : ''

  const handleDelete = async (force = false) => {
    try {
      await deleteVideo(id, force)
      modal.success(force ? 'Đã xóa vĩnh viễn video.' : 'Đã xóa tạm thời video.')
      navigate('/admin/videos')
    } catch (err) {
      modal.error(err.message || 'Thao tác thất bại.')
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
                <VideoDeleteConfirmation videoDraft={videoDraft} id={id} handleDelete={handleDelete} />
              </AdminSectionCard>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            <div className="col-12 col-xl-7">
              <AdminSectionCard title="Thông tin cơ bản">
                <VideoForm 
                  videoDraft={videoDraft} 
                  setField={setField} 
                  channels={channels} 
                  mode={mode} 
                  handleFetchMetadata={handleFetchMetadata} 
                  handleUpload={handleUpload} 
                  handleSaveMetadata={handleSaveMetadata} 
                  isUploading={isUploading} 
                />
              </AdminSectionCard>

              <AdminSectionCard title="Trạng thái xử lý AI" className="mt-3">
                <VideoProcessingStatus subtitleStatus={subtitleStatus} />
              </AdminSectionCard>
            </div>

            <div className="col-12 col-xl-5">
              <AdminSectionCard title="Xem trước thực tế">
                <VideoPlayerPreview 
                  videoRef={videoRef}
                  videoStreamUrl={videoStreamUrl}
                  videoDraft={videoDraft}
                  currentTime={currentTime}
                  duration={duration}
                  isPlaying={isPlaying}
                  playbackRate={playbackRate}
                  isMuted={isMuted}
                  showControls={showControls}
                  activeSubtitleId={activeSubtitleId}
                  activeSegment={activeSegment}
                  onTimeUpdate={handleVideoTimeUpdate}
                  onMetadataLoaded={onMetadataLoaded}
                  togglePlay={togglePlay}
                  handleSkip={handleSkip}
                  handleProgressChange={handleProgressChange}
                  toggleMute={toggleMute}
                  toggleFullscreen={toggleFullscreen}
                  changeSpeed={changeSpeed}
                  setField={setField}
                  setIsPlaying={setIsPlaying}
                />
              </AdminSectionCard>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
