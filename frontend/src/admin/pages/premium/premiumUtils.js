import { adminFetch } from '../../utils/api'

export function formatDateTime(value) {
  if (!value) return '---'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '---'
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function normalizeRequestRow(row) {
  return {
    id: row.id,
    userId: row.userId,
    subscriptionId: row.subscriptionId,
    email: row.email ?? '(không có email)',
    packageName: row.packageName ?? 'Premium',
    requestedAt: formatDateTime(row.requestedAt),
    status: row.status ?? 'Chờ duyệt',
  }
}

export function normalizeMemberRow(row) {
  return {
    id: row.subscriptionId,
    subscriptionId: row.subscriptionId,
    userId: row.userId,
    email: row.email ?? '(không có email)',
    plan: row.plan ?? 'Premium',
    expiresAt: formatDateTime(row.expiresAt),
    action: row.status === 'Hết hạn' ? 'Gia hạn' : row.status === 'Đã hủy' ? 'Đã hủy' : 'Hủy quyền',
    status: row.status ?? 'Đang hoạt động',
  }
}

export function normalizeAuditRow(row) {
  return {
    id: row.id,
    email: row.email || '(không có email)',
    action: row.action || '',
    statusBefore: row.statusBefore || '---',
    statusAfter: row.statusAfter || '---',
    reason: row.reason || '---',
    adminActor: row.adminActor || 'system',
    createdAt: formatDateTime(row.createdAt),
  }
}

export function normalizePlanRow(row) {
  return {
    id: row.id,
    name: row.name,
    price: typeof row.price === 'number' ? row.price : parseFloat(row.price) || 0,
    durationDays: typeof row.durationDays === 'number' ? row.durationDays : parseInt(row.durationDays) || 30,
    description: row.description || '',
    limits: row.limits || []
  }
}

export function getAdminActor() {
  return window.localStorage.getItem('admin_actor') || 'admin'
}

export const DEFAULT_REQUEST_FILTER = { status: 'PENDING', email: '', fromDate: '', toDate: '' }
export const DEFAULT_MEMBER_FILTER = { status: 'ALL', email: '', expiringInDays: '' }

export function requestStatusTone(status) {
  if (status === 'Chờ duyệt') return 'warning'
  if (status === 'Đã duyệt') return 'success'
  if (status === 'Từ chối') return 'danger'
  return 'neutral'
}

export function memberActionTone(action) {
  if (action === 'Gia hạn') return 'warning'
  if (action === 'Hủy quyền') return 'danger'
  return 'info'
}

export function auditActionTone(action) {
  const normalized = (action || '').toUpperCase()
  if (normalized.includes('APPROVE') || normalized.includes('GRANT') || normalized.includes('EXTEND')) return 'success'
  if (normalized.includes('REJECT') || normalized.includes('CANCEL')) return 'danger'
  return 'neutral'
}

// API Functions
export async function fetchPremiumData() {
  const [requestsRes, membersRes, plansRes, auditRes] = await Promise.all([
    adminFetch(`/api/admin/premium/requests?status=ALL`),
    adminFetch(`/api/admin/premium/members?status=ALL`),
    adminFetch(`/api/admin/premium/plans`),
    adminFetch(`/api/admin/premium/audit-logs?limit=20`),
  ])

  if (!requestsRes.ok || !membersRes.ok || !plansRes.ok || !auditRes.ok) {
    throw new Error('Cannot fetch premium data')
  }

  return {
    requests: await requestsRes.json(),
    members: await membersRes.json(),
    plans: await plansRes.json(),
    audit: await auditRes.json(),
  }
}

export async function refreshPremiumData(requestFilter, memberFilter) {
  const requestQuery = new URLSearchParams({ status: requestFilter.status || 'ALL' })
  if (requestFilter.email?.trim()) requestQuery.set('email', requestFilter.email.trim())
  if (requestFilter.fromDate) requestQuery.set('fromDate', requestFilter.fromDate)
  if (requestFilter.toDate) requestQuery.set('toDate', requestFilter.toDate)

  const memberQuery = new URLSearchParams({ status: memberFilter.status || 'ALL' })
  if (memberFilter.email?.trim()) memberQuery.set('email', memberFilter.email.trim())
  if (memberFilter.expiringInDays?.trim()) memberQuery.set('expiringInDays', memberFilter.expiringInDays.trim())

  const [requestsRes, membersRes, auditRes] = await Promise.all([
    adminFetch(`/api/admin/premium/requests?${requestQuery.toString()}`),
    adminFetch(`/api/admin/premium/members?${memberQuery.toString()}`),
    adminFetch(`/api/admin/premium/audit-logs?limit=20`),
  ])

  if (!requestsRes.ok || !membersRes.ok || !auditRes.ok) {
    throw new Error('Cannot refresh premium data')
  }

  return {
    requests: await requestsRes.json(),
    members: await membersRes.json(),
    audit: await auditRes.json(),
  }
}

export async function approveRequest(id, reason) {
  const response = await adminFetch(`/api/admin/premium/requests/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ reason, adminActor: getAdminActor() }),
  })
  if (!response.ok && response.status !== 204) throw new Error('Cannot approve request')
  return response
}

export async function rejectRequest(id, reason) {
  const response = await adminFetch(`/api/admin/premium/requests/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason: reason.trim(), adminActor: getAdminActor() }),
  })
  if (!response.ok && response.status !== 204) throw new Error('Cannot reject request')
  return response
}

export async function cancelPremium(userId, reason) {
  const response = await adminFetch(`/api/admin/premium/members/${userId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason: reason.trim(), adminActor: getAdminActor() }),
  })
  if (!response.ok && response.status !== 204) throw new Error('Cannot cancel premium')
  return response
}

export async function fetchPlanById(id) {
  const response = await adminFetch(`/api/admin/premium/plans/${id}`)
  if (!response.ok) throw new Error('Cannot fetch plan')
  return await response.json()
}

export async function savePremiumPlan(id, planData) {
  const isEdit = !!id
  const url = `/api/admin/premium/plans${isEdit ? `/${id}` : ''}`
  const response = await adminFetch(url, {
    method: isEdit ? 'PUT' : 'POST',
    body: JSON.stringify(planData),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'Lưu thất bại')
  }
  return response
}

export async function deletePlan(id) {
  const response = await adminFetch(`/api/admin/premium/plans/${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error('Failed to delete plan')
  return response
}

export async function bulkExtend(userIds, days, reason) {
  return Promise.all(
    userIds.map((userId) =>
      adminFetch(`/api/admin/premium/members/${userId}/extend`, {
        method: 'POST',
        body: JSON.stringify({
          durationDays: days,
          reason: reason.trim(),
          adminActor: getAdminActor(),
        }),
      })
    )
  )
}

export async function bulkCancel(userIds, reason) {
  return Promise.all(
    userIds.map((userId) =>
      adminFetch(`/api/admin/premium/members/${userId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({
          reason: reason.trim(),
          adminActor: getAdminActor(),
        }),
      })
    )
  )
}
