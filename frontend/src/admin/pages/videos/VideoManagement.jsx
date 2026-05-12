import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { videoLessons, youtubeChannels } from '../../data/adminData'
import { AdminPageHeader } from '../../components/console/AdminUi'
import { usePagination } from '../../hooks/usePagination'
import { modal } from '../../../utils/modalUtils'

import {
  fetchVideoManagementData,
  normalizeChannelRow,
  normalizeVideoRow
} from './utils/videoUtils'

import { VideoStats } from './components/VideoStats'
import { VideoChannelsTable } from './components/VideoChannelsTable'
import { VideosListTable } from './components/VideosListTable'
import { VideoSidebars } from './components/VideoSidebars'

// Component quản lý nội dung Video dành cho Admin.
// Cho phép quản lý các video học tập và các kênh YouTube liên quan.
export function VideoManagement() {
  // Danh sách các kênh video và danh sách video cụ thể
  const [channels, setChannels] = useState(youtubeChannels)
  const [videos, setVideos] = useState(videoLessons)
  const [isLoading, setIsLoading] = useState(true)
  // Dữ liệu thống kê tổng hợp cho Dashboard video
  const [statsData, setStatsData] = useState(null)

  // Bộ lọc cho danh sách video (Tìm kiếm, Kênh, Độ khó, Trạng thái)
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
        const data = await fetchVideoManagementData()
        if (disposed) return

        setChannels(Array.isArray(data.channels) ? data.channels.map(normalizeChannelRow) : youtubeChannels)
        setVideos(Array.isArray(data.videos) ? data.videos.map(normalizeVideoRow) : videoLessons)
        if (data.stats) setStatsData(data.stats)
      } catch {
        if (disposed) return
        setChannels(youtubeChannels)
        setVideos(videoLessons)
        modal.error('Không thể tải dữ liệu video từ backend.')
      } finally {
        if (!disposed) setIsLoading(false)
      }
    }
    loadData()
    return () => { disposed = true }
  }, [])

  const topVideos = useMemo(() => {
    return [...videos].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5)
  }, [videos])

  const channelData = useMemo(() => {
    return channels
      .map(c => ({
        name: c.name,
        count: videos.filter(v => v.channelId === c.id).length
      }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [channels, videos])

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Video Content"
          title="Quản lý video"
          description="Tổ chức nội dung video theo kênh YouTube và quản lý quá trình biên tập."
          actions={
            <div className="d-flex gap-2">
              <Link to="/admin/video-channels/new" className="btn btn-outline-primary d-flex align-items-center gap-2">
                <Plus size={18} /> Thêm kênh
              </Link>
              <Link to="/admin/videos/new" className="btn btn-primary d-flex align-items-center gap-2">
                <Plus size={18} /> Thêm video
              </Link>
            </div>
          }
        />

        {isLoading ? <div className="alert alert-light border">Đang tải dữ liệu...</div> : null}

        <VideoStats statsData={statsData} channels={channels} videos={videos} />

        <div className="row g-3 mt-1">
          <div className="col-12 col-xl-9">
            <div className="d-flex flex-column gap-3">
              <VideoChannelsTable
                channelsPagination={channelsPagination}
                searchChannelTerm={searchChannelTerm}
                setSearchChannelTerm={setSearchChannelTerm}
              />

              <VideosListTable
                videosPagination={videosPagination}
                filterDifficulty={filterDifficulty}
                setFilterDifficulty={setFilterDifficulty}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                filterChannelId={filterChannelId}
                setFilterChannelId={setFilterChannelId}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                channels={channels}
              />
            </div>
          </div>

          <div className="col-12 col-xl-3">
            <VideoSidebars topVideos={topVideos} channelData={channelData} />
          </div>
        </div>
      </div>
    </div>
  )
}
