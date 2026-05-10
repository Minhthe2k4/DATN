import { adminFetch } from '../../../utils/api'

export function normalizeArticleRow(row) {
  const parsedWordsHighlighted = Number.parseInt(row.wordsHighlighted ?? row.wordHighlighted ?? 0, 10)
  return {
    id: row.id,
    title: row.title ?? '',
    topicId: row.topicId ?? null,
    topic: row.topic ?? row.topicName ?? 'Chưa gán chủ đề',
    difficulty: row.difficulty ?? 'Trung bình',
    content: row.content ?? '',
    articleImage: row.articleImage ?? row.article_image ?? '',
    createdAt: row.createdAt ?? row.created_at ?? row.create_at ?? '',
    wordsHighlighted: Number.isNaN(parsedWordsHighlighted) ? 0 : Math.max(parsedWordsHighlighted, 0),
    sourceUrl: row.sourceUrl ?? row.source ?? '',
    status: row.status ?? 'Chờ biên tập',
    views: row.views ?? 0,
  }
}

export function normalizeTopicRow(row) {
  const normalizedStatus = typeof row.status === 'boolean'
    ? (row.status ? 'Hoạt động' : 'Tạm dừng')
    : (row.status ?? 'Hoạt động')

  return {
    id: row.id,
    name: row.name ?? '',
    description: row.description ?? '',
    status: normalizedStatus,
    articleTopicImage: row.articleTopicImage ?? row.article_topic_image ?? '',
    articleCount: row.articleCount ?? 0,
    createdAt: row.createdAt ?? '',
    updatedAt: row.updatedAt ?? '',
    deletedAt: row.deletedAt ?? null
  }
}

export async function fetchReadingData() {
  const [articleResponse, topicResponse, statsResponse] = await Promise.all([
    adminFetch(`/api/admin/readings`),
    adminFetch(`/api/admin/reading-topics`),
    adminFetch(`/api/admin/reports/content-summary`),
  ])
  
  if (!articleResponse.ok || !topicResponse.ok) throw new Error('Cannot fetch reading data')
  
  const [articlePayload, topicPayload] = await Promise.all([articleResponse.json(), topicResponse.json()])
  let statsPayload = null
  if (statsResponse.ok) {
    statsPayload = await statsResponse.json()
  }
  
  return {
    articles: articlePayload,
    topics: topicPayload,
    stats: statsPayload?.reading || null
  }
}

export async function saveReading(mode, id, draft) {
  const url = `/api/admin/readings${mode === 'edit' ? `/${id}` : ''}`
  const response = await adminFetch(url, {
    method: mode === 'edit' ? 'PUT' : 'POST',
    body: JSON.stringify({
      ...draft,
      topicId: Number(draft.topicId),
      wordsHighlighted: Number(draft.wordsHighlighted)
    }),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'Lưu thất bại')
  }
  return response
}

export async function crawlArticle(sourceUrl) {
  const response = await adminFetch(`/api/admin/readings/crawl`, {
    method: 'POST',
    body: JSON.stringify({ sourceUrl: sourceUrl.trim() }),
  })
  if (!response.ok) throw new Error('Crawl thất bại')
  return await response.json()
}

export async function deleteReading(id, force = false) {
  const response = await adminFetch(`/api/admin/readings/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' })
  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'Xóa thất bại')
  }
  return response
}

export async function saveReadingTopic(mode, id, draft) {
  const url = `/api/admin/reading-topics${mode === 'edit' ? `/${id}` : ''}`
  const response = await adminFetch(url, {
    method: mode === 'edit' ? 'PUT' : 'POST',
    body: JSON.stringify(draft),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'Lưu thất bại')
  }
  return response
}

export async function deleteReadingTopic(id, force = false) {
  const response = await adminFetch(`/api/admin/reading-topics/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' })
  if (!response.ok && response.status !== 204) throw new Error('Xóa thất bại')
  return response
}
