import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children, userId, isAdmin }) => {
    const [connected, setConnected] = useState(false);
    const clientRef = useRef(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
        
        const client = new Client({
            webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            console.log('Connected to WebSocket');
            setConnected(true);

            // 1. Subscribe public notifications
            client.subscribe('/topic/public', (message) => {
                const payload = JSON.parse(message.body);
                handleNewNotification(payload);
            });

            // 2. Subscribe private notifications (User-specific)
            if (userId) {
                client.subscribe(`/topic/notifications/${userId}`, (message) => {
                    const payload = JSON.parse(message.body);
                    handleNewNotification(payload);
                });
            }

            // 3. Subscribe admin notifications (Only for Admins)
            if (isAdmin) {
                client.subscribe('/topic/admin', (message) => {
                    const payload = JSON.parse(message.body);
                    handleNewNotification(payload);
                });
            }

            // 3. Subscribe leaderboard updates
            client.subscribe('/topic/leaderboard', (message) => {
                // Trigger leaderboard refresh event
                window.dispatchEvent(new CustomEvent('leaderboard-update', { detail: message.body }));
            });
        };

        client.onDisconnect = () => {
            console.log('Disconnected from WebSocket');
            setConnected(false);
        };

        client.activate();
        clientRef.current = client;

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
            }
        };
    }, [userId, isAdmin]);

    const handleNewNotification = (notification) => {
        setNotifications(prev => [notification, ...prev].slice(0, 50));
        // Show a custom event that components can listen to
        window.dispatchEvent(new CustomEvent('new-notification', { detail: notification }));
    };

    const value = {
        connected,
        notifications,
        client: clientRef.current
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};
