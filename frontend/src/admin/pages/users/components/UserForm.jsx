import React from 'react'

export function UserForm({ draft, setField, handleSave }) {
  return (
    <>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold">Username <span className="text-danger">*</span></label>
          <input className="form-control" value={draft.username} onChange={e => setField('username', e.target.value)} />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold">Email <span className="text-danger">*</span></label>
          <input className="form-control" type="email" value={draft.email} onChange={e => setField('email', e.target.value)} />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold">Họ và tên</label>
          <input className="form-control" value={draft.fullName} onChange={e => setField('fullName', e.target.value)} />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold">Số điện thoại</label>
          <input className="form-control" value={draft.phoneNumber} onChange={e => setField('phoneNumber', e.target.value)} />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold text-primary">Mật khẩu mới</label>
          <input 
            className="form-control" 
            type="password" 
            placeholder="Để trống nếu không muốn đổi" 
            value={draft.password} 
            onChange={e => setField('password', e.target.value)} 
          />
          <small className="text-muted">Nhập mật khẩu mới nếu khách hàng yêu cầu đổi.</small>
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold">Vai trò</label>
          <select className="form-select" value={draft.role} onChange={e => setField('role', e.target.value)}>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="form-label fw-bold">Ảnh đại diện (Avatar URL)</label>
        <input className="form-control" value={draft.avatar} onChange={e => setField('avatar', e.target.value)} />
        {draft.avatar && (
          <div className="mt-3 text-center">
             <img 
               src={draft.avatar} 
               alt="Preview" 
               className="rounded-circle border" 
               style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
             />
          </div>
        )}
      </div>

      <div className="d-grid">
        <button className="btn btn-primary btn-lg" onClick={handleSave}>Lưu thay đổi</button>
      </div>
    </>
  )
}
