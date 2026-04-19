import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAdminSession } from '../../utils/adminSession';
import './admin-login.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

  const extractErrorMessage = (data) => {
    if (typeof data === 'string') {
      return data.substring(0, 180);
    }
    if (data?.message) {
      return data.message.substring(0, 180);
    }
    if (data?.error) {
      return data.error.substring(0, 180);
    }
    return 'Đăng nhập không thành công. Vui lòng thử lại.';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(extractErrorMessage(data));
        setLoading(false);
        return;
      }

      // Check if user has ADMIN role
      if (data.role !== 'ADMIN') {
        setError('Chỉ quản trị viên mới có thể truy cập trang này.');
        setLoading(false);
        return;
      }

      // Save admin session
      setAdminSession(data);
      
      // Navigate to admin dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Lỗi kết nối đến máy chủ. Vui lòng thử lại.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <div className="admin-login-header">
          <h1>Quản Trị Admin</h1>
          <p>Đăng nhập để quản lý hệ thống</p>
        </div>

        {error && <div className="admin-login-error">{error}</div>}

        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="admin-login-submit"
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="admin-login-footer">
          <p>Quay lại <a href="/">trang chính</a></p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
