import React from 'react'
import { AdminSectionCard, Badge, SimpleTable } from '../../../components/console/AdminUi'
import { Package, Search, Plus, Edit2, Trash2 } from 'lucide-react'

export function PremiumPlansTable({
  filteredPlans,
  plansQuery,
  setPlansQuery,
  handleAddPlan,
  handleEditPlan,
  handleDeletePlan
}) {
  return (
    <AdminSectionCard>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h5 style={{ margin: 0 }}>
            <span className="section-header-icon"><Package size={18} /></span> Gói Premium
          </h5>
          <p style={{ margin: 0, marginTop: '0.25rem' }}>Quản lý các gói cước ({filteredPlans.length} gói)</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <div className="position-relative">
            <Search size={14} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
            <input
              type="search"
              className="form-control form-control-sm rounded-pill bg-light border-1 ps-5 pe-3 shadow-sm"
              style={{ width: '220px', borderColor: '#cbd5e1', height: '32px', fontSize: '0.8rem' }}
              placeholder="Tìm tên gói, mô tả..."
              value={plansQuery}
              onChange={(e) => setPlansQuery(e.target.value)}
            />
          </div>
          <button
            className="btn btn-sm btn-primary rounded-pill px-3 d-flex align-items-center gap-1"
            style={{ height: '32px', fontSize: '0.8rem' }}
            onClick={handleAddPlan}
          >
            <Plus size={14} /> Thêm Gói Mới
          </button>
        </div>
      </div>
      <hr className="my-3" />
      <SimpleTable
        columns={[
          { key: 'name', label: 'Gói', render: r => <strong>{r.name}</strong> },
          { key: 'price', label: 'Giá', render: r => `${r.price.toLocaleString('vi-VN')} VND` },
          { key: 'durationDays', label: 'Kỳ hạn', render: r => `${r.durationDays} ngày` },
          { key: 'description', label: 'Mô tả', render: r => <small>{r.description || 'Chưa có mô tả'}</small> },
          {
            key: 'actions', label: '', render: p => (
              <div className="premium-row-actions">
                {p.name === 'Free' && <Badge tone="info">Mặc định</Badge>}
                <button className="btn btn-sm btn-outline-primary" onClick={() => handleEditPlan(p)} title="Chỉnh sửa">
                  <Edit2 size={14} />
                </button>
                {p.name !== 'Free' && (
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeletePlan(p)} title="Xóa">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            )
          },
        ]}
        rows={filteredPlans}
        emptyMessage="Chưa có gói Premium nào. Tạo gói mới để bắt đầu."
      />
    </AdminSectionCard>
  )
}
