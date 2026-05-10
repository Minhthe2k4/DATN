import React from 'react'
import { Edit2, Share2, Mail, Shield } from 'lucide-react'

export function ProfileSidebar({ profile, userInitial, onEditClick, isLoading }) {
	return (
		<aside className="profile-card-left">
			<div className="profile-card-cover"></div>
			<div className={`profile-avatar-wrap ${isLoading && !profile?.avatar ? 'skeleton skeleton-avatar' : ''}`}>
				{profile?.avatar ? (
					<img src={profile.avatar} alt="Avatar" className="profile-avatar-img" />
				) : (
					<span className="avatar-initial">{userInitial}</span>
				)}
			</div>
			<div className="profile-info-basic">
				<h2 className={isLoading && !profile?.fullName ? 'skeleton skeleton-text' : ''}>
					{profile?.fullName || profile?.username || 'User'}
				</h2>
				<p className={isLoading && !profile?.email ? 'skeleton skeleton-text' : ''}>
					{profile?.email || 'email@example.com'}
				</p>
			</div>

			<div className="profile-details-list">
				<div className="detail-item">
					<div className="detail-icon"><Mail size={18} /></div>
					<div className="detail-text">
						<label>Tài khoản</label>
						<span className={isLoading && !profile?.email ? 'skeleton skeleton-text' : ''}>
							{profile?.email || 'email@example.com'}
						</span>
					</div>
				</div>
				<div className="detail-item">
					<div className="detail-icon"><Shield size={18} /></div>
					<div className="detail-text">
						<label>Gói dịch vụ</label>
						<span>{profile.isPremium ? 'Tài khoản Premium' : 'Tài khoản Miễn Phí'}</span>
					</div>
				</div>
			</div>

			<div className="profile-card-actions">
				<button className="action-btn" onClick={onEditClick}>
					<Edit2 size={18} /> Cài đặt
				</button>
				<button className="action-btn">
					<Share2 size={18} /> Chia sẻ
				</button>
			</div>
		</aside>
	)
}
