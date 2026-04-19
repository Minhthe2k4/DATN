import { Link, NavLink } from 'react-router-dom'
import { adminNavGroups } from '../data/adminData'

export function Slidebar({ isCollapsed = false, onToggleCollapse }) {
  return (
    <>
      <div className="startbar d-print-none">
        <div className="brand">
          <div className="admin-brand">
            <button
              type="button"
              className="admin-brand-toggle"
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
            >
              <span className="admin-brand-mark" aria-hidden="true"></span>
            </button>
            <Link to="/admin" className="admin-brand-text" aria-label="Admin home">
              <span className="admin-brand-label">VocaSmart</span>
              <strong>Admin Console</strong>
            </Link>
          </div>
        </div>

        <div className="startbar-menu">
          <div className="startbar-collapse" id="startbarCollapse" data-simplebar>
            <div className="d-flex align-items-start flex-column w-100">
              <ul className="navbar-nav mb-auto w-100">
                {adminNavGroups.map((group) => (
                  <li className="w-100" key={group.label}>
                    <div className="menu-label mt-2">
                      <span>{group.label}</span>
                    </div>
                    {group.items.map((item) => (
                      <div className="nav-item" key={item.to}>
                        <NavLink to={item.to} end={item.to === '/admin'} className="nav-link">
                          <i className={`${item.icon} menu-icon`}></i>
                          <span>{item.label}</span>
                          <span className="admin-nav-tooltip" role="presentation">{item.label}</span>
                        </NavLink>
                      </div>
                    ))}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="startbar-overlay d-print-none"></div>
    </>
  )
}