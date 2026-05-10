import React from 'react'
import { Camera, Loader2 } from 'lucide-react'

export function AvatarUpload({ avatar, userInitial, isUploading, onAvatarClick, fileInputRef, onFileChange }) {
	return (
		<div className="horizontal-form-group">
			<label>Ảnh đại diện</label>
			<div className="avatar-upload-wrap">
				<div className="avatar-preview" onClick={onAvatarClick} style={{ cursor: 'pointer' }}>
					{avatar ? <img src={avatar} alt="Avatar" /> : userInitial}
					{isUploading && (
						<div className="avatar-loading-overlay">
							<Loader2 className="spinner" size={24} />
						</div>
					)}
				</div>
				<div className="avatar-upload-info">
					<button className="btn-upload" onClick={onAvatarClick} disabled={isUploading}>
						{isUploading ? 'Đang tải...' : 'Tải ảnh lên'}
					</button>
					<input 
						type="file" 
						ref={fileInputRef} 
						onChange={onFileChange} 
						accept="image/*" 
						style={{ display: 'none' }} 
					/>
					<p className="upload-tip">Nhấp vào ảnh hoặc nút để thay đổi (JPG, PNG)</p>
				</div>
			</div>
		</div>
	)
}
