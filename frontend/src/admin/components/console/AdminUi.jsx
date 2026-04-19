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
  return <span className={`admin-badge admin-badge--${tone}`}>{children}</span>
}

export function ProgressBar({ value, label }) {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="admin-progress-label">{label}</span>
        <span className="admin-progress-value">{value}%</span>
      </div>
      <div className="admin-progress-track">
        <div className="admin-progress-fill" style={{ width: `${value}%` }}></div>
      </div>
    </div>
  )
}

export function MetricList({ items }) {
  return (
    <div className="admin-metric-list">
      {items.map((item) => (
        <div className="admin-metric-list__item" key={item.label}>
          <div>
            <div className="admin-metric-list__label">{item.label}</div>
            {item.hint ? <div className="admin-metric-list__hint">{item.hint}</div> : null}
          </div>
          <div className="admin-metric-list__value">{item.value}</div>
        </div>
      ))}
    </div>
  )
}

export function BarTrend({ data, valueKey, colorClass = '' }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="text-muted small">Không có dữ liệu biểu đồ.</div>
  }

  const maxValue = Math.max(...data.map((item) => Number(item[valueKey] ?? 0)), 1)

  return (
    <div className="admin-trend-chart">
      {data.map((item) => (
        <div className="admin-trend-chart__item" key={item.label}>
          <div
            className={`admin-trend-chart__bar ${colorClass}`.trim()}
            style={{ height: `${Math.max((Number(item[valueKey] ?? 0) / maxValue) * 100, 12)}%` }}
            title={`${item.label}: ${item[valueKey]}`}
          >
            <strong className="admin-trend-chart__value">{item[valueKey]}</strong>
          </div>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

export function SimpleTable({ columns, rows, emptyMessage = 'Không có dữ liệu.' }) {
  return (
    <div className="table-responsive">
      <table className="table admin-table align-middle mb-0">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-4 text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id || row.key || JSON.stringify(row)}>
                {columns.map((column) => (
                  <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export function ActionPills({ actions }) {
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
    <div className="admin-filter-tabs" role="tablist" aria-label="Bộ lọc dữ liệu">
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

export function LineTrend({ data, valueKey }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="text-muted small">Không có dữ liệu biểu đồ.</div>
  }

  const values = data.map((item) => Number(item[valueKey] ?? 0))
  const maxValue = Math.max(...values, 1)
  const width = 640
  const height = 240
  const paddingX = 28
  const paddingY = 20

  const points = data.map((item, index) => {
    const x = paddingX + (index * (width - paddingX * 2)) / Math.max(data.length - 1, 1)
    const ratio = Number(item[valueKey] ?? 0) / maxValue
    const y = height - paddingY - ratio * (height - paddingY * 2)
    return { x, y, label: item.label, value: item[valueKey] }
  })

  const polyline = points.map((point) => `${point.x},${point.y}`).join(' ')

  return (
    <div className="admin-line-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Line chart">
        <defs>
          <linearGradient id="adminLineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(14, 116, 144, 0.35)" />
            <stop offset="100%" stopColor="rgba(14, 116, 144, 0.04)" />
          </linearGradient>
        </defs>
        <path
          className="admin-line-chart__area"
          d={`M ${points[0]?.x ?? paddingX} ${height - paddingY} L ${polyline} L ${points[points.length - 1]?.x ?? width - paddingX} ${height - paddingY} Z`}
        />
        <polyline className="admin-line-chart__line" points={polyline} />
        {points.map((point) => (
          <g key={`${point.label}-${point.x}`}>
            <circle className="admin-line-chart__dot" cx={point.x} cy={point.y} r="4.5" />
            <title>{`${point.label}: ${point.value}`}</title>
          </g>
        ))}
      </svg>
      <div
        className="admin-line-chart__axis"
        style={{ gridTemplateColumns: `repeat(${Math.max(data.length, 1)}, minmax(0, 1fr))` }}
      >
        {data.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  )
}