import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { premiumMembers, premiumRequests } from '../../data/adminData'
import { AdminPageHeader } from '../../components/console/AdminUi'
import { usePagination } from '../../hooks/usePagination'
import { Plus, RefreshCcw, Loader2, AlertTriangle, XCircle } from 'lucide-react'
import './premium-management.css'

import { 
  fetchPremiumData, 
  refreshPremiumData, 
  approveRequest, 
  rejectRequest, 
  cancelPremium, 
  deletePlan, 
  bulkExtend, 
  bulkCancel,
  normalizeRequestRow,
  normalizeMemberRow,
  normalizePlanRow,
  normalizeAuditRow,
  DEFAULT_REQUEST_FILTER,
  DEFAULT_MEMBER_FILTER
} from './premiumUtils'

import { PremiumStats } from './components/PremiumStats'
import { PremiumRequestsTable } from './components/PremiumRequestsTable'
import { PremiumMembersTable } from './components/PremiumMembersTable'
import { PremiumPlansTable } from './components/PremiumPlansTable'
import { PremiumAuditLogsTable } from './components/PremiumAuditLogsTable'

// Component quản lý hệ thống Premium dành cho Admin.
// Bao gồm: Quản lý yêu cầu đăng ký, danh sách thành viên, cấu hình gói cước và nhật ký hoạt động.
export function PremiumManagement() {
  const navigate = useNavigate()
  // Danh sách các yêu cầu nâng cấp đang chờ xử lý
  const [requestRows, setRequestRows] = useState(premiumRequests)
  // Danh sách thành viên đang sở hữu Premium
  const [memberRows, setMemberRows] = useState(premiumMembers)
  // Danh sách các gói Premium có sẵn (tháng, năm, vĩnh viễn...)
  const [planRows, setPlanRows] = useState([])
  // Nhật ký kiểm soát (Audit Logs) các thao tác quản trị
  const [auditRows, setAuditRows] = useState([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')

  const [requestFilter, setRequestFilter] = useState(DEFAULT_REQUEST_FILTER)
  const [memberFilter, setMemberFilter] = useState(DEFAULT_MEMBER_FILTER)
  const [selectedMembers, setSelectedMembers] = useState(new Set())

  const [requestsQuery, setRequestsQuery] = useState('')
  const [membersQuery, setMembersQuery] = useState('')
  const [plansQuery, setPlansQuery] = useState('')
  const [auditQuery, setAuditQuery] = useState('')

  const filteredRequests = useMemo(() => {
    return requestRows.filter(r => {
      const matchesEmail = (r.email || '').toLowerCase().includes(requestsQuery.toLowerCase())
      const matchesPackage = (r.packageName || '').toLowerCase().includes(requestsQuery.toLowerCase())
      const matchesStatus = requestFilter.status === 'ALL' || r.status === (
        requestFilter.status === 'PENDING' ? 'Chờ duyệt' :
        requestFilter.status === 'APPROVED' ? 'Đã duyệt' :
        requestFilter.status === 'REJECTED' ? 'Từ chối' : requestFilter.status
      )
      return matchesEmail && matchesPackage && matchesStatus
    })
  }, [requestsQuery, requestRows, requestFilter.status])

  const filteredMembers = useMemo(() => {
    return memberRows.filter(m => {
      const matchesEmail = (m.email || '').toLowerCase().includes(membersQuery.toLowerCase())
      const matchesPlan = (m.plan || '').toLowerCase().includes(membersQuery.toLowerCase())
      const matchesStatus = memberFilter.status === 'ALL' || m.status === memberFilter.status
      return matchesEmail && matchesPlan && matchesStatus
    })
  }, [membersQuery, memberRows, memberFilter.status])

  const filteredPlans = useMemo(() => {
    return planRows.filter(p => {
      const matchesName = (p.name || '').toLowerCase().includes(plansQuery.toLowerCase())
      const matchesDesc = (p.description || '').toLowerCase().includes(plansQuery.toLowerCase())
      return matchesName || matchesDesc
    })
  }, [plansQuery, planRows])

  const filteredAudit = useMemo(() => {
    return auditRows.filter(a => {
      const matchesEmail = (a.email || '').toLowerCase().includes(auditQuery.toLowerCase())
      const matchesAction = (a.action || '').toLowerCase().includes(auditQuery.toLowerCase())
      const matchesReason = (a.reason || '').toLowerCase().includes(auditQuery.toLowerCase())
      return matchesEmail || matchesAction || matchesReason
    })
  }, [auditQuery, auditRows])

  const requestsPagination = usePagination(filteredRequests, 10)
  const membersPagination = usePagination(filteredMembers, 10)

  useEffect(() => {
    let disposed = false
    async function loadData() {
      try {
        const data = await fetchPremiumData()
        if (disposed) return
        setRequestRows(Array.isArray(data.requests) ? data.requests.map(normalizeRequestRow) : premiumRequests)
        setMemberRows(Array.isArray(data.members) ? data.members.map(normalizeMemberRow) : premiumMembers)
        setPlanRows(Array.isArray(data.plans) ? data.plans.map(normalizePlanRow) : [])
        setAuditRows(Array.isArray(data.audit) ? data.audit.map(normalizeAuditRow) : [])
        setLoadError('')
      } catch {
        if (disposed) return
        setRequestRows(premiumRequests)
        setMemberRows(premiumMembers)
        setLoadError('Không thể tải dữ liệu premium từ backend, đang hiển thị dữ liệu mẫu.')
      } finally {
        if (!disposed) setIsLoading(false)
      }
    }
    loadData()
    return () => { disposed = true }
  }, [])

  const reloadData = async () => {
    try {
      const data = await refreshPremiumData(requestFilter, memberFilter)
      setRequestRows(Array.isArray(data.requests) ? data.requests.map(normalizeRequestRow) : premiumRequests)
      setMemberRows(Array.isArray(data.members) ? data.members.map(normalizeMemberRow) : premiumMembers)
      setAuditRows(Array.isArray(data.audit) ? data.audit.map(normalizeAuditRow) : [])
    } catch {
      setActionError('Làm mới dữ liệu thất bại.')
    }
  }

  const handleApprove = async (row) => {
    const reason = window.prompt('Lý do duyệt (tuỳ chọn):', '') || ''
    try {
      await approveRequest(row.id, reason)
      await reloadData()
      setActionError('')
    } catch {
      setActionError('Duyệt yêu cầu Premium thất bại.')
    }
  }

  const handleReject = async (row) => {
    const reason = window.prompt('Nhập lý do từ chối (bắt buộc):', '') || ''
    if (!reason.trim()) { setActionError('Bạn cần nhập lý do khi từ chối.'); return }
    try {
      await rejectRequest(row.id, reason)
      await reloadData()
      setActionError('')
    } catch {
      setActionError('Từ chối yêu cầu Premium thất bại.')
    }
  }

  const handleCancelPremium = async (row) => {
    if (!window.confirm(`Hủy quyền Premium của ${row.email}?`)) return
    const reason = window.prompt('Lý do hủy Premium (bắt buộc):', '') || ''
    if (!reason.trim()) { setActionError('Bạn cần nhập lý do khi hủy.'); return }
    try {
      await cancelPremium(row.userId, reason)
      await reloadData()
      setActionError('')
    } catch {
      setActionError('Không thể hủy Premium của người dùng này.')
    }
  }

  const handleExtendPremium = (row) => navigate(`/admin/premium/members/${row.userId}/extend?email=${encodeURIComponent(row.email)}`)
  const handleManualGrant = () => navigate('/admin/premium/grant')
  const handleAddPlan = () => navigate('/admin/premium/new')
  const handleEditPlan = (plan) => navigate(`/admin/premium/${plan.id}/edit`)

  const handleDeletePlan = async (plan) => {
    if (!window.confirm(`Xóa gói "${plan.name}"?`)) return
    try {
      await deletePlan(plan.id)
      await reloadData()
      setActionError('')
    } catch {
      setActionError('Không thể xóa gói Premium này.')
    }
  }

  const handleBulkExtend = async () => {
    if (selectedMembers.size === 0) { setActionError('Vui lòng chọn ít nhất 1 thành viên.'); return }
    const daysText = window.prompt('Số ngày gia hạn:', '30') || '30'
    const days = Number(daysText)
    if (!Number.isFinite(days) || days <= 0) { setActionError('Số ngày gia hạn không hợp lệ.'); return }
    const reason = window.prompt('Lý do gia hạn (bắt buộc):', '') || ''
    if (!reason.trim()) { setActionError('Bạn cần nhập lý do gia hạn.'); return }

    try {
      await bulkExtend(Array.from(selectedMembers), days, reason)
      setSelectedMembers(new Set())
      await reloadData()
      setActionError('')
    } catch {
      setActionError('Gia hạn hàng loạt thất bại.')
    }
  }

  const handleBulkCancel = async () => {
    if (selectedMembers.size === 0) { setActionError('Vui lòng chọn ít nhất 1 thành viên.'); return }
    if (!window.confirm(`Hủy Premium của ${selectedMembers.size} thành viên?`)) return
    const reason = window.prompt('Lý do hủy (bắt buộc):', '') || ''
    if (!reason.trim()) { setActionError('Bạn cần nhập lý do hủy.'); return }

    try {
      await bulkCancel(Array.from(selectedMembers), reason)
      setSelectedMembers(new Set())
      await reloadData()
      setActionError('')
    } catch {
      setActionError('Hủy hàng loạt thất bại.')
    }
  }

  return (
    <div className="page-content premium-management-page">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Premium Control"
          title="Quản lý tài khoản Premium"
          description="Quản lý yêu cầu, thành viên Premium, gói cước và lịch sử hoạt động."
          actions={
            <div className="premium-actions">
              <button type="button" className="btn btn-primary d-flex align-items-center gap-1" onClick={handleManualGrant}>
                <Plus size={16} /> Cấp Premium
              </button>
              <button type="button" className="btn btn-outline-secondary d-flex align-items-center gap-1" onClick={reloadData}>
                <RefreshCcw size={16} /> Làm mới
              </button>
            </div>
          }
        />

        <PremiumStats requestRows={requestRows} memberRows={memberRows} planRows={planRows} />

        {isLoading && (
          <div className="alert alert-info d-flex align-items-center gap-2">
            <Loader2 className="spinner-border spinner-border-sm" size={16} />
            Đang tải dữ liệu premium...
          </div>
        )}
        {loadError && (
          <div className="alert alert-warning d-flex align-items-center gap-2">
            <AlertTriangle size={16} /> {loadError}
          </div>
        )}
        {actionError && (
          <div className="alert alert-danger d-flex align-items-center gap-2">
            <XCircle size={16} /> {actionError}
          </div>
        )}

        <div className="row g-4 mt-1">
          <div className="col-12 col-lg-6">
            <PremiumRequestsTable 
              requestsPagination={requestsPagination}
              requestFilter={requestFilter}
              setRequestFilter={setRequestFilter}
              requestsQuery={requestsQuery}
              setRequestsQuery={setRequestsQuery}
              handleApprove={handleApprove}
              handleReject={handleReject}
            />
          </div>

          <div className="col-12 col-lg-6">
            <PremiumMembersTable 
              membersPagination={membersPagination}
              memberFilter={memberFilter}
              setMemberFilter={setMemberFilter}
              membersQuery={membersQuery}
              setMembersQuery={setMembersQuery}
              selectedMembers={selectedMembers}
              setSelectedMembers={setSelectedMembers}
              handleExtendPremium={handleExtendPremium}
              handleCancelPremium={handleCancelPremium}
              handleBulkExtend={handleBulkExtend}
              handleBulkCancel={handleBulkCancel}
            />
          </div>

          <div className="col-12">
            <PremiumPlansTable 
              filteredPlans={filteredPlans}
              plansQuery={plansQuery}
              setPlansQuery={setPlansQuery}
              handleAddPlan={handleAddPlan}
              handleEditPlan={handleEditPlan}
              handleDeletePlan={handleDeletePlan}
            />
          </div>

          <div className="col-12">
            <PremiumAuditLogsTable 
              filteredAudit={filteredAudit}
              auditQuery={auditQuery}
              setAuditQuery={setAuditQuery}
            />
          </div>
        </div>
      </div>
    </div>
  )
}