import { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthHeader } from '../../../utils/authSession';
import { normalizeArticle } from '../utils';

export function useArticleData(articleId, topicId, userId) {
    const [article, setArticle] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [savedVocab, setSavedVocab] = useState([]);

    const fetchSavedVocab = async () => {
        try {
            const res = await axios.get('/api/user/vocab-custom/list', {
                headers: getAuthHeader()
            });
            setSavedVocab(res.data || []);
        } catch (err) {
            console.error('Failed to fetch saved vocab:', err);
        }
    };

    useEffect(() => {
        let mounted = true;

        setIsLoading(true);
        setErrorMessage('');

        axios.get(`/api/article/${articleId}`)
            .then((res) => {
                if (!mounted) return;
                const data = normalizeArticle(res.data);
                if (topicId && Number(topicId) !== data.topicId) {
                    setErrorMessage('Bai viet khong thuoc chu de da chon.');
                    setArticle(null);
                    return;
                }
                setArticle(data);
                
                // Fetch vocab if user is logged in
                if (userId) {
                    fetchSavedVocab();
                }
            })
            .catch(() => {
                if (!mounted) return;
                setArticle(null);
                setErrorMessage('Khong the tai noi dung bai viet. Vui long thu lai.');
            })
            .finally(() => {
                if (mounted) setIsLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, [articleId, topicId, userId]);

    return { 
        article, 
        isLoading, 
        errorMessage, 
        savedVocab, 
        fetchSavedVocab 
    };
}
