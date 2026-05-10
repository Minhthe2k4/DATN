import React from 'react'
import { Edit3, Calendar, ShieldCheck, Mail, Phone, User, VenusAndMars } from 'lucide-react'
import { formatDate } from '../profileUtils'

export function ProfileInfoItem({ icon: Icon, label, value, subValue, active }) {
	return (
		<div className="profile-info-item">
			<div className="profile-info-item__icon">
				<Icon size={20} />
			</div>
			<div className="profile-info-item__content">
				<label>{label}</label>
				<div className="profile-info-item__value-row">
					<span className="profile-info-item__value">{value || '—'}</span>
					{active !== undefined && (
						<span className={`status-badge ${active ? 'is-active' : 'is-inactive'}`}>
							{active ? 'Đang hoạt động' : 'Đã khóa'}
						</span>
					)}
				</div>
				{subValue && <span className="profile-info-item__sub">{subValue}</span>}
			</div>
		</div>
	)
}

export function ProfileInfoGrid({ user }) {
	return (
		<div className="profile-info-grid">
			<ProfileInfoItem 
				icon={User} 
				label="Tên đăng nhập" 
				value={user.username} 
				active={user.isActive}
			/>
			<ProfileInfoItem 
				icon={Edit3} 
				label="Họ và tên" 
				value={user.fullName} 
			/>
			<ProfileInfoItem 
				icon={Mail} 
				label="Địa chỉ Email" 
				value={user.email} 
			/>
			<ProfileInfoItem 
				icon={Phone} 
				label="Số điện thoại" 
				value={user.phone || user.phoneNumber} 
			/>
			<ProfileInfoItem 
				icon={Calendar} 
				label="Ngày sinh" 
				value={user.birthday ? formatDate(user.birthday) : 'Chưa thiết lập'} 
			/>
			<ProfileInfoItem 
				icon={VenusAndMars} 
				label="Giới tính" 
				value={user.gender} 
			/>
			<ProfileInfoItem 
				icon={ShieldCheck} 
				label="Ngày tham gia" 
				value={formatDate(user.createdAt)} 
			/>
		</div>
	)
}
