import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearUserSession, getUserSession } from '../../utils/authSession'
import './header.css'

function BellIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3c3.314 0 6 2.686 6 6v4h2v2H4v-2h2v-4c0-3.314 2.686-6 6-6z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 19h8c0 .552-.448 1-1 1h-6c-.552 0-1-.448-1-1z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

function USFlagIcon() {
    return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
            <defs>
                <clipPath id="flag-circle-clip">
                    <circle cx="20" cy="20" r="19" />
                </clipPath>
            </defs>
            <circle cx="20" cy="20" r="19" fill="#ffffff" stroke="#d2d2d2" />
            <g clipPath="url(#flag-circle-clip)">
                <rect x="0" y="0" width="40" height="40" fill="#ffffff" />
                <rect x="0" y="0" width="40" height="3.08" fill="#b22234" />
                <rect x="0" y="6.15" width="40" height="3.08" fill="#b22234" />
                <rect x="0" y="12.3" width="40" height="3.08" fill="#b22234" />
                <rect x="0" y="18.45" width="40" height="3.08" fill="#b22234" />
                <rect x="0" y="24.6" width="40" height="3.08" fill="#b22234" />
                <rect x="0" y="30.75" width="40" height="3.08" fill="#b22234" />
                <rect x="0" y="36.9" width="40" height="3.08" fill="#b22234" />
                <rect x="0" y="0" width="18" height="15.4" fill="#3c3b6e" />
            </g>
        </svg>
    )
}

function CrownIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 18h16l-1.6-9-4.4 3-2-4-2 4-4.4-3L4 18z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
    )
}

function UserIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
            <path d="M6 19a6 6 0 0112 0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
    )
}

// function MoonIcon() {
//     return (
//         <svg viewBox="0 0 24 24" aria-hidden="true">
//             <path d="M15.5 4.5A8 8 0 1110 19.2a7 7 0 005.5-14.7z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
//         </svg>
//     )
// }

// function SunIcon() {
//     return (
//         <svg viewBox="0 0 24 24" aria-hidden="true">
//             <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
//             <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
//         </svg>
//     )
// }

const DEMO_NOTIFICATIONS = [
    { id: 1, text: 'Bạn đã hoàn thành bài "Business English" 🎉', time: '5 phút trước', read: false },
    { id: 2, text: 'Nhắc lịch: 8 từ cần ôn tập hôm nay', time: '1 giờ trước', read: false },
    { id: 3, text: 'Bài đọc mới: "AI in Modern Workplace"', time: '3 giờ trước', read: true },
    { id: 4, text: 'Streak 7 ngày liên tiếp! Tiếp tục phát huy 🔥', time: 'Hôm qua', read: true },
]

function VolumeIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M11 5L6 9H3v6h3l5 4V5z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            <path d="M15.5 9.2a4 4 0 010 5.6M18 6.8a7.2 7.2 0 010 10.4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
    )
}

function HelpIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.7" />
            <path d="M9.8 9.5a2.3 2.3 0 114 1.2c-.5.6-1.5 1-1.8 2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <circle cx="12" cy="16.3" r=".9" fill="currentColor" />
        </svg>
    )
}

function LogoutIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10 6H5v12h5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 12h8M18 8l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

