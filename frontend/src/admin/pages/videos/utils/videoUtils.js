import { adminFetch } from '../../../utils/api'

export function normalizeChannelRow(row) {
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

export function normalizeVideoRow(row) {
  return {
    id: row.id,
    channelId: row.channelId ?? null,
    channelName: row.channelName ?? '',
    title: row.title ?? '',
    youtubeUrl: row.url ?? '',
    difficulty: row.difficulty ?? 'B1',
    duration: row.duration ?? '',
    wordsHighlighted: row.wordsHighlighted ?? 0,
    status: row.status ?? 'Chờ biên tập',
    thumbnail: row.thumbnail ?? '',
    filePath: row.filePath ?? '',
    subtitleStatus: row.subtitleStatus ?? 'PENDING',
    createdAt: row.createdAt ?? '',
    updatedAt: row.updatedAt ?? '',
    deletedAt: row.deletedAt ?? null,
    views: row.views ?? 0,
  }
}

export function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function extractVideoId(url) {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
  return match ? match[1] : null
}

export async function fetchVideoManagementData() {
  const [channelResponse, videoResponse, statsResponse] = await Promise.all([
    adminFetch(`/api/admin/video-channels`),
    adminFetch(`/api/admin/videos`),
    adminFetch(`/api/admin/reports/content-summary`),
  ])
  if (!channelResponse.ok || !videoResponse.ok) throw new Error('Cannot fetch video data')
  
  const [channelPayload, videoPayload] = await Promise.all([channelResponse.json(), videoResponse.json()])
  let statsPayload = null
  if (statsResponse.ok) {
    statsPayload = await statsResponse.json()
  }
  
  return {
    channels: channelPayload,
    videos: videoPayload,
    stats: statsPayload?.video || null
  }
}

export async function uploadVideoUrl(videoDraft) {
  const response = await adminFetch(`/api/admin/videos/upload-url`, {
    method: 'POST',
    body: JSON.stringify({
      title: videoDraft.title.trim(),
      channelId: Number(videoDraft.channelId),
      youtubeUrl: videoDraft.youtubeUrl.trim(),
      difficulty: videoDraft.difficulty,
      status: videoDraft.status,
      thumbnail: videoDraft.thumbnail,
    }),
  })
  if (!response.ok) throw new Error('Xử lý thất bại')
  return await response.json()
}

export async function fetchVideoCaptions(youtubeUrl) {
  const response = await adminFetch(`/api/admin/videos/fetch-captions`, {
    method: 'POST',
    body: JSON.stringify({ youtubeUrl: youtubeUrl.trim() }),
  })
  if (!response.ok) throw new Error('Lấy dữ liệu thất bại')
  return await response.json()
}

export async function updateVideo(id, videoDraft) {
  const response = await adminFetch(`/api/admin/videos/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...videoDraft,
      channelId: Number(videoDraft.channelId)
    }),
  })
  if (!response.ok) throw new Error('Cập nhật thất bại')
  return response
}

export async function deleteVideo(id, force = false) {
  const response = await adminFetch(`/api/admin/videos/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' })
  if (!response.ok && response.status !== 204) throw new Error('Xóa thất bại')
  return response
}
