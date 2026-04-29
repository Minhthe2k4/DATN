import { useState } from 'react'
import { NavLink } from 'react-router-dom'

export function AdminPageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="admin-page-header card">
      <div className="card-body">
        <div className="admin-page-header__content">
          <div>
            {eyebrow ? <div className="admin-page-header__eyebrow">{eyebrow}</div> : null}
            <h1 className="admin-page-header__title">{title}</h1>
            <p className="admin-page-header__description mb-0">{description}</p>
          </div>
          {actions ? <div className="admin-page-header__actions">{actions}</div> : null}
        </div>
      </div>
    </div>
  )
}

export function StatGrid({ items }) {
  return (
    <div className="row g-3">
      {items.map((item) => (
        <div className="col-12 col-md-6 col-xl-3" key={item.label}>
          <div className="card admin-stat-card h-100">
            <div className="card-body">
              <div className="admin-stat-card__icon">
                <i className={item.icon}></i>
              </div>
              <div className="admin-stat-card__label">{item.label}</div>
              <div className="admin-stat-card__value">{item.value}</div>
              <div className="admin-stat-card__meta">{item.meta}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function MetricList({ items }) {
  return (
    <div className="admin-metric-list">
      {items.map((item, index) => (
        <div key={item.label || index} className="admin-metric-item d-flex justify-content-between align-items-center py-2 border-bottom">
          <span className="admin-metric-label text-muted">{item.label}</span>
          <span className="admin-metric-value fw-bold">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

export function AdminSectionCard({ title, description, actions, children, className = '' }) {
  return (
    <div className={`card h-100 ${className}`.trim()}>
      <div className="card-header admin-card-header">
        <div>
          <h2 className="admin-card-title">{title}</h2>
          {description ? <p className="admin-card-description mb-0">{description}</p> : null}
        </div>
        {actions ? <div>{actions}</div> : null}
      </div>
      <div className="card-body">{children}</div>
    </div>
  )
}

export function Badge({ children, tone = 'neutral' }) {
  return <span className={`admin-badge is-${tone}`}>{children}</span>
}

export function SimpleTable({ columns, rows, emptyMessage = 'Không có dữ liệu.' }) {
  return (
    <div className="admin-table-scroll-wrapper" style={{ maxHeight: '500px', overflowY: 'auto' }}>
      <div className="table-responsive">
        <table className="table table-hover admin-table mb-0">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-4 text-muted small">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr key={row.id || rowIndex}>
                  {columns.map((col) => (
                    <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function ActionPills({ actions }) {
  if (!Array.isArray(actions) || actions.length === 0) return null
  return (
    <div className="admin-action-pills">
      {actions.map((action, index) => {
        const label = typeof action === 'object' ? (action.label || action.name || JSON.stringify(action)) : action
        const key = typeof action === 'object' ? (action.id || action.key || index) : action
        return (
          <button type="button" key={key} className="btn btn-sm btn-soft-primary admin-pill-button">
            {label}
          </button>
        )
      })}
    </div>
  )
}

export function Checklist({ items }) {
  return (
    <ul className="admin-checklist mb-0">
      {items.map((item, index) => {
        const label = typeof item === 'object' ? (item.task || item.label || JSON.stringify(item)) : item
        const key = typeof item === 'object' ? (item.id || item.task || index) : item
        return <li key={key}>{label}</li>
      })}
    </ul>
  )
}

export function FilterTabs({ items, active, onChange }) {
  return (
    <div className="admin-filter-tabs d-flex flex-nowrap" role="tablist">
      {items.map((item, index) => {
        const label = typeof item === 'object' ? (item.label || item.name || JSON.stringify(item)) : item
        const value = typeof item === 'object' ? (item.value || item.id || item.label || index) : item
        const isActive = typeof item === 'object' ? (active === value) : (active === item)
        
        return (
          <button
            type="button"
            key={value}
            className={`admin-filter-tabs__button${isActive ? ' is-active' : ''}`}
            onClick={() => onChange(typeof item === 'object' ? value : item)}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

export function QuickLinks({ links }) {
  return (
    <div className="admin-quick-links">
      {links.map((link) => (
        <NavLink key={link.to} to={link.to} className="admin-quick-links__item">
          <i className={link.icon}></i>
          <div>
            <div className="admin-quick-links__title">{link.title}</div>
            <div className="admin-quick-links__description">{link.description}</div>
          </div>
        </NavLink>
      ))}
    </div>
  )
}

export function LineTrend({ data, valueKey, label = 'Doanh thu' }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  if (!Array.isArray(data) || data.length === 0) {
    return <div className="text-muted small">Không có dữ liệu biểu đồ.</div>
  }

  const values = data.map((item) => Number(item[valueKey] ?? 0))
  const maxValue = Math.max(...values, 1)
  const width = 800
  const height = 400
  const paddingX = 40
  const paddingY = 60

  const points = data.map((item, index) => {
    const x = paddingX + (index * (width - paddingX * 2)) / Math.max(data.length - 1, 1)
    const ratio = Number(item[valueKey] ?? 0) / maxValue
    const y = height - paddingY - ratio * (height - paddingY * 2)
    return { x, y, label: item.label, value: item[valueKey], original: item.revenue }
  })

  const polyline = points.map((point) => `${point.x},${point.y}`).join(' ')

  const formatValue = (val) => {
    if (val >= 1) return val.toLocaleString('vi-VN') + 'M'
    return (val * 1000).toLocaleString('vi-VN') + 'K'
  }

  return (
    <div className="admin-line-chart-container" style={{ position: 'relative' }}>
      <div className="admin-line-chart">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="adminLineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.05)" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((r) => {
            const y = height - paddingY - r * (height - paddingY * 2)
            return (
              <line 
                key={r} 
                x1={paddingX} 
                y1={y} 
                x2={width - paddingX} 
                y2={y} 
                stroke="#e2e8f0" 
                strokeDasharray="4 4" 
              />
            )
          })}

          <path
            className="admin-line-chart__area"
            style={{ fill: 'url(#adminLineGradient)' }}
            d={`M ${points[0]?.x ?? paddingX} ${height - paddingY} L ${polyline} L ${points[points.length - 1]?.x ?? width - paddingX} ${height - paddingY} Z`}
          />
          <polyline className="admin-line-chart__line" points={polyline} style={{ stroke: '#3b82f6', strokeWidth: 4, fill: 'none' }} />
          
          {points.map((point, index) => (
            <g 
              key={`${point.label}-${index}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle 
                className={`admin-line-chart__dot ${hoveredIndex === index ? 'is-active' : ''}`} 
                cx={point.x} 
                cy={point.y} 
                r={hoveredIndex === index ? 8 : 6}
                fill={hoveredIndex === index ? '#3b82f6' : 'white'}
                stroke="#3b82f6"
                strokeWidth="2"
              />
              
              {/* Tooltip background and text if hovered */}
              {hoveredIndex === index && (
                <g>
                  <rect 
                    x={point.x - 70} 
                    y={point.y - 70} 
                    width="140" 
                    height="50" 
                    rx="8" 
                    fill="#1e293b" 
                    style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
                  />
                  <text 
                    x={point.x} 
                    y={point.y - 52} 
                    textAnchor="middle" 
                    fill="white" 
                    fontSize="16" 
                    fontWeight="800"
                  >
                    {point.label}
                  </text>
                  <text 
                    x={point.x} 
                    y={point.y - 32} 
                    textAnchor="middle" 
                    fill="#94a3b8" 
                    fontSize="15"
                    fontWeight="700"
                  >
                    {(point.original || 0).toLocaleString('vi-VN')} đ
                  </text>
                  {/* Vertical guide line */}
                  <line 
                    x1={point.x} 
                    y1={point.y} 
                    x2={point.x} 
                    y2={height - paddingY} 
                    stroke="#3b82f6" 
                    strokeWidth="1" 
                    strokeDasharray="2 2" 
                  />
                </g>
              )}
            </g>
          ))}
        </svg>
        <div
          className="admin-line-chart__axis"
          style={{ gridTemplateColumns: `repeat(${Math.max(data.length, 1)}, minmax(0, 1fr))`, marginTop: '10px' }}
        >
          {data.map((item) => (
            <span key={item.label} style={{ fontSize: '12px', color: '#64748b' }}>{item.label}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = []
  let start = Math.max(1, currentPage - 2)
  let end = Math.min(totalPages, start + 4)
  if (end - start < 4) {
    start = Math.max(1, end - 4)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return (
    <nav className="admin-pagination d-flex justify-content-center mt-3">
      <ul className="pagination pagination-sm mb-0 shadow-sm">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(currentPage - 1)}>&laquo;</button>
        </li>
        {start > 1 && (
          <>
            <li className="page-item"><button className="page-link" onClick={() => onPageChange(1)}>1</button></li>
            {start > 2 && <li className="page-item disabled"><span className="page-link">...</span></li>}
          </>
        )}
        {pages.map(p => (
          <li key={p} className={`page-item ${currentPage === p ? 'active' : ''}`}>
            <button className="page-link" onClick={() => onPageChange(p)}>{p}</button>
          </li>
        ))}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <li className="page-item disabled"><span className="page-link">...</span></li>}
            <li className="page-item"><button className="page-link" onClick={() => onPageChange(totalPages)}>{totalPages}</button></li>
          </>
        )}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(currentPage + 1)}>&raquo;</button>
        </li>
      </ul>
    </nav>
  )
}
