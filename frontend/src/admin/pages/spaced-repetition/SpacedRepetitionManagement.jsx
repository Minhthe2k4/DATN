import { useEffect, useMemo, useState } from 'react'
import { adminSummary, resetCandidates, spacedRepetitionConfig } from '../../data/adminData'
import { AdminPageHeader, AdminSectionCard, MetricList, SimpleTable, StatGrid } from '../../components/console/AdminUi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

function buildFallbackConfig() {
  return {
    beta0: 2.5,
    beta1: 1.0,
    beta2: 0.5,
    beta3: 0.8,
    k: 10,
    maxInterval: 30,
  }
}

export function SpacedRepetitionManagement() {
  const [statsData, setStatsData] = useState({
    dailyReviews: adminSummary.dailyReviews,
    wordsInReview: adminSummary.wordsInReview,
    scheduledReviews: adminSummary.scheduledReviews,
    masteredWords: adminSummary.masteredWords,
  })
  const [configForm, setConfigForm] = useState(buildFallbackConfig())
  const [candidateRows, setCandidateRows] = useState(resetCandidates)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const metricItems = useMemo(() => [
    { key: 'beta_0', value: configForm.beta0 },
    { key: 'beta_1', value: configForm.beta1 },
    { key: 'beta_2', value: configForm.beta2 },
    { key: 'beta_3', value: configForm.beta3 },
    { key: 'K', value: configForm.k },
    { key: 'max_interval', value: configForm.maxInterval },
  ], [configForm])

  const applyFallback = () => {
    setStatsData({
      dailyReviews: adminSummary.dailyReviews,
      wordsInReview: adminSummary.wordsInReview,
      scheduledReviews: adminSummary.scheduledReviews,
      masteredWords: adminSummary.masteredWords,
    })
    setConfigForm(buildFallbackConfig())
    setCandidateRows(resetCandidates)
  }

  const reloadData = async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/spaced-repetition/overview`)
    if (!response.ok) {
      throw new Error('Cannot fetch spaced overview')
    }

    const payload = await response.json()

    const stats = payload?.stats
    setStatsData({
      dailyReviews: stats?.dailyReviews ?? 0,
      wordsInReview: stats?.wordsInReview ?? 0,
      scheduledReviews: stats?.scheduledReviews ?? 0,
      masteredWords: stats?.masteredWords ?? 0,
    })

    const config = payload?.config
    setConfigForm({
      beta0: config?.beta0 ?? 2.5,
      beta1: config?.beta1 ?? 1,
      beta2: config?.beta2 ?? 0.5,
      beta3: config?.beta3 ?? 0.8,
      k: config?.k ?? 10,
      maxInterval: config?.maxInterval ?? 30,
    })

    setCandidateRows(
      Array.isArray(payload?.resetCandidates)
        ? payload.resetCandidates.map((item) => ({
            id: item.userId,
            userId: item.userId,
            email: item.email,
            reason: item.reason,
            wordsTracked: item.wordsTracked,
          }))
        : []
    )
  }

  useEffect(() => {
    let disposed = false

    async function loadData() {
      try {
        await reloadData()
        if (!disposed) {
          setLoadError('')
        }
      } catch {
        if (!disposed) {
          applyFallback()
          setLoadError('Không thể tải dữ liệu SRS từ backend, đang hiển thị dữ liệu mẫu.')
        }
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

  const handleSaveConfig = async () => {
    try {
      setIsSaving(true)
      const response = await fetch(`${API_BASE_URL}/api/admin/spaced-repetition/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beta0: Number(configForm.beta0),
          beta1: Number(configForm.beta1),
          beta2: Number(configForm.beta2),
          beta3: Number(configForm.beta3),
          k: Number(configForm.k),
          maxInterval: Number(configForm.maxInterval),
        }),
      })

      if (!response.ok) {
        throw new Error('Cannot update config')
      }

      await reloadData()
      setActionError('')
    } catch {
      setActionError('Không thể lưu cấu hình Spaced Repetition.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetUser = async (row) => {
    const confirmed = window.confirm(`Reset dữ liệu học của ${row.email}?`)
    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/spaced-repetition/users/${row.userId}/reset`, {
        method: 'POST',
      })

      if (!response.ok && response.status !== 204) {
        throw new Error('Cannot reset user learning data')
      }

      await reloadData()
      setActionError('')
    } catch {
      setActionError('Không thể reset dữ liệu học của người dùng này.')
    }
  }

  const stats = [
    {
      label: 'Buổi xem lại mỗi ngày',
      value: statsData.dailyReviews.toLocaleString('en-US'),
      meta: 'Số phiên review đang được hệ thống tạo ra hàng ngày',
      icon: 'iconoir-refresh-double',
    },
    {
      label: 'Từ đang trong quá trình học',
      value: statsData.wordsInReview.toLocaleString('en-US'),
      meta: 'Nhóm dữ liệu chịu ảnh hưởng trực tiếp từ cấu hình SRS',
      icon: 'iconoir-book-stack',
    },
    {
      label: 'Từ được lên lịch rà soát',
      value: statsData.scheduledReviews.toLocaleString('en-US'),
      meta: 'Cần bám sát để tránh dồn lịch học',
      icon: 'iconoir-calendar',
    },
    {
      label: 'Đã nắm vững',
      value: statsData.masteredWords.toLocaleString('en-US'),
      meta: 'Chỉ số kết quả đầu ra của thuật toán lặp lại',
      icon: 'iconoir-medal-1st',
    },
  ]

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Learning Algorithm"
          title="Quản lý Spaced Repetition"
          description="Theo dõi chỉ số ôn tập và tinh chỉnh tham số SRS để giữ nhịp học ổn định cho người dùng."
          actions={
            <>
              <button type="button" className="btn btn-primary srs-btn" onClick={handleSaveConfig} disabled={isSaving}>
                {isSaving ? 'Đang lưu...' : 'Lưu cấu hình'}
              </button>
              <button
                type="button"
                className="btn btn-outline-primary srs-btn srs-btn--ghost"
                onClick={() => {
                  setIsLoading(true)
                  reloadData()
                    .then(() => setLoadError(''))
                    .catch(() => setLoadError('Không thể làm mới dữ liệu SRS.'))
                    .finally(() => setIsLoading(false))
                }}
              >
                Làm mới dữ liệu
              </button>
            </>
          }
        />

        <StatGrid items={stats} />
        {isLoading ? <div className="alert alert-info mt-3 mb-0">Đang tải dữ liệu Spaced Repetition...</div> : null}
        {loadError ? <div className="alert alert-warning mt-3 mb-0">{loadError}</div> : null}
        {actionError ? <div className="alert alert-danger mt-3 mb-0">{actionError}</div> : null}

        <div className="row g-3 mt-1">
          <div className="col-12 col-xl-5">
            <AdminSectionCard className="srs-config-card" title="Thông số mặc định" description="Bộ tham số nền tảng đang chi phối lịch nhắc ôn và khoảng cách lặp lại.">
              <div className="srs-config-grid mb-3">
                <div className="srs-config-field">
                  <label className="form-label">beta_0</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control form-control-sm"
                    value={configForm.beta0}
                    onChange={(event) => setConfigForm((prev) => ({ ...prev, beta0: event.target.value }))}
                  />
                </div>
                <div className="srs-config-field">
                  <label className="form-label">beta_1</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control form-control-sm"
                    value={configForm.beta1}
                    onChange={(event) => setConfigForm((prev) => ({ ...prev, beta1: event.target.value }))}
                  />
                </div>
                <div className="srs-config-field">
                  <label className="form-label">beta_2</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control form-control-sm"
                    value={configForm.beta2}
                    onChange={(event) => setConfigForm((prev) => ({ ...prev, beta2: event.target.value }))}
                  />
                </div>
                <div className="srs-config-field">
                  <label className="form-label">beta_3</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control form-control-sm"
                    value={configForm.beta3}
                    onChange={(event) => setConfigForm((prev) => ({ ...prev, beta3: event.target.value }))}
                  />
                </div>
                <div className="srs-config-field">
                  <label className="form-label">K</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={configForm.k}
                    onChange={(event) => setConfigForm((prev) => ({ ...prev, k: event.target.value }))}
                  />
                </div>
                <div className="srs-config-field">
                  <label className="form-label">max_interval</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={configForm.maxInterval}
                    onChange={(event) => setConfigForm((prev) => ({ ...prev, maxInterval: event.target.value }))}
                  />
                </div>
              </div>
              <div className="srs-config-summary">
                <MetricList
                  items={metricItems.map((item) => ({
                    label: item.key,
                    value: item.value,
                  }))}
                />
              </div>
            </AdminSectionCard>
          </div>
          <div className="col-12 col-xl-7">
            <AdminSectionCard title="Người dùng cần can thiệp dữ liệu" description="Nhóm tài khoản có dấu hiệu lệch dữ liệu học cần kiểm tra và reset có kiểm soát.">
              <SimpleTable
                columns={[
                  { key: 'email', label: 'Email' },
                  { key: 'reason', label: 'Lý do reset' },
                  { key: 'wordsTracked', label: 'Số từ đang theo dõi' },
                  {
                    key: 'actions',
                    label: 'Hành động',
                    render: (row) => (
                      <button type="button" className="btn btn-sm btn-soft-danger" onClick={() => handleResetUser(row)}>
                        Reset dữ liệu
                      </button>
                    ),
                  },
                ]}
                rows={candidateRows}
              />
            </AdminSectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}