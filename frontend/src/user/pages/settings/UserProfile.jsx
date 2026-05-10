import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, UserCircle } from 'lucide-react';
import { getUserSession, getAuthHeader } from '../../utils/authSession';
import { getDefaultAvatar } from './profileUtils';
import { ProfileInfoGrid } from './components/ProfileInfoGrid';
import './profile.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export default function UserProfile() {
  const navigate = useNavigate();
  const session = getUserSession();
  const [user, setUser] = useState(session);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const session = getUserSession();
      if (!session) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: {
            ...getAuthHeader()
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [navigate]);


  if (!user && !isLoading) {
    return (
      <div className="profile-container">
        <div className="profile-error">
          <p>Không thể tải thông tin người dùng.</p>
          <button onClick={() => navigate('/')} className="btn btn--primary">Quay lại trang chủ</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <header className="profile-header">
        <div className="profile-header__main">
          <div className="profile-avatar-wrapper">
            <img
              src={user.avatar || getDefaultAvatar(user.fullName || user.username)}
              alt={user.fullName}
              className="profile-avatar-large"
            />
          </div>
          <div className="profile-header__info">
            <h1 className="profile-name">{user.fullName || user.username}</h1>
            <p className="profile-role">
              <UserCircle size={14} style={{ marginRight: '6px' }} />
              Thành viên VocaSmart
            </p>
          </div>
        </div>
        <button 
          className="btn-settings-redirect" 
          onClick={() => navigate('/settings')}
          title="Cài đặt tài khoản"
        >
          <Settings size={20} />
          <span>Cài đặt</span>
        </button>
      </header>

      <div className="profile-body">
        <section className="profile-section">
          <div className="profile-section__header">
            <h2>Thông tin cá nhân</h2>
            <p>Thông tin cơ bản về tài khoản của bạn trên hệ thống.</p>
          </div>
          <ProfileInfoGrid user={user} />
        </section>
      </div>
    </div>
  );
}
