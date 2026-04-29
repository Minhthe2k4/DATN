import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { premiumMembers, premiumRequests } from '../../data/adminData'
import { AdminPageHeader, AdminSectionCard, Badge, SimpleTable, StatGrid, FilterTabs, Pagination } from '../../components/console/AdminUi'
import { usePagination } from '../../hooks/usePagination'
import './premium-management.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

function formatDateTime(value) {
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

function normalizeRequestRow(row) {
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

function normalizeMemberRow(row) {
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

function normalizeAuditRow(row) {
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

function getAdminActor() {
  return window.localStorage.getItem('admin_actor') || 'admin'
}

function normalizePlanRow(row) {
  return {
    id: row.id,
    name: row.name,
    price: typeof row.price === 'number' ? row.price : parseFloat(row.price) || 0,
    durationDays: typeof row.durationDays === 'number' ? row.durationDays : parseInt(row.durationDays) || 30,
    description: row.description || '',
    limits: row.limits || []
  }
}

const DEFAULT_REQUEST_FILTER = { status: 'PENDING', email: '', fromDate: '', toDate: '' }
const DEFAULT_MEMBER_FILTER = { status: 'ALL', email: '', expiringInDays: '' }


function requestStatusTone(status) {
  if (status === 'Chờ duyệt') {
    return 'warning'
  }
  if (status === 'Đã duyệt') {
    return 'success'
  }
  if (status === 'Từ chối') {
    return 'danger'
  }
  return 'neutral'
}

function memberActionTone(action) {
  if (action === 'Gia hạn') {
    return 'warning'
  }
  if (action === 'Hủy quyền') {
    return 'danger'
  }
  return 'info'
}

function auditActionTone(action) {
  const normalized = (action || '').toUpperCase()
  if (normalized.includes('APPROVE') || normalized.includes('GRANT') || normalized.includes('EXTEND')) {
    return 'success'
  }
  if (normalized.includes('REJECT') || normalized.includes('CANCEL')) {
    return 'danger'
  }
  return 'neutral'
}

export function PremiumManagement() {
  const navigate = useNavigate()
  const [requestRows, setRequestRows] = useState(premiumRequests)
  const [memberRows, setMemberRows] = useState(premiumMembers)
  const [planRows, setPlanRows] = useState([])
  const [auditRows, setAuditRows] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [activeTab, setActiveTab] = useState('requests')

  const [requestFilter, setRequestFilter] = useState(DEFAULT_REQUEST_FILTER)
  const [memberFilter, setMemberFilter] = useState(DEFAULT_MEMBER_FILTER)
  const [selectedMembers, setSelectedMembers] = useState(new Set())

  // Pagination using custom hook
  const requestsPagination = usePagination(requestRows, 10)
  const membersPagination = usePagination(memberRows, 10)

  useEffect(() => {
    let disposed = false

    async function loadData() {
      try {
        const [requestsResponse, membersResponse, plansResponse, auditResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/premium/requests?status=ALL`),
          fetch(`${API_BASE_URL}/api/admin/premium/members?status=ALL`),
          fetch(`${API_BASE_URL}/api/admin/premium/plans`),
          fetch(`${API_BASE_URL}/api/admin/premium/audit-logs?limit=20`),
        ])

        if (!requestsResponse.ok || !membersResponse.ok || !plansResponse.ok || !auditResponse.ok) {
          throw new Error('Cannot fetch premium data')
        }

        const [requestsPayload, membersPayload, plansPayload, auditPayload] = await Promise.all([
          requestsResponse.json(),
          membersResponse.json(),
          plansResponse.json(),
          auditResponse.json(),
        ])

        if (disposed) {
          return
        }

        setRequestRows(Array.isArray(requestsPayload) ? requestsPayload.map(normalizeRequestRow) : premiumRequests)
        setMemberRows(Array.isArray(membersPayload) ? membersPayload.map(normalizeMemberRow) : premiumMembers)
        setPlanRows(Array.isArray(plansPayload) ? plansPayload.map(normalizePlanRow) : [])
        setAuditRows(Array.isArray(auditPayload) ? auditPayload.map(normalizeAuditRow) : [])
        setLoadError('')
      } catch {
        if (disposed) {
          return
        }
        setRequestRows(premiumRequests)
        setMemberRows(premiumMembers)
        setPlanRows([])
        setAuditRows([])
        setLoadError('Không thể tải dữ liệu premium từ backend, đang hiển thị dữ liệu mẫu.')
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

  const reloadData = async (requestFilterValue = requestFilter, memberFilterValue = memberFilter) => {
    const requestQuery = new URLSearchParams({ status: requestFilterValue.status || 'ALL' })
    if (requestFilterValue.email.trim()) {
      requestQuery.set('email', requestFilterValue.email.trim())
    }
    if (requestFilterValue.fromDate) {
      requestQuery.set('fromDate', requestFilterValue.fromDate)
    }
    if (requestFilterValue.toDate) {
      requestQuery.set('toDate', requestFilterValue.toDate)
    }

    const memberQuery = new URLSearchParams({ status: memberFilterValue.status || 'ALL' })
    if (memberFilterValue.email.trim()) {
      memberQuery.set('email', memberFilterValue.email.trim())
    }
    if (memberFilterValue.expiringInDays.trim()) {
      memberQuery.set('expiringInDays', memberFilterValue.expiringInDays.trim())
    }

    const [requestsResponse, membersResponse, auditResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/admin/premium/requests?${requestQuery.toString()}`),
      fetch(`${API_BASE_URL}/api/admin/premium/members?${memberQuery.toString()}`),
      fetch(`${API_BASE_URL}/api/admin/premium/audit-logs?limit=20`),
    ])

    if (!requestsResponse.ok || !membersResponse.ok || !auditResponse.ok) {
      throw new Error('Cannot refresh premium data')
    }

    const [requestsPayload, membersPayload, auditPayload] = await Promise.all([
      requestsResponse.json(),
      membersResponse.json(),
      auditResponse.json(),
    ])

    setRequestRows(Array.isArray(requestsPayload) ? requestsPayload.map(normalizeRequestRow) : premiumRequests)
    setMemberRows(Array.isArray(membersPayload) ? membersPayload.map(normalizeMemberRow) : premiumMembers)
    setAuditRows(Array.isArray(auditPayload) ? auditPayload.map(normalizeAuditRow) : [])
  }

  const applyRequestFilters = async () => {
    try {
      await reloadData()
      setActionError('')
    } catch {
      setActionError('Không thể áp dụng bộ lọc cho yêu cầu Premium.')
    }
  }

  const resetRequestFilters = async () => {
    try {
      setRequestFilter(DEFAULT_REQUEST_FILTER)
      await reloadData(DEFAULT_REQUEST_FILTER, memberFilter)
      setActionError('')
    } catch {
      setActionError('Không thể đặt lại bộ lọc yêu cầu Premium.')
    }
  }

  const applyMemberFilters = async () => {
    try {
      await reloadData()
      setActionError('')
    } catch {
      setActionError('Không thể áp dụng bộ lọc thành viên Premium.')
    }
  }

  const resetMemberFilters = async () => {
    try {
      setMemberFilter(DEFAULT_MEMBER_FILTER)
      await reloadData(requestFilter, DEFAULT_MEMBER_FILTER)
      setActionError('')
    } catch {
      setActionError('Không thể đặt lại bộ lọc thành viên Premium.')
    }
  }

  const handleApprove = async (row) => {
    const reason = window.prompt('Lý do duyệt (tuỳ chọn):', '') || ''
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/premium/requests/${row.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, adminActor: getAdminActor() }),
      })

      if (!response.ok && response.status !== 204) {
        throw new Error('Cannot approve request')
      }

      await reloadData()
      setActionError('')
    } catch {
      setActionError('Duyệt yêu cầu Premium thất bại.')
    }
  }

  const handleReject = async (row) => {
    const reason = window.prompt('Nhập lý do từ chối (bắt buộc):', '') || ''
    if (!reason.trim()) {
      setActionError('Bạn cần nhập lý do khi từ chối yêu cầu Premium.')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/premium/requests/${row.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim(), adminActor: getAdminActor() }),
      })

      if (!response.ok && response.status !== 204) {
        throw new Error('Cannot reject request')
      }

      await reloadData()
      setActionError('')
    } catch {
      setActionError('Từ chối yêu cầu Premium thất bại.')
    }
  }

  const handleCancelPremium = async (row) => {
    const confirmed = window.confirm(`Hủy quyền Premium của ${row.email}?`)
    if (!confirmed) {
      return
    }

    const reason = window.prompt('Lý do hủy Premium (bắt buộc):', '') || ''
    if (!reason.trim()) {
      setActionError('Bạn cần nhập lý do khi hủy Premium.')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/premium/members/${row.userId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim(), adminActor: getAdminActor() }),
      })

      if (!response.ok && response.status !== 204) {
        throw new Error('Cannot cancel premium')
      }

      await reloadData()
      setActionError('')
    } catch {
      setActionError('Không thể hủy Premium của người dùng này.')
    }
  }

  const handleExtendPremium = (row) => {
    navigate(`/admin/premium/members/${row.userId}/extend?email=${encodeURIComponent(row.email)}`)
  }

  const handleManualGrant = () => {
    navigate('/admin/premium/grant')
  }


  // ============= PLAN MANAGEMENT =============
  const handleAddPlan = () => {
    navigate('/admin/premium/new')
  }

  const handleEditPlan = (plan) => {
    navigate(`/admin/premium/${plan.id}/edit`)
  }


  const handleDeletePlan = async (plan) => {
    if (!window.confirm(`Xóa gói "${plan.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/premium/plans/${plan.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete plan')
      }

      await reloadData()
      setActionError('')
    } catch {
      setActionError('Không thể xóa gói Premium này.')
    }
  }

  // ============= BULK OPERATIONS =============
  const toggleMemberSelection = (memberId) => {
    const newSelected = new Set(selectedMembers)
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId)
    } else {
      newSelected.add(memberId)
    }
    setSelectedMembers(newSelected)
  }

  const toggleAllMembers = () => {
    if (selectedMembers.size === memberRows.length) {
      setSelectedMembers(new Set())
    } else {
      setSelectedMembers(new Set(memberRows.map((m) => m.userId)))
    }
  }

  const handleBulkExtend = async () => {
    if (selectedMembers.size === 0) {
      setActionError('Vui lòng chọn ít nhất 1 thành viên.')
      return
    }

    const daysText = window.prompt('Số ngày gia hạn:', '30') || '30'
    const days = Number(daysText)
    if (!Number.isFinite(days) || days <= 0) {
      setActionError('Số ngày gia hạn không hợp lệ.')
      return
    }

    const reason = window.prompt('Lý do gia hạn (bắt buộc):', '') || ''
    if (!reason.trim()) {
      setActionError('Bạn cần nhập lý do gia hạn.')
      return
    }

    try {
      await Promise.all(
        Array.from(selectedMembers).map((userId) =>
          fetch(`${API_BASE_URL}/api/admin/premium/members/${userId}/extend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              durationDays: days,
              reason: reason.trim(),
              adminActor: getAdminActor(),
            }),
          })
        )
      )

      setSelectedMembers(new Set())
      await reloadData()
      setActionError('')
    } catch {
      setActionError('Gia hạn hàng loạt thất bại.')
    }
  }

  const handleBulkCancel = async () => {
    if (selectedMembers.size === 0) {
      setActionError('Vui lòng chọn ít nhất 1 thành viên.')
      return
    }

    if (!window.confirm(`Hủy Premium của ${selectedMembers.size} thành viên?`)) {
      return
    }

    const reason = window.prompt('Lý do hủy (bắt buộc):', '') || ''
    if (!reason.trim()) {
      setActionError('Bạn cần nhập lý do hủy.')
      return
    }

    try {
      await Promise.all(
        Array.from(selectedMembers).map((userId) =>
          fetch(`${API_BASE_URL}/api/admin/premium/members/${userId}/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reason: reason.trim(),
              adminActor: getAdminActor(),
            }),
          })
        )
      )

      setSelectedMembers(new Set())
      await reloadData()
      setActionError('')
    } catch {
      setActionError('Hủy hàng loạt thất bại.')
    }
  }

  const stats = useMemo(() => [
    {
      label: 'Yêu cầu chờ duyệt',
      value: requestRows.length.toString(),
      meta: 'Yêu cầu nâng cấp đang chờ xử lý',
      icon: 'iconoir-clock',
    },
    {
      label: 'Thành viên Premium',
      value: memberRows.length.toString(),
      meta: 'Đang có quyền truy cập nội dung trả phí',
      icon: 'iconoir-star',
    },
    {
      label: 'Sắp hết hạn',
      value: memberRows.filter((member) => member.action === 'Gia hạn').length.toString(),
      meta: 'Cần theo dõi để nhắc gia hạn hoặc hủy quyền',
      icon: 'iconoir-calendar',
    },
    {
      label: 'Gói đang lưu hành',
      value: planRows.length.toString(),
      meta: 'Số lượng các gói cước đang được hệ thống hỗ trợ',
      icon: 'iconoir-package',
    },
  ], [memberRows, requestRows])

  return (
    <div className="page-content premium-management-page">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Premium Control"
          title="Quản lý tài khoản Premium"
          description="Quản lý yêu cầu, thành viên Premium, gói cước và lịch sử hoạt động."
          actions={
            <div className="premium-actions">
              <button type="button" className="btn btn-primary" onClick={handleManualGrant}>
                ➕ Cấp Premium
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => reloadData()}>
                🔄 Làm mới
              </button>
            </div>
          }
        />

        <StatGrid items={stats} />
        <div className="premium-insight-strip">
          <span>📋 Yêu cầu: <strong>{requestRows.length}</strong></span>
          <span>👥 Thành viên: <strong>{memberRows.length}</strong></span>
          <span>📦 Gói: <strong>{planRows.length}</strong></span>
          <span>📊 Audit: <strong>{auditRows.length}</strong></span>
        </div>

        {isLoading && <div className="alert alert-info">🔄 Đang tải dữ liệu premium...</div>}
        {loadError && <div className="alert alert-warning">⚠️ {loadError}</div>}
        {actionError && <div className="alert alert-danger">❌ {actionError}</div>}

        <div className="row g-4 mt-1">
          {/* REQUESTS - Left Column */}
          <div className="col-12 col-lg-6 col-xl-6">
            <AdminSectionCard>
              <h5><span className="section-header-icon">📋</span> Yêu cầu nâng cấp</h5>
              <p>Duyệt các yêu cầu từ người dùng ({requestRows.length} bản ghi)</p>

              <div className="mb-3">
                <FilterTabs
                  items={[
                    { label: 'Tất cả', value: 'ALL' },
                    { label: 'Chờ duyệt', value: 'PENDING' },
                    { label: 'Đã duyệt', value: 'APPROVED' },
                    { label: 'Từ chối', value: 'REJECTED' }
                  ]}
                  active={requestFilter.status}
                  onChange={(val) => {
                    const next = { ...requestFilter, status: val }
                    setRequestFilter(next)
                    reloadData(next, memberFilter)
                  }}
                />
              </div>

              <hr className="my-3" />
              <SimpleTable
                columns={[
                  { key: 'email', label: 'Email', render: r => <small>{r.email}</small> },
                  { key: 'packageName', label: 'Gói' },
                  { key: 'requestedAt', label: 'Ngày gửi', render: r => <small>{r.requestedAt}</small> },
                  { key: 'status', label: 'Trạng thái', render: r => <Badge tone={requestStatusTone(r.status)}>{r.status}</Badge> },
                  {
                    key: 'actions', label: '', render: r => (
                      r.status === 'Chờ duyệt' ? (
                        <div className="premium-row-actions">
                          <button className="btn btn-sm btn-success" onClick={() => handleApprove(r)} title="Duyệt">✓</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleReject(r)} title="Từ chối">✕</button>
                        </div>
                      ) : (
                        <div className="text-center text-muted" title="Đã xử lý">
                          <small><i className="iconoir-check-circle"></i></small>
                        </div>
                      )
                    )
                  },
                ]}
                rows={requestsPagination.paginatedData}
                emptyMessage="✨ Không có yêu cầu nào trùng khớp"
              />
              <Pagination
                currentPage={requestsPagination.currentPage}
                totalPages={requestsPagination.totalPages}
                onPageChange={requestsPagination.handlePageChange}
              />
            </AdminSectionCard>
          </div>

          {/* MEMBERS - Right Column */}
          <div className="col-12 col-lg-6 col-xl-6">
            <AdminSectionCard>
              <h5><span className="section-header-icon">👥</span> Thành viên Premium {selectedMembers.size > 0 && <Badge tone="info">{selectedMembers.size} chọn</Badge>}</h5>
              <p>Quản lý các thành viên Premium ({memberRows.length} người)</p>
              <hr className="my-3" />
              {selectedMembers.size > 0 && (
                <div className="alert alert-info mb-3" style={{ padding: '0.8rem' }}>
                  <div className="d-flex gap-2 flex-wrap">
                    <button className="btn btn-sm btn-warning" onClick={handleBulkExtend}>⏳ Gia hạn ({selectedMembers.size})</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={handleBulkCancel}>❌ Hủy ({selectedMembers.size})</button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedMembers(new Set())}>🗑️ Bỏ chọn</button>
                  </div>
                </div>
              )}
              <SimpleTable
                columns={[
                  {
                    key: 'check', label: <input type="checkbox" checked={selectedMembers.size > 0 && selectedMembers.size === memberRows.length} onChange={toggleAllMembers} title="Chọn tất cả" />, render: r => (
                      <input type="checkbox" checked={selectedMembers.has(r.userId)} onChange={() => toggleMemberSelection(r.userId)} />
                    )
                  },
                  { key: 'email', label: 'Email', render: r => <small>{r.email}</small> },
                  { key: 'plan', label: 'Gói' },
                  { key: 'expiresAt', label: 'Hết hạn', render: r => <small>{r.expiresAt}</small> },
                  {
                    key: 'actions', label: '', render: r => (
                      <div className="premium-row-actions">
                        <button className="btn btn-sm btn-outline-warning" onClick={() => handleExtendPremium(r)} title="Gia hạn">⏳</button>
                        {r.status === 'Đang hoạt động' && (
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancelPremium(r)} title="Hủy Premium">✕</button>
                        )}
                      </div>
                    )
                  },
                ]}
                rows={membersPagination.paginatedData}
                emptyMessage="✨ Không có thành viên Premium"
              />
              <Pagination
                currentPage={membersPagination.currentPage}
                totalPages={membersPagination.totalPages}
                onPageChange={membersPagination.handlePageChange}
              />
            </AdminSectionCard>
          </div>

          {/* PLANS - Full Width */}
          <div className="col-12">
            <AdminSectionCard>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 style={{ margin: 0 }}><span className="section-header-icon">📦</span> Gói Premium</h5>
                  <p style={{ margin: 0, marginTop: '0.25rem' }}>Quản lý các gói cước ({planRows.length} gói)</p>
                </div>
                <button className="btn btn-sm btn-primary" onClick={handleAddPlan}>➕ Thêm Gói Mới</button>
              </div>
              <hr className="my-3" />
              <SimpleTable
                columns={[
                  { key: 'name', label: 'Gói', render: r => <strong>{r.name}</strong> },
                  { key: 'price', label: 'Giá', render: r => `${r.price.toLocaleString('vi-VN')} VND` },
                  { key: 'durationDays', label: 'Kỳ hạn', render: r => `${r.durationDays} ngày` },
                  { key: 'description', label: 'Mô tả', render: r => <small>{r.description || '—'}</small> },
                  {
                    key: 'actions', label: '', render: p => (
                      <div className="premium-row-actions">
                        {p.name === 'Free' && <Badge tone="info">Mặc định</Badge>}
                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleEditPlan(p)} title="Chỉnh sửa">✏️</button>
                        {p.name !== 'Free' && (
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeletePlan(p)} title="Xóa">🗑️</button>
                        )}
                      </div>
                    )
                  },
                ]}
                rows={planRows}
                emptyMessage="✨ Chưa có gói Premium nào. Tạo gói mới để bắt đầu."
              />
            </AdminSectionCard>
          </div>

          {/* AUDIT LOG - Full Width */}
          <div className="col-12">
            <AdminSectionCard>
              <h5><span className="section-header-icon">📊</span> Lịch sử thao tác</h5>
              <p>Theo dõi các hành động quản trị Premium ({auditRows.length} bản ghi gần đây)</p>
              <hr className="my-3" />
              <SimpleTable
                columns={[
                  { key: 'createdAt', label: 'Thời gian', render: r => <small>{r.createdAt}</small> },
                  { key: 'email', label: 'Email', render: r => <small>{r.email}</small> },
                  { key: 'action', label: 'Hành động', render: r => <Badge tone={auditActionTone(r.action)}>{r.action}</Badge> },
                  { key: 'adminActor', label: 'Admin', render: r => <small>{r.adminActor}</small> },
                  { key: 'reason', label: 'Lý do', render: r => <small>{r.reason}</small> },
                ]}
                rows={auditRows}
                emptyMessage="✨ Chưa có hoạt động nào được ghi nhận"
              />
            </AdminSectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}