import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAdminSession, clearAdminSession } from '../utils/adminSession'
import avatar1 from '../assets/images/users/avatar-1.jpg'

const ADMIN_NOTIFICATIONS = [
  { id: 1, text: 'Yêu cầu hỗ trợ mới: lỗi đăng nhập Google', time: '10 phút trước', read: false },
  { id: 2, text: '3 yêu cầu Premium đang chờ duyệt', time: '30 phút trước', read: false },
  { id: 3, text: 'Người dùng mới đăng ký: an.le@example.com', time: '1 giờ trước', read: true },
  { id: 4, text: 'Nội dung bị báo cáo: VOC-1003', time: '2 giờ trước', read: true },
]

export function Header({ isDarkMode, onToggleDarkMode }) {
  const navigate = useNavigate()
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState(ADMIN_NOTIFICATIONS)
  const [adminSession, setAdminSession] = useState(null)
  const notifRef = useRef(null)

  useEffect(() => {
    const session = getAdminSession()
    setAdminSession(session)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleLogout = () => {
    clearAdminSession()
    navigate('/admin/login')
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!notifRef.current?.contains(event.target)) {
        setIsNotifOpen(false)
      }
    }
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <div className="topbar d-print-none">
      <div className="container-fluid">
        <nav className="topbar-custom d-flex justify-content-end" id="topbar-custom">
          <ul className="list-unstyled d-inline-flex align-items-center mb-0 gap-1">
            <li className="hide-phone app-search">
              <form role="search" onSubmit={(event) => event.preventDefault()}>
                <input type="search" className="form-control top-search mb-0" placeholder="Tìm người dùng, từ vựng, bài học..." />
                <button type="submit" aria-label="Search">
                  <i className="iconoir-search"></i>
                </button>
              </form>
            </li>

            {/* Dark mode toggle */}
            <li className="topbar-item">
              <button
                className="nav-link nav-icon border-0 bg-transparent admin-topbar-icon-btn"
                type="button"
                onClick={onToggleDarkMode}
                title={isDarkMode ? 'Nền sáng' : 'Nền tối'}
                aria-label={isDarkMode ? 'Chuyển sang nền sáng' : 'Chuyển sang nền tối'}
              >
                {isDarkMode ? (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                    <circle cx="12" cy="12" r="4.5" />
                    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15.5 4.5A8 8 0 1110 19.2a7 7 0 005.5-14.7z" />
                  </svg>
                )}
              </button>
            </li>

            {/* Notification bell */}
            <li className="topbar-item" ref={notifRef} style={{ position: 'relative' }}>
              <button
                className="nav-link nav-icon border-0 bg-transparent admin-topbar-icon-btn"
                type="button"
                onClick={() => {
                  setIsNotifOpen((prev) => {
                    if (!prev) markAllRead()
                    return !prev
                  })
                }}
                aria-label="Thông báo"
                aria-expanded={isNotifOpen}
                style={{ position: 'relative' }}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3c3.314 0 6 2.686 6 6v4h2v2H4v-2h2v-4c0-3.314 2.686-6 6-6z" />
                  <path d="M8 19h8c0 .552-.448 1-1 1h-6c-.552 0-1-.448-1-1z" />
                </svg>
                {unreadCount > 0 && <span className="admin-notif-badge">{unreadCount}</span>}
              </button>

              {isNotifOpen && (
                <div className="admin-notif-popover">
                  <div className="admin-notif-popover__header">
                    <span className="admin-notif-popover__title">Thông báo</span>
                  </div>
                  <div className="admin-notif-popover__list">
                    {notifications.map((notif) => (
                      <div key={notif.id} className={`admin-notif-item${notif.read ? '' : ' admin-notif-item--unread'}`}>
                        <div className="admin-notif-item__text">{notif.text}</div>
                        <div className="admin-notif-item__time">{notif.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </li>

            {/* Avatar dropdown */}
            <li className="dropdown topbar-item">
              <button className="nav-link dropdown-toggle arrow-none nav-icon border-0 bg-transparent" data-bs-toggle="dropdown" aria-expanded="false">
                <img src={avatar1} alt="Admin" className="thumb-md rounded-circle" />
              </button>
              <div className="dropdown-menu dropdown-menu-end py-1">
                <div className="px-3 py-2 border-bottom">
                  <div className="fw-semibold text-dark fs-13">{adminSession?.fullName || 'System Admin'}</div>
                  <small className="text-muted">{adminSession?.email || 'admin@dashboard.local'}</small>
                </div>
                <Link className="dropdown-item" to="/admin">Tổng quan điều hành</Link>
                <Link className="dropdown-item" to="/admin/reports">Phân tích & báo cáo</Link>
                <Link className="dropdown-item" to="/">Quay lại trang người dùng</Link>
                <div className="border-top my-1"></div>
                <button
                  className="dropdown-item text-danger"
                  onClick={handleLogout}
                  style={{ cursor: 'pointer', border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
                >
                  Đăng xuất
                </button>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}