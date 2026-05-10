export const getDefaultAvatar = (name) => {
    const initial = name?.charAt(0)?.toUpperCase() || 'U';
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
    const color = colors[initial.charCodeAt(0) % colors.length];
    
    return `data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'>
            <rect width='100' height='100' fill='${color}' />
            <text x='50' y='65' text-anchor='middle' font-size='50' font-weight='800' fill='white' font-family='Inter, sans-serif'>${initial}</text>
        </svg>`
    )}`;
};

export const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
};
