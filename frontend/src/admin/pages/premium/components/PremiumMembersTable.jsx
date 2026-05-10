import React from 'react'
import { AdminSectionCard, Badge, SimpleTable, FilterTabs, Pagination } from '../../../components/console/AdminUi'
import { Users, Search, Calendar, X, Trash2 } from 'lucide-react'

export function PremiumMembersTable({
  membersPagination,
  memberFilter,
  setMemberFilter,
  membersQuery,
  setMembersQuery,
  selectedMembers,
  setSelectedMembers,
  handleExtendPremium,
  handleCancelPremium,
  handleBulkExtend,
  handleBulkCancel
}) {
  const toggleMemberSelection = (memberId) => {
    const newSelected = new Set(selectedMembers)
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId)
    } else {
      newSelected.add(memberId)
    }
    setSelectedMembers(newSelected)
  }

  const toggleAllMembers = () => {
    if (selectedMembers.size === membersPagination.paginatedData.length) {
      setSelectedMembers(new Set())
    } else {
      setSelectedMembers(new Set(membersPagination.paginatedData.map((m) => m.userId)))
    }
  }

  return (
    <AdminSectionCard>
      <h5>
        <span className="section-header-icon"><Users size={18} /></span>
        Thành viên Premium {selectedMembers.size > 0 && <Badge tone="info">{selectedMembers.size} chọn</Badge>}
      </h5>
      <p>Quản lý các thành viên Premium ({membersPagination.totalItems} người)</p>

      <div className="mb-3 d-flex flex-wrap gap-2 justify-content-between align-items-center">
        <div style={{ flex: '1 1 200px' }}>
          <FilterTabs
            items={[
              { label: 'Tất cả', value: 'ALL' },
              { label: 'Đang hoạt động', value: 'Đang hoạt động' },
              { label: 'Hết hạn', value: 'Hết hạn' }
            ]}
            active={memberFilter.status}
            onChange={(val) => setMemberFilter(prev => ({ ...prev, status: val }))}
          />
        </div>
        <div className="position-relative" style={{ flex: '0 1 220px' }}>
          <Search size={14} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
          <input
            type="search"
            className="form-control form-control-sm rounded-pill bg-light border-1 ps-5 pe-3 shadow-sm"
            style={{ borderColor: '#cbd5e1', height: '32px', fontSize: '0.8rem' }}
            placeholder="Tìm email, gói..."
            value={membersQuery}
            onChange={(e) => setMembersQuery(e.target.value)}
          />
        </div>
      </div>

      <hr className="my-3" />
      {selectedMembers.size > 0 && (
        <div className="alert alert-info mb-3" style={{ padding: '0.8rem' }}>
          <div className="d-flex gap-2 flex-wrap">
            <button className="btn btn-sm btn-warning d-flex align-items-center gap-1" onClick={handleBulkExtend}>
              <Calendar size={14} /> Gia hạn ({selectedMembers.size})
            </button>
            <button className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1" onClick={handleBulkCancel}>
              <X size={14} /> Hủy ({selectedMembers.size})
            </button>
            <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" onClick={() => setSelectedMembers(new Set())}>
              <Trash2 size={14} /> Bỏ chọn
            </button>
          </div>
        </div>
      )}
      <SimpleTable
        columns={[
          {
            key: 'check',
            label: <input type="checkbox" checked={selectedMembers.size > 0 && selectedMembers.size === membersPagination.paginatedData.length} onChange={toggleAllMembers} title="Chọn tất cả" />,
            render: r => <input type="checkbox" checked={selectedMembers.has(r.userId)} onChange={() => toggleMemberSelection(r.userId)} />
          },
          { key: 'email', label: 'Email', render: r => <small>{r.email}</small> },
          { key: 'plan', label: 'Gói' },
          { key: 'expiresAt', label: 'Hết hạn', render: r => <small>{r.expiresAt}</small> },
          {
            key: 'actions', label: '', render: r => (
              <div className="premium-row-actions">
                <button className="btn btn-sm btn-outline-warning" onClick={() => handleExtendPremium(r)} title="Gia hạn">
                  <Calendar size={14} />
                </button>
                {r.status === 'Đang hoạt động' && (
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancelPremium(r)} title="Hủy Premium">
                    <X size={14} />
                  </button>
                )}
              </div>
            )
          },
        ]}
        rows={membersPagination.paginatedData}
        emptyMessage="Không có thành viên Premium"
      />
      <Pagination
        currentPage={membersPagination.currentPage}
        totalPages={membersPagination.totalPages}
        onPageChange={membersPagination.handlePageChange}
      />
    </AdminSectionCard>
  )
}
