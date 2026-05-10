import React from 'react'

export function UserAvatarCard({ user }) {
  return (
    <div className="text-center p-3">
      <img
        src={user.avatar || 'https://via.placeholder.com/200?text=No+Avatar'}
        alt={user.username}
        className="img-fluid rounded-circle border shadow-sm w-50"
        style={{ aspectRatio: '1/1', objectFit: 'cover' }}
      />
      <h5 className="mt-3 mb-0">{user.fullname || user.username}</h5>
      <p className="text-muted small">{user.email}</p>
    </div>
  )
}
