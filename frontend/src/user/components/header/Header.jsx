import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearUserSession, getUserSession } from '../../utils/authSession'
import './header.css'

import { Bell, Crown, User, Volume2, HelpCircle, LogOut, Trophy } from 'lucide-react'

export function Header({ isSoundEnabled, onToggleSound, isDarkMode, onToggleDarkMode }) {
    const navigate = useNavigate()
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
    const [isNotifOpen, setIsNotifOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
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

        const handleNewNotif = (event) => {
            const notif = event.detail;
            const newEntry = {
                id: Date.now(),
                text: notif.message,
                time: 'Vừa xong',
                read: false
            };
            setNotifications(prev => [newEntry, ...prev]);
        };

        window.addEventListener('new-notification', handleNewNotif);
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscape)

        return () => {
            window.removeEventListener('storage', syncSession)
            window.removeEventListener('new-notification', handleNewNotif)
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
                <Link
                    className="icon-btn trophy-btn"
                    to="/leaderboard"
                    aria-label="Bảng xếp hạng"
                    title="Bảng xếp hạng"
                >
                    <span className="header-sr-only">Bảng xếp hạng</span>
                    <Trophy size={20} />
                </Link>

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
                        <Bell size={20} />
                        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                    </button>

                    {isNotifOpen && (
                        <div className="notif-popover" role="menu">
                            <div className="notif-popover__header">
                                <span className="notif-popover__title">Thông báo</span>
                            </div>
                            <div className="notif-popover__list">
                                {notifications.length === 0 ? (
                                    <div className="notif-empty-state">
                                        <p>Bạn chưa có thông báo nào</p>
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={`notif-item${notif.read ? '' : ' notif-item--unread'}`}
                                        >
                                            <div className="notif-item__text">{notif.text}</div>
                                            <div className="notif-item__time">{notif.time}</div>
                                        </div>
                                    ))
                                )}
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
                                        <Crown size={18} />
                                        Nâng cấp PRO
                                    </button>
                                </div>

                                <div className="profile-popover__group">
                                    <button
                                        type="button"
                                        className="profile-menu-item"
                                        onClick={() => {
                                            setIsProfileMenuOpen(false);
                                            navigate('/profile');
                                        }}
                                    >
                                        <User size={18} />
                                        Thông tin cá nhân
                                    </button>

                                    <button type="button" className="profile-menu-item profile-menu-item--switch">
                                        <span className="profile-menu-item__left">
                                            <Volume2 size={18} />
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
                                        <HelpCircle size={18} />
                                        Trợ giúp
                                    </button>
                                    <button type="button" className="profile-menu-item" onClick={handleLogout}>
                                        <LogOut size={18} />
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
