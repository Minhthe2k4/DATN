import React, { useState, useEffect } from 'react';
import './modalNotification.css';

export function ModalNotification() {
    const [config, setConfig] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleModal = (e) => {
            setConfig(e.detail);
            setIsVisible(true);
        };

        window.addEventListener('app-modal-notification', handleModal);
        return () => window.removeEventListener('app-modal-notification', handleModal);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        if (config?.onClose) config.onClose();
    };

    if (!isVisible || !config) return null;

    const getIcon = () => {
        switch (config.type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'premium': return '👑';
            default: return 'ℹ️';
        }
    }

    return (
        <div className="modal-notify-overlay" onClick={handleClose}>
            <div className="modal-notify-content" onClick={e => e.stopPropagation()}>
                <div className={`modal-notify-icon is-${config.type}`}>
                    {getIcon()}
                </div>
                <h3 className="modal-notify-title">
                    {config.type === 'premium' ? 'Tính năng Premium' : config.type === 'success' ? 'Thành công' : config.type === 'error' ? 'Thất bại' : 'Thông báo'}
                </h3>
                <p className="modal-notify-message">{config.message}</p>
                <div className="modal-notify-actions">
                    {config.type === 'premium' ? (
                        <>
                            <button 
                                className="modal-notify-btn is-premium-action" 
                                onClick={() => { handleClose(); window.location.href = '/pricing'; }}
                            >
                                Nâng cấp ngay
                            </button>
                            <button className="modal-notify-btn is-ghost" onClick={handleClose}>
                                Để sau
                            </button>
                        </>
                    ) : (
                        <button className={`modal-notify-btn is-${config.type}`} onClick={handleClose}>
                            Đóng
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export const modal = {
    show: (message, type = 'info', onClose = null) => {
        const event = new CustomEvent('app-modal-notification', {
            detail: { message, type, onClose }
        });
        window.dispatchEvent(event);
    },
    success: (msg, onClose) => modal.show(msg, 'success', onClose),
    error: (msg, onClose) => modal.show(msg, 'error', onClose),
    warning: (msg, onClose) => modal.show(msg, 'warning', onClose),
    info: (msg, onClose) => modal.show(msg, 'info', onClose),
    premium: (msg, onClose) => modal.show(msg, 'premium', onClose),
};
