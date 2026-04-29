import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { AdminPageHeader, AdminSectionCard } from '../../components/console/AdminUi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export function PremiumExtendPage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const initialEmail = queryParams.get('email') || ''

  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    email: initialEmail,
    durationDays: '30',
    reason: ''
  })

  // If email is not provided via query, we might want to fetch user details by userId
  useEffect(() => {
    if (!initialEmail && userId) {
      setIsLoading(true)
      // Assuming there's an endpoint to get user by ID or we just use the ID directly in the form
      // For now, if we don't have email, we'll just show the ID or leave email empty for manual entry
      setIsLoading(false)
    }
  }, [userId, initialEmail])

  const handleSubmit = async () => {
    const days = Number(form.durationDays)
    if (!Number.isFinite(days) || days <= 0) {
      setError('Số ngày gia hạn không hợp lệ.')
      return
    }
    if (!form.reason.trim()) {
      setError('Vui lòng nhập lý do gia hạn.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const adminActor = window.localStorage.getItem('admin_actor') || 'admin'
      const response = await fetch(`${API_BASE_URL}/api/admin/premium/members/${userId}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          durationDays: days,
          reason: form.reason.trim(),
          adminActor
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Gia hạn thất bại')
      }

      alert('Gia hạn Premium thành công!')
      navigate('/admin/premium')
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi gia hạn Premium.')
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
          title="Gia hạn Premium"
          description={`Gia hạn thời gian sử dụng Premium cho người dùng ${form.email || `ID: ${userId}`}.`}
          actions={
            <button className="btn btn-outline-secondary" onClick={() => navigate('/admin/premium')}>
              Quay lại
            </button>
          }
        />

        {error && <div className="alert alert-danger mb-4">{error}</div>}

        <div className="row justify-content-center">
          <div className="col-lg-7">
            <AdminSectionCard>
              <div className="mb-4">
                <label className="form-label fw-bold text-dark">Email người dùng</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={form.email || `User ID: ${userId}`}
                  disabled
                />
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">Số ngày gia hạn <span className="text-danger">*</span></label>
                    <input
                      type="number"
                      className="form-control"
                      value={form.durationDays}
                      onChange={e => setForm({ ...form, durationDays: e.target.value })}
                      placeholder="30"
                    />
                    <small className="text-muted">Thời gian này sẽ được cộng dồn vào ngày hết hạn hiện tại.</small>
                  </div>
                </div>
                <div className="col-md-6">
                   <div className="mb-3">
                    <label className="form-label fw-bold text-dark">Lý do gia hạn <span className="text-danger">*</span></label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={form.reason}
                      onChange={e => setForm({ ...form, reason: e.target.value })}
                      placeholder="VD: Khách hàng thanh toán qua chuyển khoản, ưu đãi riêng..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-top d-flex justify-content-end gap-2">
                <button className="btn btn-outline-secondary px-4" onClick={() => navigate('/admin/premium')}>
                  Hủy bỏ
                </button>
                <button className="btn btn-warning px-4" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? '⏳ Đang xử lý...' : '⏳ Gia hạn ngay'}
                </button>
              </div>
            </AdminSectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}
