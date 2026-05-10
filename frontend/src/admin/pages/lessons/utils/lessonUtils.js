export function normalizeLessonRow(row) {
  return {
    id: row.id,
    name: row.name ?? '',
    description: row.description ?? '',
    topic_id: row.topicId ?? row.topic_id ?? '',
    difficulty: row.difficulty ?? 'Trung bình',
    status: row.status ?? 'Đang mở',
    lessonImage: row.lessonImage ?? '',
    isPremium: !!row.isPremium,
    views: row.views ?? 0,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function normalizeTopicRow(row) {
  return {
    id: row.id,
    name: row.name ?? '',
  }
}

export function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

export function formatDateTime(dateString) {
  if (!dateString) return 'Chưa có'
  const date = new Date(dateString)
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
