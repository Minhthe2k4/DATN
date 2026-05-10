import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AdminPageHeader, AdminSectionCard } from '../../components/console/AdminUi'
import { ArrowLeft, ArrowRight, Save, Loader2, Lock, CheckCircle, Unlock } from 'lucide-react'

import { 
  fetchPlanById, 
  savePremiumPlan 
} from './premiumUtils'

const CONFIGURABLE_FEATURES = [
  { id: 'SAVED_VOCABULARY', label: 'Lưu từ vựng', description: 'Giới hạn số lượng từ có thể lưu', defaultLimit: 50 },
  { id: 'DICTIONARY_LOOKUP', label: 'Tra cứu từ điển', description: 'Giới hạn lượt tra từ mỗi ngày', defaultLimit: 5 },
  { id: 'CUSTOM_VOCABULARY_SETS', label: 'Bộ từ vựng tùy chỉnh', description: 'Giới hạn số lượng bộ từ vựng cá nhân', defaultLimit: 2 },
  { id: 'MONTHLY_VOCABULARY_TESTS', label: 'Bài kiểm tra tháng', description: 'Giới hạn số lượng bài kiểm tra mỗi tháng', defaultLimit: 5 },
  { id: 'VOCABULARY_REVIEW', label: 'Ôn tập từ vựng', description: 'Quyền sử dụng tính năng ôn tập (Review)', defaultLimit: 0, lockOnly: true },
  { id: 'SRS_GOLDEN_TIME', label: 'Thời điểm vàng (SRS)', description: 'Cho phép sử dụng tính năng học theo thời điểm vàng', defaultLimit: 0, lockOnly: true },
]

