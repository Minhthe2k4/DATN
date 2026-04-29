import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminPageHeader, AdminSectionCard } from '../../components/console/AdminUi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export function PremiumGrantPage() {
  const navigate = useNavigate()
  const [planRows, setPlanRows] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    email: '',
    planId: '',
    durationDays: '30',
    reason: ''
  })

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/admin/premium/plans`)
      .then(res => res.json())
      .then(data => {
        setPlanRows(data)
        if (data.length > 0) {
          setForm(prev => ({
            ...prev,
            planId: data[0].id.toString(),
            durationDays: data[0].durationDays.toString()
          }))
        }
        setIsLoading(false)
      })
      .catch(() => {
        setError('Không thể tải danh sách gói cước.')
        setIsLoading(false)
      })
  }, [])

  const handleFieldChange = (field, value) => {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'planId') {
        const plan = planRows.find(p => p.id.toString() === value)
        if (plan) {
          next.durationDays = plan.durationDays.toString()
        }
      }
      return next
    })
  }

  const handleSubmit = async () => {
    if (!form.email.trim()) {
      setError('Email người dùng là bắt buộc.')
      return
    }
    const days = Number(form.durationDays)
    if (!Number.isFinite(days) || days <= 0) {
      setError('Số ngày cấp Premium không hợp lệ.')
      return
    }
    if (!form.reason.trim()) {
      setError('Vui lòng nhập lý do cấp quyền.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const adminActor = window.localStorage.getItem('admin_actor') || 'admin'
      const response = await fetch(`${API_BASE_URL}/api/admin/premium/grant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          planId: form.planId ? Number(form.planId) : null,
          durationDays: days,
          reason: form.reason.trim(),
          adminActor
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Cấp quyền thất bại')
      }

      alert('Cấp quyền Premium thành công!')
      navigate('/admin/premium')
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi cấp quyền Premium.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <div className="p-4 text-center text-muted">Đang tải...</div>

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Premium Control"
          title="Cấp Premium Thủ Công"
          description="Cấp quyền truy cập Premium cho người dùng mà không cần thanh toán."
          actions={
            <button className="btn btn-outline-secondary" onClick={() => navigate('/admin/premium')}>
              Quay lại
            </button>
          }
        />

        {error && <div className="alert alert-danger mb-4">{error}</div>}

        <div className="row justify-content-center">
          <div className="col-lg-8">
            <AdminSectionCard>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">Email người dùng <span className="text-danger">*</span></label>
                    <input
                      type="email"
                      className="form-control"
                      value={form.email}
                      onChange={e => handleFieldChange('email', e.target.value)}
                      placeholder="VD: user@example.com"
                    />
                    <small className="text-muted">Hệ thống sẽ kiểm tra sự tồn tại của email này.</small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">Chọn Gói cước <span className="text-danger">*</span></label>
                    <select
                      className="form-select"
                      value={form.planId}
                      onChange={e => handleFieldChange('planId', e.target.value)}
                    >
                      <option value="">-- Không sử dụng gói (Chỉ cấp ngày) --</option>
                      {planRows.map(plan => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} ({plan.durationDays} ngày)
                        </option>
                      ))}
                    </select>
                    <small className="text-muted">Chọn gói để tự động thiết lập các giới hạn tính năng.</small>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">Thời hạn cấp (ngày) <span className="text-danger">*</span></label>
                    <input
                      type="number"
                      className="form-control"
                      value={form.durationDays}
                      onChange={e => handleFieldChange('durationDays', e.target.value)}
                      placeholder="30"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">Lý do cấp quyền <span className="text-danger">*</span></label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={form.reason}
                      onChange={e => handleFieldChange('reason', e.target.value)}
                      placeholder="VD: Tặng quà sự kiện, hỗ trợ khách hàng..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-top d-flex justify-content-end gap-2">
                <button className="btn btn-outline-secondary px-4" onClick={() => navigate('/admin/premium')}>
                  Hủy bỏ
                </button>
                <button className="btn btn-primary px-4" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? '⏳ Đang xử lý...' : '🚀 Cấp quyền ngay'}
                </button>
              </div>
            </AdminSectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}