export function Header({ isSoundEnabled, onToggleSound, isDarkMode, onToggleDarkMode }) {
    const navigate = useNavigate()
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
    const [isNotifOpen, setIsNotifOpen] = useState(false)
    const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS)
    const [userSession, setUserSession] = useState(() => getUserSession())
    const profileMenuRef = useRef(null)
    const notifRef = useRef(null)

    const unreadCount = notifications.filter((n) => !n.read).length

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }

    useEffect(() => {
        const syncSession = () => {
            setUserSession(getUserSession())
        }

        window.addEventListener('storage', syncSession)

        const handleClickOutside = (event) => {
            if (!profileMenuRef.current?.contains(event.target)) {
                setIsProfileMenuOpen(false)
            }
            if (!notifRef.current?.contains(event.target)) {
                setIsNotifOpen(false)
            }
        }

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsProfileMenuOpen(false)
                setIsNotifOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscape)

        return () => {
            window.removeEventListener('storage', syncSession)
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [])

    const userName = userSession?.fullName || userSession?.name || 'Người dùng'
    const userEmail = userSession?.email || '---'
    const userInitial = userName?.trim()?.charAt(0)?.toUpperCase() || 'U'

    const handleLogout = () => {
        clearUserSession()
        setUserSession(null)
        setIsProfileMenuOpen(false)
        navigate('/')
    }

    return (
        <header className="dashboard-header">
            <div className="header__left">
            </div>

            <div className="header__right">
                {/* <button
                    className="icon-btn"
                    type="button"
                    onClick={onToggleDarkMode}
                    aria-label={isDarkMode ? 'Chuyển sang nền sáng' : 'Chuyển sang nền tối'}
                    title={isDarkMode ? 'Nền sáng' : 'Nền tối'}
                >
                    <span className="header-sr-only">{isDarkMode ? 'Nền sáng' : 'Nền tối'}</span>
                    {isDarkMode ? <SunIcon /> : <MoonIcon />}
                </button> */}

                <div className="notif-menu" ref={notifRef}>
                    <button
                        className="icon-btn notif-btn"
                        type="button"
                        onClick={() => {
                            setIsNotifOpen((prev) => {
                                if (!prev) markAllRead()
                                return !prev
                            })
                        }}
                        aria-label="Thông báo"
                        aria-expanded={isNotifOpen}
                    >
                        <span className="header-sr-only">Thông báo</span>
                        <BellIcon />
                        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                    </button>

                    {isNotifOpen && (
                        <div className="notif-popover" role="menu">
                            <div className="notif-popover__header">
                                <span className="notif-popover__title">Thông báo</span>
                            </div>
                            <div className="notif-popover__list">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`notif-item${notif.read ? '' : ' notif-item--unread'}`}
                                    >
                                        <div className="notif-item__text">{notif.text}</div>
                                        <div className="notif-item__time">{notif.time}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {userSession ? (
                    <div className="profile-menu" ref={profileMenuRef}>
                        <button
                            className="avatar-btn"
                            type="button"
                            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                            aria-expanded={isProfileMenuOpen}
                        >
                            <span className="header-sr-only">Mở menu tài khoản</span>
                            <span className="avatar">{userInitial}</span>
                            <span className="avatar-status" aria-hidden="true" />
                        </button>

                        {isProfileMenuOpen ? (
                            <section className="profile-popover" role="menu" aria-label="Menu tài khoản">
                                <header className="profile-popover__header">
                                    <div className="profile-popover__avatar-wrap">
                                        <span className="avatar avatar--large">{userInitial}</span>
                                        <span className="avatar-status avatar-status--large" aria-hidden="true" />
                                    </div>
                                    <div className="profile-popover__info">
                                        <strong>{userName}</strong>
                                        <p>{userEmail}</p>
                                        <span>Học viên</span>
                                    </div>
                                </header>

                                <div className="profile-popover__group">
                                    <button type="button" className="profile-menu-item profile-menu-item--upgrade">
                                        <CrownIcon />
                                        Nâng cấp PRO
                                    </button>
                                </div>

                                <div className="profile-popover__group">
                                    {/* Link quản lý thông tin cá nhân */}
                                    <button
                                        type="button"
                                        className="profile-menu-item"
                                        onClick={() => {
                                            setIsProfileMenuOpen(false);
                                            navigate('/profile');
                                        }}
                                    >
                                        <UserIcon />
                                        Thông tin cá nhân
                                    </button>

                                    <button type="button" className="profile-menu-item profile-menu-item--switch">
                                        <span className="profile-menu-item__left">
                                            <VolumeIcon />
                                            Âm thanh giao diện
                                        </span>
                                        <span
                                            className={`dark-switch${isSoundEnabled ? ' is-on' : ''}`}
                                            onClick={(event) => {
                                                event.stopPropagation()
                                                onToggleSound()
                                            }}
                                            role="switch"
                                            aria-checked={isSoundEnabled}
                                            tabIndex={0}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter' || event.key === ' ') {
                                                    event.preventDefault()
                                                    onToggleSound()
                                                }
                                            }}
                                        >
                                            <span />
                                        </span>
                                    </button>
                                </div>

                                <div className="profile-popover__group">
                                    <button type="button" className="profile-menu-item">
                                        <HelpIcon />
                                        Trợ giúp
                                    </button>
                                    <button type="button" className="profile-menu-item" onClick={handleLogout}>
                                        <LogoutIcon />
                                        Đăng xuất
                                    </button>
                                </div>
                            </section>
                        ) : null}
                    </div>
                ) : (
                    <div className="auth-cta">
                        <Link className="auth-cta__btn auth-cta__btn--ghost" to="/login">Đăng nhập</Link>
                        <Link className="auth-cta__btn auth-cta__btn--solid" to="/register">Đăng ký</Link>
                    </div>
                )}
            </div>
        </header>
    )
}
