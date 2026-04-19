import { useState } from 'react'
import './PremiumGate.css'

export function PremiumGate({ 
  children, 
  isPremium, 
  featureName = 'Tính năng này',
  showBlur = true,
  onUpgradeClick = () => {},
}) {
  const [showModal, setShowModal] = useState(false)

  if (isPremium) {
    return children
  }

  return (
    <>
      <div className="premium-gate-wrapper">
        {showBlur && <div className="premium-gate-blur">{children}</div>}
        {!showBlur && children}
        
        <div className="premium-gate-overlay">
          <div className="premium-gate-content">
            <div className="premium-gate-icon">🔒</div>
            <h3 className="premium-gate-title">{featureName} Chỉ Cho Premium</h3>
            <p className="premium-gate-description">
              Nâng cấp tài khoản Premium để sử dụng tính năng này
            </p>
            <button 
              className="btn btn-primary premium-gate-btn"
              onClick={() => setShowModal(true)}
            >
              ✨ Nâng Cấp Premium
            </button>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showModal && (
        <>
          <div 
            className="modal fade show d-block" 
            role="dialog" 
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">✨ Nâng Cấp Premium</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="premium-benefit-list">
                    <div className="benefit-item">
                      <span className="benefit-icon">🎯</span>
                      <div>
                        <strong>Truy cập tất cả tính năng</strong>
                        <p>Mở khóa mọi công cụ và tính năng cao cấp</p>
                      </div>
                    </div>
                    <div className="benefit-item">
                      <span className="benefit-icon">📊</span>
                      <div>
                        <strong>Phân tích chi tiết</strong>
                        <p>Xem báo cáo học tập và tiến độ chi tiết</p>
                      </div>
                    </div>
                    <div className="benefit-item">
                      <span className="benefit-icon">⚡</span>
                      <div>
                        <strong>Không quảng cáo</strong>
                        <p>Trải nghiệm học tập mượt mà không gián đoạn</p>
                      </div>
                    </div>
                    <div className="benefit-item">
                      <span className="benefit-icon">🚀</span>
                      <div>
                        <strong>Ưu tiên hỗ trợ</strong>
                        <p>Nhận hỗ trợ ưu tiên từ đội ngũ chúng tôi</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary" 
                    onClick={() => setShowModal(false)}
                  >
                    Đóng
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => {
                      setShowModal(false)
                      onUpgradeClick()
                    }}
                  >
                    💳 Chọn Gói Premium
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </>
  )
}
