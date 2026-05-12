import { useState } from 'react';
import axios from 'axios';
import { toast } from '@/utils/toastUtils';
import { modal } from '@/utils/modalUtils';
import { normalizeWordToken } from '../utils';
import { getUserSession } from '../../../utils/authSession';

export function useDictionaryLookup(articleId, premiumStatus, onVocabSaved) {
    const [lookupState, setLookupState] = useState({
        open: false,
        loading: false,
        saving: false,
        saveModalOpen: false,
        saveDraft: null,
        error: '',
        word: '',
        normalizedWord: '',
        sentence: '',
        response: null,
    });

    const openLookupModal = async (rawWord, sentence, forceRefresh = false) => {
        const normalizedWord = normalizeWordToken(rawWord);
        if (!normalizedWord) {
            return;
        }

        setLookupState({
            open: true,
            loading: true,
            saving: false,
            saveModalOpen: false,
            saveDraft: null,
            error: '',
            word: rawWord,
            normalizedWord,
            sentence,
            response: null,
        });

        try {
            const session = getUserSession();
            const response = await axios.post('/api/article/lookup-word', {
                userId: Number(session?.userId) || null,
                articleId: Number(articleId),
                word: normalizedWord,
                sentence,
                forceRefresh,
            });

            setLookupState((prev) => ({
                ...prev,
                loading: false,
                error: '',
                normalizedWord: response.data?.normalizedWord || normalizedWord,
                response: response.data,
            }));
        } catch (error) {
            console.error('Lookup error:', error);
            let errorMsg = 'Khong the tra tu luc nay. Vui long thu lai.';
            if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
                errorMsg = 'Yêu cầu tra từ bị quá hạn (Timeout). Vui lòng thử lại.';
            } else if (error?.response?.data?.message) {
                errorMsg = error.response.data.message;
            }

            const isPremiumError = error?.response?.status === 403 || 
                                 errorMsg.toLowerCase().includes('premium') || 
                                 errorMsg.toLowerCase().includes('khóa') || 
                                 errorMsg.toLowerCase().includes('gói cước');

            if (isPremiumError) {
                closeLookupModal();
                modal.premium(errorMsg);
            } else {
                toast.error(errorMsg);
            }
            setLookupState((prev) => ({
                ...prev,
                loading: false,
                response: null,
                error: errorMsg,
            }));
        }
    };

    const closeLookupModal = () => {
        setLookupState((prev) => ({
            ...prev,
            open: false,
            saveModalOpen: false,
            saveDraft: null,
            error: '',
        }));
    };

    const pickPronunciation = (label) => {
        const list = lookupState.response?.pronunciations || [];
        const upper = String(label || '').toUpperCase();
        return list.find((item) => String(item?.label || '').toUpperCase() === upper) || null;
    };

    const pickPronunciationFallback = (primaryLabel, fallbackIndex) => {
        const list = lookupState.response?.pronunciations || [];
        const direct = pickPronunciation(primaryLabel);
        if (direct) {
            return direct;
        }
        if (Number.isInteger(fallbackIndex) && list[fallbackIndex]) {
            return list[fallbackIndex];
        }
        return list.find((item) => item?.audio || item?.ipa) || null;
    };

    const pronunciationUk = pickPronunciationFallback('UK', 0);
    const pronunciationUs = pickPronunciationFallback('US', 1);

    const handleOpenSaveMeaningModal = (meaning) => {
        const defaultPhonetic = pronunciationUk?.ipa || pronunciationUs?.ipa || '';
        setLookupState((prev) => ({
            ...prev,
            open: true,
            saveModalOpen: true,
            saveDraft: {
                word: prev.response?.normalizedWord || prev.normalizedWord,
                pronunciation: defaultPhonetic,
                level: prev.response?.level || '',
                typeOfWord: meaning?.typeOfWord || '',
                definitionEng: meaning?.definitionEn || '',
                definitionVi: meaning?.definitionVi || '',
                exampleEng: meaning?.example || prev.sentence || '',
                exampleVi: prev.response?.contextTranslation || '',
            },
        }));
    };

    const handleCloseSaveMeaningModal = () => {
        setLookupState((prev) => ({
            ...prev,
            open: true,
            saveModalOpen: false,
            saveDraft: null,
        }));
    };

    const handleSaveFormChange = (field, value) => {
        setLookupState((prev) => ({
            ...prev,
            saveDraft: {
                ...(prev.saveDraft || {}),
                [field]: value,
            },
        }));
    };

    const handleSaveMeaning = async () => {
        const session = getUserSession();
        const userId = Number(session?.userId);
        if (!Number.isFinite(userId) || userId <= 0) {
            toast.error('Vui lòng đăng nhập để lưu từ vào kho từ vựng.');
            return;
        }

        // const vocabLimit = premiumStatus?.featureLimits?.SAVED_VOCABULARY; // Not used directly in fetch but might be needed later

        setLookupState((prev) => ({
            ...prev,
            saving: true,
        }));

        const firstPronunciation = (lookupState.response?.pronunciations || []).find((item) => item?.ipa || item?.audio);
        const ipa = lookupState.saveDraft?.pronunciation || firstPronunciation?.ipa || '';

        try {
            await axios.post('/api/article/save-word', {
                userId,
                articleId: Number(articleId),
                word: lookupState.saveDraft?.word || lookupState.response?.normalizedWord || lookupState.normalizedWord,
                pronunciation: ipa,
                typeOfWord: lookupState.saveDraft?.typeOfWord || '',
                meaningEn: lookupState.saveDraft?.definitionEng || '',
                meaningVi: lookupState.saveDraft?.definitionVi || '',
                example: lookupState.saveDraft?.exampleEng || '',
                exampleVi: lookupState.saveDraft?.exampleVi || '',
                addToSRS: true
            });

            setLookupState((prev) => ({
                ...prev,
                saving: false,
                saveModalOpen: false,
                saveDraft: null,
            }));
            toast.success('Đã lưu từ vựng thành công!');
            if (onVocabSaved) {
                onVocabSaved(); // Refresh highlights
            }
        } catch (error) {
            setLookupState((prev) => ({
                ...prev,
                saving: false,
            }));
            toast.error(error?.response?.data?.message || 'Không thể lưu từ lúc này.');
        }
    };

    return {
        lookupState,
        openLookupModal,
        closeLookupModal,
        handleOpenSaveMeaningModal,
        handleCloseSaveMeaningModal,
        handleSaveFormChange,
        handleSaveMeaning,
        pronunciationUk,
        pronunciationUs
    };
}
