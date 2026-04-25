import { useEffect, useMemo, useState } from 'react'
import { premiumMembers, premiumRequests } from '../../data/adminData'
import { AdminPageHeader, AdminSectionCard, Badge, SimpleTable, StatGrid, FilterTabs } from '../../components/console/AdminUi'
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

const CONFIGURABLE_FEATURES = [
  { id: 'SAVED_VOCABULARY', label: 'Lưu từ vựng', description: 'Giới hạn số lượng từ có thể lưu', defaultLimit: 50 },
  { id: 'DICTIONARY_LOOKUP', label: 'Tra cứu từ điển', description: 'Giới hạn lượt tra từ mỗi ngày', defaultLimit: 5 },
  { id: 'ARTICLE_DOWNLOADS', label: 'Tải bài báo', description: 'Cho phép tải nội dung bài báo về máy', defaultLimit: 0 },
  { id: 'VIDEO_TRANSCRIPT_DOWNLOADS', label: 'Tải phụ đề video', description: 'Cho phép tải phụ đề video về máy', defaultLimit: 0 },
  { id: 'SAVED_ARTICLES', label: 'Lưu bài báo', description: 'Giới hạn số lượng bài báo có thể lưu', defaultLimit: 10 },
  { id: 'CUSTOM_VOCABULARY_SETS', label: 'Bộ từ vựng tùy chỉnh', description: 'Giới hạn số lượng bộ từ vựng cá nhân', defaultLimit: 2 },
  { id: 'MONTHLY_VOCABULARY_TESTS', label: 'Bài kiểm tra tháng', description: 'Giới hạn số lượng bài kiểm tra mỗi tháng', defaultLimit: 5 },
  { id: 'VOCABULARY_REVIEW', label: 'Ôn tập từ vựng', description: 'Quyền sử dụng tính năng ôn tập (Review)', defaultLimit: 0, lockOnly: true },
  { id: 'FLASHCARD_DECKS', label: 'Số lượng bộ thẻ Flashcard', description: 'Giới hạn số bộ thẻ Flashcard người dùng có thể tạo', defaultLimit: 2 },
  { id: 'FLASHCARDS_PER_DECK', label: 'Số lượng thẻ mỗi bộ', description: 'Giới hạn số thẻ tối đa trong một bộ Flashcard', defaultLimit: 20 },
  { id: 'SRS_GOLDEN_TIME', label: 'Tính năng Thời điểm vàng (SRS)', description: 'Cho phép sử dụng tính năng học theo thời điểm vàng', defaultLimit: 0, lockOnly: true },
]

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

  // Modal states
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [currentStep, setCurrentStep] = useState(1) // 1: Basic, 2: Features
  const [planForm, setPlanForm] = useState({
    name: '',
    price: '',
    durationDays: '',
    description: '',
    limits: []
  })

  const [showGrantModal, setShowGrantModal] = useState(false)
  const [grantForm, setGrantForm] = useState({
    email: '',
    planId: '',
    durationDays: '30',
    reason: ''
  })

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

  const handleExtendPremium = async (row) => {
    const daysText = window.prompt('Số ngày gia hạn:', '30') || '30'
    const days = Number(daysText)
    if (!Number.isFinite(days) || days <= 0) {
      setActionError('Số ngày gia hạn không hợp lệ.')
      return
    }

    const reason = window.prompt('Lý do gia hạn (bắt buộc):', '') || ''
    if (!reason.trim()) {
      setActionError('Bạn cần nhập lý do khi gia hạn Premium.')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/premium/members/${row.userId}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationDays: days, reason: reason.trim(), adminActor: getAdminActor() }),
      })

      if (!response.ok && response.status !== 204) {
        throw new Error('Cannot extend premium')
      }

      await reloadData()
      setActionError('')
    } catch {
      setActionError('Không thể gia hạn Premium cho người dùng này.')
    }
  }

  const handleManualGrant = () => {
    setGrantForm({
      email: '',
      planId: planRows.length > 0 ? planRows[0].id.toString() : '',
      durationDays: planRows.length > 0 ? planRows[0].durationDays.toString() : '30',
      reason: ''
    })
    setShowGrantModal(true)
  }

  const handleGrantFormChange = (field, value) => {
    setGrantForm(prev => {
      const next = { ...prev, [field]: value }

      // Auto-fill duration if plan changes
      if (field === 'planId') {
        const plan = planRows.find(p => p.id.toString() === value)
        if (plan) {
          next.durationDays = plan.durationDays.toString()
        }
      }

      return next
    })
  }

  const submitManualGrant = async () => {
    if (!grantForm.email.trim()) {
      setActionError('Cần nhập email người dùng để cấp Premium thủ công.')
      return
    }
    const days = Number(grantForm.durationDays)
    if (!Number.isFinite(days) || days <= 0) {
      setActionError('Số ngày cấp Premium không hợp lệ.')
      return
    }
    if (!grantForm.reason.trim()) {
      setActionError('Bạn cần nhập lý do cấp Premium thủ công.')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/premium/grant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: grantForm.email.trim(),
          planId: grantForm.planId ? Number(grantForm.planId) : null,
          durationDays: days,
          reason: grantForm.reason.trim(),
          adminActor: getAdminActor(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Cannot grant premium')
      }

      setShowGrantModal(false)
      await reloadData()
      setActionError('')
      alert('Cấp quyền Premium thành công!')
    } catch (error) {
      setActionError(error.message || 'Không thể cấp Premium thủ công.')
    }
  }

  // ============= PLAN MANAGEMENT =============
  const handleAddPlan = () => {
    setEditingPlan(null)
    setCurrentStep(1)
    setPlanForm({
      name: '',
      price: '',
      durationDays: '',
      description: '',
      limits: CONFIGURABLE_FEATURES.map(f => ({
        featureName: f.id,
        isLocked: !!f.lockOnly,
        usageLimit: f.defaultLimit
      }))
    })
    setShowPlanModal(true)
  }

  const handleEditPlan = (plan) => {
    setEditingPlan(plan)
    setCurrentStep(1)

    // Merge plan limits with CONFIGURABLE_FEATURES to ensure all are present
    const planLimitsMap = new Map((plan.limits || []).map(l => [l.featureName, l]))
    const mergedLimits = CONFIGURABLE_FEATURES.map(f => {
      const existing = planLimitsMap.get(f.id)
      return existing || {
        featureName: f.id,
        isLocked: !!f.lockOnly,
        usageLimit: f.defaultLimit
      }
    })

    setPlanForm({
      name: plan.name,
      price: plan.price.toString(),
      durationDays: plan.durationDays.toString(),
      description: plan.description || '',
      limits: mergedLimits
    })
    setShowPlanModal(true)
  }

  const handleSavePlan = async () => {
    if (!planForm.name.trim()) {
      setActionError('Tên gói là bắt buộc.')
      return
    }
    const price = Number(planForm.price)
    const days = Number(planForm.durationDays)
    if (!Number.isFinite(price) || price < 0) {
      setActionError('Giá phải lớn hơn 0.')
      return
    }
    if (!Number.isFinite(days) || days <= 0) {
      setActionError('Thời hạn phải > 0 ngày.')
      return
    }

    try {
      const method = editingPlan ? 'PUT' : 'POST'
      const url = editingPlan
        ? `${API_BASE_URL}/api/admin/premium/plans/${editingPlan.id}`
        : `${API_BASE_URL}/api/admin/premium/plans`

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: planForm.name.trim(),
          price: price,
          durationDays: days,
          description: planForm.description.trim(),
          limits: planForm.limits
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save plan')
      }

      setShowPlanModal(false)
      await reloadData()
      setActionError('')
    } catch {
      setActionError('Lưu gói Premium thất bại.')
    }
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
      value: '3',
      meta: '1 tháng, 6 tháng và 12 tháng',
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
              <button type="button" className="btn btn-outline-secondary" onClick={reloadData}>
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
              <p>Duyệt các yêu cầu từ người dùng ({requestRows.length} chờ xử lý)</p>

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
                      <div className="premium-row-actions">
                        <button className="btn btn-sm btn-success" onClick={() => handleApprove(r)} title="Duyệt">✓</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleReject(r)} title="Từ chối">✕</button>
                      </div>
                    )
                  },
                ]}
                rows={requestRows}
                emptyMessage="✨ Không có yêu cầu chờ duyệt"
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
                rows={memberRows}
                emptyMessage="✨ Không có thành viên Premium"
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

        {/* PLAN MODAL */}
        {showPlanModal && (
          <>
            <div className="modal fade show d-block" role="dialog" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {editingPlan ? '✏️ Chỉnh sửa Gói Premium' : '➕ Tạo Gói Premium Mới'}
                    </h5>
                    <button type="button" className="btn-close" onClick={() => setShowPlanModal(false)}></button>
                  </div>
                  <div className="modal-body premium-modal-body">
                    {/* Step Indicator */}
                    <div className="premium-step-indicator mb-4">
                      <div className={`step-item ${currentStep === 1 ? 'active' : 'completed'}`}>
                        <div className="step-number">1</div>
                        <div className="step-label">Thông tin cơ bản</div>
                      </div>
                      <div className="step-line"></div>
                      <div className={`step-item ${currentStep === 2 ? 'active' : ''}`}>
                        <div className="step-number">2</div>
                        <div className="step-label">Tính năng & Giới hạn</div>
                      </div>
                    </div>

                    {currentStep === 1 ? (
                      <div className="step-content-fade-in">
                        <div className="mb-3">
                          <label className="premium-form-label">Tên gói <span style={{ color: '#dc2626' }}>*</span></label>
                          <input
                            type="text"
                            className="form-control premium-input"
                            value={planForm.name}
                            onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
                            placeholder="VD: Premium 1 tháng"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="premium-form-label">Giá (VND) <span style={{ color: '#dc2626' }}>*</span></label>
                          <input
                            type="number"
                            className="form-control premium-input"
                            value={planForm.price}
                            onChange={e => setPlanForm({ ...planForm, price: e.target.value })}
                            placeholder="99000"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="premium-form-label">Kỳ hạn (ngày) <span style={{ color: '#dc2626' }}>*</span></label>
                          <input
                            type="number"
                            className="form-control premium-input"
                            value={planForm.durationDays}
                            onChange={e => setPlanForm({ ...planForm, durationDays: e.target.value })}
                            placeholder="30"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="premium-form-label">Mô tả</label>
                          <textarea
                            className="form-control premium-input"
                            rows="3"
                            value={planForm.description}
                            onChange={e => setPlanForm({ ...planForm, description: e.target.value })}
                            placeholder="Nội dung chi tiết về gói này..."
                          ></textarea>
                        </div>
                      </div>
                    ) : (
                      <div className="step-content-fade-in">
                        <p className="mb-3 text-muted small">Thiết lập quyền truy cập và hạn mức sử dụng cho gói này.</p>
                        <div className="feature-limits-list">
                          {CONFIGURABLE_FEATURES.map((feat) => {
                            const currentLimit = planForm.limits.find(l => l.featureName === feat.id) || { isLocked: false, usageLimit: 0 }
                            return (
                              <div key={feat.id} className="feature-limit-item p-3 mb-2 rounded border">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <div>
                                    <strong className="d-block">{feat.label}</strong>
                                    <small className="text-muted">{feat.description}</small>
                                  </div>
                                  <div className="form-check form-switch">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      checked={!currentLimit.isLocked}
                                      onChange={(e) => {
                                        const newLimits = planForm.limits.map(l =>
                                          l.featureName === feat.id ? { ...l, isLocked: !e.target.checked } : l
                                        )
                                        setPlanForm({ ...planForm, limits: newLimits })
                                      }}
                                    />
                                    <label className="form-check-label small">{currentLimit.isLocked ? '🔒 Khóa' : '🔓 Mở'}</label>
                                  </div>
                                </div>
                                {!currentLimit.isLocked && !feat.lockOnly && (
                                  <div className="d-flex align-items-center gap-2 mt-2">
                                    <label className="small text-nowrap">Hạn mức:</label>
                                    <div className="input-group input-group-sm" style={{ width: '180px' }}>
                                      <input
                                        type="number"
                                        className="form-control"
                                        disabled={currentLimit.usageLimit >= 999999}
                                        value={currentLimit.usageLimit >= 999999 ? '' : currentLimit.usageLimit}
                                        placeholder={currentLimit.usageLimit >= 999999 ? "∞ Vô hạn" : "0"}
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value) || 0
                                          const newLimits = planForm.limits.map(l =>
                                            l.featureName === feat.id ? { ...l, usageLimit: val } : l
                                          )
                                          setPlanForm({ ...planForm, limits: newLimits })
                                        }}
                                      />
                                      <button
                                        className={`btn ${currentLimit.usageLimit >= 999999 ? 'btn-success' : 'btn-outline-secondary'}`}
                                        type="button"
                                        title="Chuyển sang Vô hạn"
                                        onClick={() => {
                                          const isCurrentlyUnlimited = currentLimit.usageLimit >= 999999
                                          const newLimit = isCurrentlyUnlimited ? feat.defaultLimit : 999999
                                          const newLimits = planForm.limits.map(l =>
                                            l.featureName === feat.id ? { ...l, usageLimit: newLimit } : l
                                          )
                                          setPlanForm({ ...planForm, limits: newLimits })
                                        }}
                                      >
                                        {currentLimit.usageLimit >= 999999 ? '✅ Vô hạn' : '∞'}
                                      </button>
                                    </div>
                                    <span className="small text-muted">
                                      {currentLimit.usageLimit >= 999999 ? '(Không giới hạn)' : '(0 = không dùng)'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPlanModal(false)}>Hủy</button>
                    {currentStep === 1 ? (
                      <button type="button" className="btn btn-primary" onClick={() => setCurrentStep(2)}>Tiếp theo: Tính năng ➡️</button>
                    ) : (
                      <>
                        <button type="button" className="btn btn-outline-primary" onClick={() => setCurrentStep(1)}>⬅️ Quay lại</button>
                        <button type="button" className="btn btn-primary" onClick={handleSavePlan}>💾 Lưu Gói</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-backdrop fade show"></div>
          </>
        )}

        {/* GRANT PREMIUM MODAL */}
        {showGrantModal && (
          <>
            <div className="modal fade show d-block" role="dialog" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">➕ Cấp quyền Premium thủ công</h5>
                    <button type="button" className="btn-close" onClick={() => setShowGrantModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="premium-form-label">Email người dùng <span style={{ color: '#dc2626' }}>*</span></label>
                      <input
                        type="email"
                        className="form-control premium-input"
                        value={grantForm.email}
                        onChange={e => handleGrantFormChange('email', e.target.value)}
                        placeholder="VD: user@example.com"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="premium-form-label">Chọn Gói cước <span style={{ color: '#dc2626' }}>*</span></label>
                      <select
                        className="form-select premium-input"
                        value={grantForm.planId}
                        onChange={e => handleGrantFormChange('planId', e.target.value)}
                      >
                        <option value="">-- Không sử dụng gói (Chỉ gia hạn ngày) --</option>
                        {planRows.map(plan => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name} ({plan.durationDays} ngày)
                          </option>
                        ))}
                      </select>
                      <small className="text-muted">Việc chọn gói sẽ tự động điền thời hạn bên dưới.</small>
                    </div>

                    <div className="mb-3">
                      <label className="premium-form-label">Thời hạn cấp (ngày) <span style={{ color: '#dc2626' }}>*</span></label>
                      <input
                        type="number"
                        className="form-control premium-input"
                        value={grantForm.durationDays}
                        onChange={e => handleGrantFormChange('durationDays', e.target.value)}
                        placeholder="30"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="premium-form-label">Lý do cấp quyền <span style={{ color: '#dc2626' }}>*</span></label>
                      <textarea
                        className="form-control premium-input"
                        rows="3"
                        value={grantForm.reason}
                        onChange={e => handleGrantFormChange('reason', e.target.value)}
                        placeholder="VD: Tặng quà sự kiện tháng 10..."
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowGrantModal(false)}>Hủy</button>
                    <button type="button" className="btn btn-primary" onClick={submitManualGrant}>🚀 Cấp quyền</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-backdrop fade show"></div>
          </>
        )}
      </div>
    </div>
  )
}