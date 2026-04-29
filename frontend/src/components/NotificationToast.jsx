import React, { useState, useEffect } from 'react';
import { Bell, X, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import './NotificationToast.css';

const NotificationToast = () => {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const handleNewNotification = (event) => {
            const notification = event.detail;
            
            // Lấy thông tin user hiện tại từ localStorage
            const userJson = localStorage.getItem('user');
            const currentUser = userJson ? JSON.parse(userJson) : null;
            const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN';

            // --- PHÂN LUỒNG THÔNG BÁO CHẶT CHẼ ---
            
            const isAdminPath = window.location.pathname.startsWith('/admin');

            // 1. Nếu đang ở trang Admin: Chỉ hiện thông báo từ USER gửi đến
            if (isAdminPath) {
                if (notification.type !== 'NEW_SUPPORT_TICKET' && notification.type !== 'USER_SUPPORT_REPLY') {
                    return;
                }
            } 
            // 2. Nếu đang ở trang User: Chỉ hiện thông báo từ ADMIN gửi đến
            else {
                if (notification.type !== 'SUPPORT_REPLY' && notification.type !== 'PAYMENT_SUCCESS' && notification.type !== 'SYSTEM') {
                    return;
                }
            }

            const id = Date.now();
            const newToast = {
                id,
                type: notification.type,
                message: notification.message,
                data: notification.data
            };

            setToasts(prev => [...prev, newToast]);

            // Auto remove after 5 seconds
            setTimeout(() => {
                removeToast(id);
            }, 5000);
        };

        window.addEventListener('new-notification', handleNewNotification);
        return () => window.removeEventListener('new-notification', handleNewNotification);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    if (toasts.length === 0) return null;

    return (
        <div className="notification-container">
            {toasts.map(toast => (
                <div key={toast.id} className={`notification-toast ${toast.type.toLowerCase()}`}>
                    <div className="toast-icon">
                        {toast.type === 'SUPPORT_REPLY' && <Bell size={20} />}
                        {toast.type === 'PAYMENT_SUCCESS' && <CheckCircle size={20} />}
                        {toast.type === 'SYSTEM' && <Info size={20} />}
                        {!['SUPPORT_REPLY', 'PAYMENT_SUCCESS', 'SYSTEM'].includes(toast.type) && <Bell size={20} />}
                    </div>
                    <div className="toast-content">
                        <div className="toast-title">{getFriendlyType(toast.type)}</div>
                        <div className="toast-message">{toast.message}</div>
                    </div>
                    <button className="toast-close" onClick={() => removeToast(toast.id)}>
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
};

const getFriendlyType = (type) => {
    switch (type) {
        case 'SUPPORT_REPLY': return 'Phản hồi từ Admin';
        case 'PAYMENT_SUCCESS': return 'Thanh toán thành công';
        case 'LEADERBOARD_UPDATE': return 'Bảng xếp hạng';
        case 'REVIEW_REMINDER': return 'Nhắc nhở ôn tập';
        case 'NEW_SUPPORT_TICKET': return 'Yêu cầu hỗ trợ mới';
        case 'NEW_PREMIUM_REQUEST': return 'Yêu cầu Premium';
        default: return 'Thông báo';
    }
};

export default NotificationToast;
