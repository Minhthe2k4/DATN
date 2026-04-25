import { getUserSession } from '../../utils/authSession';

function getAuthHeader() {
    const session = getUserSession();
    const token = localStorage.getItem('token') || session?.userId;
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function fetchDashboard() {
    try {
        const res = await fetch('/api/user/dashboard', {
            headers: getAuthHeader()
        });
        if (!res.ok) return {};
        return res.json();
    } catch {
        return {};
    }
}

export async function fetchSuggestedVocab() {
    try {
        const res = await fetch('/api/user/suggested-vocab', {
            headers: getAuthHeader()
        });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

export async function fetchSuggestedContent() {
    try {
        const res = await fetch('/api/user/suggested-content', {
            headers: getAuthHeader()
        });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

export async function fetchTodayVocab() {
    try {
        const res = await fetch('/api/user/today-vocab', {
            headers: getAuthHeader()
        });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

export async function fetchNewsFeed() {
    try {
        const res = await fetch('/api/user/news-feed', {
            headers: getAuthHeader()
        });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

export async function fetchActivityCalendar() {
    try {
        const res = await fetch('/api/user/learning/activity-calendar', {
            headers: getAuthHeader()
        });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}
