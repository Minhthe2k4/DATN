import './sidebar.css'
import { NavLink } from 'react-router-dom'

import { Home, BookOpen, Layout, PlayCircle, Search, Gem } from 'lucide-react'

const navItems = [
	{ key: 'home', label: 'Trang chủ', icon: Home, to: '/' },
	{ key: 'vocabulary', label: 'Học từ vựng', icon: BookOpen, to: '/vocabulary' },
	{ key: 'reading', label: 'Luyện đọc', icon: Layout, to: '/reading' },
	{ key: 'videos', label: 'Video', icon: PlayCircle, to: '/video' },
	{ key: 'dictionary', label: 'Từ điển', icon: Search, to: '/dictionary' },
	{ key: 'premium', label: 'Gói Premium', icon: Gem, to: '/subscription' },
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
