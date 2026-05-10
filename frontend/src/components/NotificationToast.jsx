import React, { useState, useEffect } from 'react';
import { Bell, X, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import './NotificationToast.css';

const NotificationToast = () => {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const handleNewNotification = (event) => {
            const notification = event.detail;
            
            const isAdminPath = window.location.pathname.startsWith('/admin');

            // --- FILTER LOGIC ---
            // Allow general types (SUCCESS, ERROR, etc.) everywhere
            const generalTypes = ['SUCCESS', 'ERROR', 'WARNING', 'INFO', 'SYSTEM'];
            const isGeneral = generalTypes.includes(notification.type);

            if (!isGeneral) {
                // Specialized routing for support/payment
                if (isAdminPath) {
                    if (notification.type !== 'NEW_SUPPORT_TICKET' && notification.type !== 'USER_SUPPORT_REPLY') {
                        return;
                    }
                } else {
                    if (notification.type !== 'SUPPORT_REPLY' && notification.type !== 'PAYMENT_SUCCESS' && notification.type !== 'REVIEW_REMINDER') {
                        return;
                    }
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

            setTimeout(() => {
                removeToast(id);
            }, 6000);
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
                        {renderIcon(toast.type)}
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

const renderIcon = (type) => {
    switch (type) {
        case 'SUCCESS': return <CheckCircle size={20} />;
        case 'ERROR': return <AlertTriangle size={20} />;
        case 'WARNING': return <AlertTriangle size={20} />;
        case 'INFO': return <Info size={20} />;
        case 'PAYMENT_SUCCESS': return <CheckCircle size={20} />;
        case 'SUPPORT_REPLY': return <Bell size={20} />;
        case 'NEW_SUPPORT_TICKET': return <Bell size={20} />;
        default: return <Bell size={20} />;
    }
};

const getFriendlyType = (type) => {
    switch (type) {
        case 'SUCCESS': return 'Thành công';
        case 'ERROR': return 'Lỗi';
        case 'WARNING': return 'Cảnh báo';
        case 'INFO': return 'Thông tin';
        case 'SUPPORT_REPLY': return 'Phản hồi hỗ trợ';
        case 'PAYMENT_SUCCESS': return 'Thanh toán thành công';
        case 'SYSTEM': return 'Hệ thống';
        case 'NEW_SUPPORT_TICKET': return 'Yêu cầu hỗ trợ mới';
        default: return 'Thông báo';
    }
};

export default NotificationToast;
