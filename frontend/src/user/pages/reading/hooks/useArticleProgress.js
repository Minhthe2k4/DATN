import { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthHeader } from '../../../utils/authSession';

export function useArticleProgress(articleId, article, userId) {
    const [progressPercent, setProgressPercent] = useState(0);

    // Fetch initial stats
    useEffect(() => {
        if (!userId || !articleId) return;
        
        const fetchInteractionStats = async () => {
            try {
                const res = await axios.get('/api/user/interaction/stats', {
                    params: { targetId: articleId, targetType: 'ARTICLE' },
                    headers: getAuthHeader()
                });
                // Note: isFavorite is handled elsewhere or not used, we only care about progressPercent here
                setProgressPercent(res.data.progressPercent);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            }
        };

        fetchInteractionStats();
    }, [articleId, userId]);

    // Handle updating progress
    const handleUpdateProgress = async (percent) => {
        if (!userId) return;
        try {
            await axios.post('/api/user/interaction/progress', null, {
                params: { targetId: articleId, targetType: 'ARTICLE', percent },
                headers: getAuthHeader()
            });
            setProgressPercent(percent);
        } catch (err) {
            console.error('Failed to update progress:', err);
        }
    };

    // Scroll tracking for progress
    useEffect(() => {
        const handleScroll = () => {
            if (!article || !userId) return;
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            
            // Avoid division by zero
            if (height <= 0) return;
            
            const scrolled = (winScroll / height) * 100;
            
            // Debounce or only update if significantly increased
            if (scrolled > progressPercent + 5 || scrolled >= 95) {
                handleUpdateProgress(Math.min(scrolled, 100));
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [article, userId, progressPercent, articleId]); // added articleId just in case

    return { progressPercent };
}
