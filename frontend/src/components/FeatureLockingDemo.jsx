import { useState } from 'react'
import { usePremiumStatus, isPremiumValid } from '../../hooks/usePremiumStatus'
import { PremiumGate } from '../../components/PremiumGate'

/**
 * Example component showing how to use PremiumGate for locking features
 * This is a demo - adapt to your actual components
 */
export function FeatureLockingDemo({ userId = 1 }) {
  const premiumStatus = usePremiumStatus(userId)
  const isPremium = isPremiumValid(premiumStatus)
  const [showStats, setShowStats] = useState(false)

  if (premiumStatus.loading) {
    return <div className="alert alert-info">🔄 Đang kiểm tra tính năng Premium...</div>
  }

  const handleUpgrade = () => {
    window.location.href = '/premium-plans'
  }

  return (
    <div className="container mt-5 mb-5">
      <div className="row">
        <div className="col-12">
          <h1>🔐 Demo: Feature Locking System</h1>
          <p>Ví dụ cách sử dụng PremiumGate để khóa/mở tính năng</p>
        </div>
      </div>

      {/* Premium Status Card */}
      <div className="row g-3 mt-2">
        <div className="col-12 col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">📊 Trạng Thái Premium Của Bạn</h5>
              <div className="row">
                <div className="col-6">
                  <strong>Trạng thái:</strong>
                  <p>
                    {isPremium ? (
                      <span className="badge bg-success">✅ Premium Hoạt Động</span>
                    ) : (
                      <span className="badge bg-warning">❌ Tài Khoản Miễn Phí</span>
                    )}
                  </p>
                </div>
                <div className="col-6">
                  <strong>Hết hạn:</strong>
                  <p>
                    {isPremium && premiumStatus.premiumUntil ? (
                      new Date(premiumStatus.premiumUntil).toLocaleDateString('vi-VN')
                    ) : (
                      'Không có'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Status */}
        <div className="col-12 col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">🎯 Tính Năng Khóa/Mở</h5>
              <ul className="list-unstyled">
                <li className={isPremium ? 'text-success' : 'text-danger'}>
                  {isPremium ? '✅' : '🔒'} Advanced Analytics
                </li>
                <li className={isPremium ? 'text-success' : 'text-danger'}>
                  {isPremium ? '✅' : '🔒'} Export Reports
                </li>
                <li className={isPremium ? 'text-success' : 'text-danger'}>
                  {isPremium ? '✅' : '🔒'} Advanced Filters
                </li>
                <li className="text-success">✅ Basic Features (Luôn mở)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Free Feature - Always Available */}
      <div className="row g-3 mt-3">
        <div className="col-12 col-lg-6">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">✅ Tính Năng Miễn Phí (Luôn Sẵn)</h5>
            </div>
            <div className="card-body">
              <h6>Học Từ Vựng Cơ Bản</h6>
              <p className="text-muted">Đây là tính năng miễn phí cho tất cả người dùng</p>
              <button className="btn btn-primary">📚 Vào học từ vựng</button>
            </div>
          </div>
        </div>

        {/* Premium Feature 1 - Locked/Unlocked */}
        <div className="col-12 col-lg-6">
          <PremiumGate
            isPremium={isPremium}
            featureName="Advanced Analytics"
            showBlur={true}
            onUpgradeClick={handleUpgrade}
          >
            <div className="card h-100">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">📊 Phân Tích Nâng Cao</h5>
              </div>
              <div className="card-body">
                <p className="text-muted">
                  Xem chi tiết phân tích học tập, tiến độ theo thời gian, so sánh...
                </p>
                <button className="btn btn-primary" onClick={() => setShowStats(!showStats)}>
                  {showStats ? 'Ẩn' : 'Xem'} Biểu Đồ
                </button>
                {showStats && (
                  <div className="mt-3 p-3 bg-light border rounded">
                    <p className="text-center text-muted">📈 Biểu đồ phân tích sẽ hiển thị ở đây</p>
                  </div>
                )}
              </div>
            </div>
          </PremiumGate>
        </div>
      </div>

      {/* Premium Features Row 2 */}
      <div className="row g-3 mt-3">
        {/* Premium Feature 2 */}
        <div className="col-12 col-lg-6">
          <PremiumGate
            isPremium={isPremium}
            featureName="Xuất Báo Cáo"
            showBlur={true}
            onUpgradeClick={handleUpgrade}
          >
            <div className="card h-100">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">📥 Xuất Dữ Liệu & Báo Cáo</h5>
              </div>
              <div className="card-body">
                <p className="text-muted">
                  Xuất báo cáo học tập theo định dạng PDF, Excel, CSV...
                </p>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary" disabled={!isPremium}>
                    📄 Xuất PDF
                  </button>
                  <button className="btn btn-sm btn-outline-primary" disabled={!isPremium}>
                    📊 Xuất Excel
                  </button>
                </div>
              </div>
            </div>
          </PremiumGate>
        </div>

        {/* Premium Feature 3 */}
        <div className="col-12 col-lg-6">
          <PremiumGate
            isPremium={isPremium}
            featureName="Bộ Lọc Nâng Cao"
            showBlur={false}
            onUpgradeClick={handleUpgrade}
          >
            <div className="card h-100">
              <div className="card-header bg-warning text-white">
                <h5 className="mb-0">🔍 Bộ Lọc Nâng Cao (No Blur)</h5>
              </div>
              <div className="card-body">
                <p className="text-muted">
                  Dùng {isPremium ? 'tất cả' : 'một số giới hạn'} bộ lọc để tìm kiếm chi tiết...
                </p>
                <div className="row g-2">
                  <div className="col-12">
                    <select className="form-select form-select-sm">
                      <option>Chọn loại từ vựng</option>
                      <option>Danh từ</option>
                      <option>Động từ</option>
                      <option>Tính từ</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <select className="form-select form-select-sm">
                      <option>Chọn độ khó</option>
                      <option>Dễ</option>
                      <option>Trung bình</option>
                      <option>Khó</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <button className="btn btn-sm btn-primary w-100" disabled={!isPremium}>
                      🔎 Tìm Kiếm
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </PremiumGate>
        </div>
      </div>

      {/* Integration Info */}
      <div className="row g-3 mt-4">
        <div className="col-12">
          <div className="card border-info">
            <div className="card-header bg-info bg-opacity-10 text-info">
              <h5 className="mb-0">ℹ️ Thông Tin Tích Hợp</h5>
            </div>
            <div className="card-body small">
              <p>
                <strong>Hook:</strong> <code>usePremiumStatus(userId)</code> - Fetch premium status từ backend
              </p>
              <p>
                <strong>Component:</strong> <code>&lt;PremiumGate isPremium={'{isPremium}'} ... &gt;</code>
              </p>
              <p>
                <strong>Backend Endpoint:</strong> <code>GET /api/users/{'{userId}'}/premium-status</code>
              </p>
              <p className="mb-0">
                <strong>Features:</strong> Blur overlay, Upgrade modal, Custom handlers, Responsive
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
