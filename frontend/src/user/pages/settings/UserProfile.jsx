import React, { useState } from 'react';

function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#2d8cf0" strokeWidth="1.7"/><path d="M5 20c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="#2d8cf0" strokeWidth="1.7"/></svg>
  );
}
function EmailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="3" stroke="#2d8cf0" strokeWidth="1.7"/><path d="M3 7l9 6 9-6" stroke="#2d8cf0" strokeWidth="1.7"/></svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6.5 3A2.5 2.5 0 004 5.5v13A2.5 2.5 0 006.5 21h11a2.5 2.5 0 002.5-2.5v-13A2.5 2.5 0 0017.5 3h-11z" stroke="#2d8cf0" strokeWidth="1.7"/><rect x="8" y="17" width="8" height="2" rx="1" fill="#2d8cf0"/></svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="3" stroke="#2d8cf0" strokeWidth="1.7"/><path d="M8 3v4M16 3v4" stroke="#2d8cf0" strokeWidth="1.7"/></svg>
  );
}
function GenderIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5" stroke="#2d8cf0" strokeWidth="1.7"/><path d="M12 7V3M12 21v-4M7 12H3M21 12h-4" stroke="#2d8cf0" strokeWidth="1.7"/></svg>
  );
}
function StatusIcon({active}) {
  return active ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#2ecc40"/><path d="M8 12.5l2.5 2.5 5-5" stroke="#fff" strokeWidth="2"/></svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#e74c3c"/><path d="M9 9l6 6M15 9l-6 6" stroke="#fff" strokeWidth="2"/></svg>
  );
}
import './profile.css';

const defaultUser = {
  username: 'nguyenvana',
  fullName: 'Nguyễn Văn A',
  email: 'user@email.com',
  phone: '0123456789',
  birthday: '2000-01-01',
  gender: 'Nam',
  avatar: '',
  role: 'user',
  isActive: true,
  createdAt: '2024-01-01',
};

export default function UserProfile() {
  const [user, setUser] = useState(defaultUser);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(user);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  // const [showPasswordModal, setShowPasswordModal] = useState(false);
  // const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  // const [passwordError, setPasswordError] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'avatar' && files[0]) {
      setForm({ ...form, avatar: files[0] });
      setAvatarPreview(URL.createObjectURL(files[0]));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    setForm(user);
    setAvatarPreview(user.avatar);
  };

  const handleCancel = () => {
    setEditMode(false);
    setForm(user);
    setAvatarPreview(user.avatar);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setUser({ ...form, avatar: avatarPreview });
    setEditMode(false);
  };

  return (
    <div className="profile-container">
      <h2>Thông tin cá nhân</h2>
      <div className="profile-avatar-section">
        <div className="avatar-outer">
          <img
            src={avatarPreview || '/public/default-avatar.png'}
            alt="Avatar"
            className="profile-avatar profile-avatar-large"
          />
        </div>
        {editMode && (
          <input type="file" name="avatar" accept="image/*" onChange={handleChange} />
        )}
      </div>
      <form className="profile-form" onSubmit={handleSave}>
        <div className="profile-row">
          <div className="profile-field">
            <label><UserIcon /> Tên đăng nhập:</label>
            <span className="profile-value">{user.username}</span>
          </div>
          <div className="profile-field">
            <label><StatusIcon active={user.isActive} /> Trạng thái:</label>
            <span className={user.isActive ? 'active profile-value' : 'inactive profile-value'}>{user.isActive ? 'Đang hoạt động' : 'Đã khóa'}</span>
          </div>
        </div>
        <div className="profile-row">
          <div className="profile-field">
            <label><UserIcon /> Họ và tên:</label>
            {editMode ? (
              <input name="fullName" value={form.fullName} onChange={handleChange} required />
            ) : (
              <span className="profile-value">{user.fullName}</span>
            )}
          </div>
          <div className="profile-field">
            <label><EmailIcon /> Email:</label>
            {editMode ? (
              <input name="email" value={form.email} onChange={handleChange} required type="email" />
            ) : (
              <span className="profile-value">{user.email}</span>
            )}
          </div>
        </div>
        <div className="profile-row">
          <div className="profile-field">
            <label><PhoneIcon /> Số điện thoại:</label>
            {editMode ? (
              <input name="phone" value={form.phone} onChange={handleChange} />
            ) : (
              <span className="profile-value">{user.phone}</span>
            )}
          </div>
          <div className="profile-field">
            <label><CalendarIcon /> Ngày sinh:</label>
            {editMode ? (
              <input name="birthday" value={form.birthday} onChange={handleChange} type="date" />
            ) : (
              <span className="profile-value">{user.birthday}</span>
            )}
          </div>
        </div>
        <div className="profile-row">
          <div className="profile-field">
            <label><GenderIcon /> Giới tính:</label>
            {editMode ? (
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            ) : (
              <span className="profile-value">{user.gender}</span>
            )}
          </div>
          {/* <div className="profile-field">
            <label>Vai trò:</label>
            <span className="profile-value">{user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</span>
          </div> */}
        </div>
        <div className="profile-row">
          <div className="profile-field">
            <label><CalendarIcon /> Ngày tạo tài khoản:</label>
            <span className="profile-value">{user.createdAt}</span>
          </div>
        </div>
        <div className="profile-actions">
          {editMode ? (
            <>
              <button type="submit" className="btn btn--primary">Lưu</button>
              <button type="button" className="btn btn--secondary" onClick={handleCancel}>Hủy</button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn--primary" onClick={handleEdit}>Chỉnh sửa</button>
              {/* <button type="button" className="btn btn--secondary" onClick={() => setShowPasswordModal(true)}>Đổi mật khẩu</button> */}
            </>
          )}
        </div>
      </form>

      {/* Modal đổi mật khẩu
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Đổi mật khẩu</h3>
            <form
              onSubmit={e => {
                e.preventDefault();
                if (passwords.newPassword !== passwords.confirmPassword) {
                  setPasswordError('Mật khẩu mới không khớp');
                  return;
                }
                // Xử lý đổi mật khẩu ở đây (gọi API)
                setPasswordError('');
                setShowPasswordModal(false);
                setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
                alert('Đổi mật khẩu thành công!');
              }}
            >
              <div className="profile-field">
                <label>Mật khẩu cũ:</label>
                <input type="password" value={passwords.oldPassword} onChange={e => setPasswords(p => ({ ...p, oldPassword: e.target.value }))} required />
              </div>
              <div className="profile-field">
                <label>Mật khẩu mới:</label>
                <input type="password" value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} required />
              </div>
              <div className="profile-field">
                <label>Nhập lại mật khẩu mới:</label>
                <input type="password" value={passwords.confirmPassword} onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} required />
              </div>
              {passwordError && <div className="error-message">{passwordError}</div>}
              <div className="profile-actions">
                <button type="submit" className="btn btn--primary">Xác nhận</button>
                <button type="button" className="btn btn--secondary" onClick={() => setShowPasswordModal(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )} */}
    </div>
  );
}
