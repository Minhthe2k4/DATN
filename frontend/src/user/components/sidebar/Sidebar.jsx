import './sidebar.css'
import { NavLink } from 'react-router-dom'

function HomeIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M3.5 10.8L12 4l8.5 6.8v8.2a1 1 0 01-1 1h-5.3v-5.1h-4.4V20H4.5a1 1 0 01-1-1v-8.2z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
		</svg>
	)
}

function BookIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M12 6.3c-1.7-1.1-3.7-1.7-5.8-1.7A2.2 2.2 0 004 6.8V18a2 2 0 012-2c2.2 0 4.3.7 6 2 1.7-1.3 3.8-2 6-2a2 2 0 012 2V6.8a2.2 2.2 0 00-2.2-2.2c-2.1 0-4.1.6-5.8 1.7z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
		</svg>
	)
}

function VideoIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<rect x="3" y="6" width="18" height="12" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
			<path d="M10 9.5l5 2.5-5 2.5z" fill="currentColor" />
		</svg>
	)
}

function SearchDocIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M7 4h8l3 3v9a2 2 0 01-2 2h-3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
			<path d="M15 4v3h3M6.8 15.2a3.2 3.2 0 106.4 0 3.2 3.2 0 00-6.4 0zM11.1 17.6L13 19.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	)
}

function ReadingIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
		</svg>
	)
}

function GemIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M5.5 9l3-4h7l3 4-6.5 9L5.5 9z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
			<path d="M5.5 9h13M9 5l3 13M15 5l-3 13" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
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

const navItems = [
	{ key: 'home', label: 'Trang chủ', icon: HomeIcon, to: '/' },
	{ key: 'vocabulary', label: 'Học từ vựng', icon: BookIcon, to: '/vocabulary' },
	{ key: 'reading', label: 'Luyện đọc', icon: ReadingIcon, to: '/reading' },
	{ key: 'videos', label: 'Video', icon: VideoIcon, to: '/video' },
	{ key: 'dictionary', label: 'Từ điển', icon: SearchDocIcon, to: '/dictionary' },
	{ key: 'premium', label: 'Gói Premium', icon: GemIcon, to: '/subscription' },
	{ key: 'support', label: 'Hỗ trợ', icon: HelpIcon, to: '/support' },
]

export function Sidebar({ isCollapsed = false, onToggleCollapse }) {
	return (
		<aside className={`dashboard-sidebar${isCollapsed ? ' is-collapsed' : ''}`} aria-label="Thanh điều hướng chính">
			<div className="sidebar-brand">
				<button
					type="button"
					className="sidebar-brand__toggle"
					onClick={onToggleCollapse}
					aria-label={isCollapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
				>
					<span className="sidebar-brand__mark" aria-hidden="true" />
				</button>
				<div className="sidebar-brand__text">
					<span className="sidebar-brand__label">Không gian học</span>
					<strong>VocaSmart</strong>
				</div>
			</div>
			<nav className="sidebar-nav" aria-label="Điều hướng chính">
				{navItems.map((item) => {
					const Icon = item.icon

					return (
						<NavLink
							key={item.label}
							to={item.to}
							end={item.to === '/'}
							className={({ isActive }) => `sidebar-item${isActive ? ' is-active' : ''}`}
							aria-label={item.label}
						>
							<Icon />
							<span className="sidebar-item__label">{item.label}</span>
							<span className="sidebar-item__tooltip" role="presentation">{item.label}</span>
						</NavLink>
					)
				})}
			</nav>
		</aside>
	)
}