export function PremiumPlanCrud() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [isLoading, setIsLoading] = useState(isEdit)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [currentStep, setCurrentStep] = useState(1)

  const [form, setForm] = useState({
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

  useEffect(() => {
    if (isEdit) {
      fetchPlanById(id)
        .then(plan => {
          const planLimitsMap = new Map((plan.limits || []).map(l => [l.featureName, l]))
          const mergedLimits = CONFIGURABLE_FEATURES.map(f => {
            const existing = planLimitsMap.get(f.id)
            return existing || {
              featureName: f.id,
              isLocked: !!f.lockOnly,
              usageLimit: f.defaultLimit
            }
          })

          setForm({
            name: plan.name,
            price: plan.price.toString(),
            durationDays: plan.durationDays.toString(),
            description: plan.description || '',
            limits: mergedLimits
          })
          setIsLoading(false)
        })
        .catch(() => {
          setError('Không thể tải thông tin gói cước.')
          setIsLoading(false)
        })
    }
  }, [id, isEdit])

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Tên gói là bắt buộc.'); return }
    const price = Number(form.price)
    const days = Number(form.durationDays)
    if (!Number.isFinite(price) || price < 0) { setError('Giá phải lớn hơn hoặc bằng 0.'); return }
    if (!Number.isFinite(days) || days <= 0) { setError('Thời hạn phải lớn hơn 0 ngày.'); return }

    setIsSaving(true)
    setError('')

    try {
      await savePremiumPlan(id, {
        name: form.name.trim(),
        price,
        durationDays: days,
        description: form.description.trim(),
        limits: form.limits
      })
      navigate('/admin/premium')
    } catch (err) {
      setError(err.message || 'Lưu gói Premium thất bại. Vui lòng thử lại.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <div className="p-4 text-center text-muted">Đang tải thông tin gói...</div>

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Premium Control"
          title={isEdit ? 'Chỉnh sửa Gói Premium' : 'Tạo Gói Premium Mới'}
          description="Thiết lập các thông số cơ bản và giới hạn tính năng cho gói cước."
          actions={
            <button className="btn btn-outline-secondary" onClick={() => navigate('/admin/premium')}>
              Quay lại
            </button>
          }
        />

        {error && <div className="alert alert-danger mb-4">{error}</div>}

        <div className="premium-step-indicator mb-4 px-3">
          <div className={`step-item ${currentStep === 1 ? 'active' : 'completed'}`} onClick={() => setCurrentStep(1)}>
            <div className="step-number">1</div>
            <div className="step-label">Thông tin cơ bản</div>
          </div>
          <div className="step-line"></div>
          <div className={`step-item ${currentStep === 2 ? 'active' : ''}`} onClick={() => setCurrentStep(2)}>
            <div className="step-number">2</div>
            <div className="step-label">Tính năng & Giới hạn</div>
          </div>
        </div>

        <AdminSectionCard>
          {currentStep === 1 ? (
            <div className="row g-4">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-bold">Tên gói <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="VD: Premium 1 tháng"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Mô tả</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Nội dung chi tiết về gói này..."
                  ></textarea>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-bold">Giá (VND) <span className="text-danger">*</span></label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    placeholder="99000"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Kỳ hạn (ngày) <span className="text-danger">*</span></label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.durationDays}
                    onChange={e => setForm({ ...form, durationDays: e.target.value })}
                    placeholder="30"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="feature-limits-grid">
              <p className="text-muted mb-4">Thiết lập quyền truy cập và hạn mức sử dụng cho gói này.</p>
              <div className="row g-3">
                {CONFIGURABLE_FEATURES.map((feat) => {
                  const currentLimit = form.limits.find(l => l.featureName === feat.id) || { isLocked: false, usageLimit: 0 }
                  return (
                    <div key={feat.id} className="col-md-6 col-xl-4">
                      <div className="feature-limit-item p-3 rounded border h-100 bg-light">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="me-2">
                            <div className="fw-bold text-dark">{feat.label}</div>
                            <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>{feat.description}</small>
                          </div>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={!currentLimit.isLocked}
                              onChange={(e) => {
                                const newLimits = form.limits.map(l =>
                                  l.featureName === feat.id ? { ...l, isLocked: !e.target.checked } : l
                                )
                                setForm({ ...form, limits: newLimits })
                              }}
                            />
                          </div>
                        </div>
                        {!currentLimit.isLocked && !feat.lockOnly && (
                          <div className="mt-2 pt-2 border-top">
                            <div className="d-flex align-items-center gap-2">
                              <label className="small text-nowrap mb-0">Hạn mức:</label>
                              <div className="input-group input-group-sm">
                                <input
                                  type="number"
                                  className="form-control"
                                  disabled={currentLimit.usageLimit >= 999999}
                                  value={currentLimit.usageLimit >= 999999 ? '' : currentLimit.usageLimit}
                                  placeholder={currentLimit.usageLimit >= 999999 ? "Vô hạn" : "0"}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0
                                    const newLimits = form.limits.map(l =>
                                      l.featureName === feat.id ? { ...l, usageLimit: val } : l
                                    )
                                    setForm({ ...form, limits: newLimits })
                                  }}
                                />
                                <button
                                  className={`btn ${currentLimit.usageLimit >= 999999 ? 'btn-success' : 'btn-outline-secondary'}`}
                                  type="button"
                                  onClick={() => {
                                    const nextVal = currentLimit.usageLimit >= 999999 ? feat.defaultLimit : 999999
                                    const newLimits = form.limits.map(l =>
                                      l.featureName === feat.id ? { ...l, usageLimit: nextVal } : l
                                    )
                                    setForm({ ...form, limits: newLimits })
                                  }}
                                >
                                  {currentLimit.usageLimit >= 999999 ? (
                                    <span className="d-flex align-items-center gap-1">
                                      <Unlock size={12} /> Vô hạn
                                    </span>
                                  ) : 'Đặt Vô hạn'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        {currentLimit.isLocked && (
                          <div className="mt-2 small text-danger fw-semibold d-flex align-items-center gap-1">
                            <Lock size={14} /> Tính năng bị khóa
                          </div>
                        )}
                        {!currentLimit.isLocked && feat.lockOnly && (
                          <div className="mt-2 small text-success fw-semibold d-flex align-items-center gap-1">
                            <CheckCircle size={14} /> Có quyền sử dụng
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mt-4 pt-3 border-top d-flex justify-content-between">
            <div>
              {currentStep === 2 && (
                <button className="btn btn-outline-primary d-flex align-items-center gap-1" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft size={16} /> Quay lại
                </button>
              )}
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary" onClick={() => navigate('/admin/premium')}>
                Hủy
              </button>
              {currentStep === 1 ? (
                <button className="btn btn-primary d-flex align-items-center gap-1" onClick={() => setCurrentStep(2)}>
                  Tiếp theo: Tính năng <ArrowRight size={16} />
                </button>
              ) : (
                <button className="btn btn-success px-4 d-flex align-items-center gap-1" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <><Loader2 className="spinner-border spinner-border-sm me-1" size={16} /> Đang lưu...</>
                  ) : (
                    <><Save size={16} /> Lưu Gói Cước</>
                  )}
                </button>
              )}
            </div>
          </div>
        </AdminSectionCard>
      </div>
    </div>
  )
}
