import { adminFetch } from '../../../utils/api'

export function formatDate(value) {
  if (!value) return '---'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '---'
  return date.toLocaleDateString('vi-VN')
}

export function normalizeUserRow(row) {
  return {
    id: row.id,
    username: row.username ?? '',
    email: row.email ?? '',
    fullname: row.fullname ?? '',
    role: row.role ?? 'USER',
    createdAt: formatDate(row.createdAt),
    rawCreatedAt: row.createdAt,
    status: row.status ?? (row.isActive ? 'Hoạt động' : 'Bị khóa'),
    isActive: Boolean(row.isActive),
    premium: row.premium ? 'Premium' : 'Thường',
    avatar: row.avatar ?? '',
    learnedWords: row.learnedWords ?? 0,
  }
}

export async function fetchUsers() {
  const response = await adminFetch(`/api/admin/users`)
  if (!response.ok) throw new Error('Cannot fetch users')
  return await response.json()
}

export async function fetchUserById(id) {
  const response = await adminFetch(`/api/admin/users/${id}`)
  if (!response.ok) throw new Error('Cannot fetch user')
  return await response.json()
}

export async function updateUser(id, draft) {
  const response = await adminFetch(`/api/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(draft),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'Lưu thất bại')
  }
  return response
}

export async function deleteUser(id, force = false) {
  const response = await adminFetch(`/api/admin/users/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' })
  if (!response.ok && response.status !== 204) throw new Error('Xóa thất bại')
  return response
}
