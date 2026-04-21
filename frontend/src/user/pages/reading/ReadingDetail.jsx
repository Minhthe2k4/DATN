import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import { getUserSession } from '../../utils/authSession'
import { usePremiumStatus } from '../../../hooks/usePremiumStatus'
import './readingDetail.css'

const FALLBACK_ARTICLE_IMAGE = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80'

function normalizeArticle(row) {
    return {
        id: Number(row?.id),
        topicId: Number(row?.topicId),
        topicName: row?.topicName || 'Khong ro chu de',
        topicImage: row?.topicImage || '',
        title: row?.title || 'Bai viet chua co tieu de',
        content: row?.content || '',
        source: row?.source || 'Nguon noi bo',
        createdAt: row?.createdAt || row?.created_at || null,
        difficulty: row?.difficulty || 'Trung binh',
        wordsHighlighted: Number(row?.wordsHighlighted || row?.words_highlighted || 0),
        articleImage: row?.articleImage || row?.article_image || '',
    }
}

function formatDate(value) {
    if (!value) return 'Moi cap nhat'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Moi cap nhat'
    return date.toLocaleString('vi-VN')
}

function estimateMinutes(content) {
    if (!content) return 1
    const words = content
        .replace(/<[^>]+>/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean).length
    return Math.max(1, Math.ceil(words / 180))
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

function normalizeContentHtml(content) {
    const raw = String(content ?? '').trim()
    if (!raw) {
        return ''
    }

    const hasHtml = /<\/?[a-z][\s\S]*>/i.test(raw)
    const html = hasHtml
        ? raw
        : raw
            .split(/\n{2,}/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean)
            .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
            .join('')

    // Remove obvious dangerous tags/attributes before rendering.
    return html
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
        .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '')
        .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '')
        .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '')
        .replace(/javascript:/gi, '')
}

function normalizeWordToken(value) {
    return String(value ?? '')
        .toLowerCase()
        .replace(/^[^\p{L}]+/u, '')
        .replace(/[^\p{L}'-]+$/u, '')
        .trim()
}

function tokenizeContentHtml(html, activeWord) {
    if (!html) {
        return ''
    }

    if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
        return html
    }

    const parser = new DOMParser()
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html')
    const root = doc.body.firstElementChild
    if (!root) {
        return html
    }

    const textNodes = []
    const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    let current = walker.nextNode()
    while (current) {
        const parentTag = current.parentElement?.tagName?.toLowerCase() || ''
        if (!['script', 'style', 'code', 'pre'].includes(parentTag) && current.nodeValue?.trim()) {
            textNodes.push(current)
        }
        current = walker.nextNode()
    }

    textNodes.forEach((node) => {
        const text = node.nodeValue || ''
        const fragment = doc.createDocumentFragment()
        const parts = text.split(/(\p{L}[\p{L}'-]*)/u)

        parts.forEach((part) => {
            if (!part) {
                return
            }

            if (/^\p{L}[\p{L}'-]*$/u.test(part)) {
                const word = normalizeWordToken(part)
                if (!word) {
                    fragment.appendChild(doc.createTextNode(part))
                    return
                }

                const span = doc.createElement('span')
                span.className = word === activeWord
                    ? 'reading-inline-word is-context-word'
                    : 'reading-inline-word'
                span.setAttribute('data-word', word)
                span.textContent = part
                fragment.appendChild(span)
            } else {
                fragment.appendChild(doc.createTextNode(part))
            }
        })

        node.replaceWith(fragment)
    })

    return root.innerHTML
}

function SpeakerIcon() {
    return (
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path d="M11 5L6 9H2v6h4l5 4V5z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M15.54 8.46a5 5 0 010 7.07M18.37 5.63a9 9 0 010 12.73" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    )
}

function cleanContextSentence(value) {
    return String(value ?? '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 420)
}

export function ReadingDetail() {
    const { topicId, articleId } = useParams()
    const session = getUserSession()
    const userId = session?.userId ? Number(session.userId) : null
    const premiumStatus = usePremiumStatus(userId)

    const [article, setArticle] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')
    const [lookupState, setLookupState] = useState({
        open: false,
        loading: false,
        saving: false,
        saveModalOpen: false,
        saveDraft: null,
        saveMessage: '',
        saveError: '',
        error: '',
        word: '',
        normalizedWord: '',
        sentence: '',
        response: null,
        availableDecks: [],
    })

    useEffect(() => {
        let mounted = true

        Promise.resolve().then(() => {
            if (!mounted) return
            setIsLoading(true)
            setErrorMessage('')
        })

        axios.get(`/api/article/${articleId}`)
            .then((res) => {
                if (!mounted) return
                const data = normalizeArticle(res.data)
                if (topicId && Number(topicId) !== data.topicId) {
                    setErrorMessage('Bai viet khong thuoc chu de da chon.')
                    setArticle(null)
                    return
                }
                setArticle(data)
            })
            .catch(() => {
                if (!mounted) return
                setArticle(null)
                setErrorMessage('Khong the tai noi dung bai viet. Vui long thu lai.')
            })
            .finally(() => {
                if (mounted) setIsLoading(false)
            })

        return () => {
            mounted = false
        }
    }, [articleId, topicId])

    const contentHtml = useMemo(() => normalizeContentHtml(article?.content), [article?.content])
    const interactiveHtml = useMemo(
        () => tokenizeContentHtml(contentHtml, lookupState.normalizedWord),
        [contentHtml, lookupState.normalizedWord],
    )

    const handleSpeak = (audioUrl) => {
        if (!audioUrl) {
            return
        }
        const audio = new Audio(audioUrl)
        void audio.play().catch(() => {
            // Ignore autoplay/sound permission failures.
        })
    }

    const handleDownloadArticle = async () => {
        if (!article || !userId) return

        const downloadLimit = premiumStatus?.featureLimits?.ARTICLE_DOWNLOADS
        const canDownload = premiumStatus?.isPremium || (downloadLimit && !downloadLimit.IS_LOCKED)

        if (!canDownload) {
            alert('🔒 Tính năng tải bài báo yêu cầu gói Premium.')
            return
        }

        try {
            // 1. Call backend to verify and increment limit
            await axios.post(`/api/article/${articleId}/check-download-limit?userId=${userId}`)
            
            // 2. If backend allows (doesn't throw error), proceed with download
            const content = `${article.title}\n${'='.repeat(article.title.length)}\n\nTác giả: ${article.source}\nKhó độ: ${article.difficulty}\nThời gian đọc: ${estimateMinutes(article.content)} phút\n\n${article.content.replace(/<[^>]+>/g, '')}`
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = `${article.title.slice(0, 50).replace(/[^a-z0-9]/gi, '_')}.txt`
            link.click()
            URL.revokeObjectURL(link.href)
        } catch (error) {
            const errorMsg = error?.response?.data?.message || 'Không thể tải bài báo lúc này.'
            alert('📥 ' + errorMsg)
        }
    }

    const pickPronunciation = (label) => {
        const list = lookupState.response?.pronunciations || []
        const upper = String(label || '').toUpperCase()
        return list.find((item) => String(item?.label || '').toUpperCase() === upper) || null
    }

    const pickPronunciationFallback = (primaryLabel, fallbackIndex) => {
        const list = lookupState.response?.pronunciations || []
        const direct = pickPronunciation(primaryLabel)
        if (direct) {
            return direct
        }
        if (Number.isInteger(fallbackIndex) && list[fallbackIndex]) {
            return list[fallbackIndex]
        }
        return list.find((item) => item?.audio || item?.ipa) || null
    }

    const pronunciationUk = pickPronunciationFallback('UK', 0)
    const pronunciationUs = pickPronunciationFallback('US', 1)

    const openLookupModal = async (rawWord, sentence) => {
        const normalizedWord = normalizeWordToken(rawWord)
        if (!normalizedWord) {
            return
        }

        setLookupState({
            open: true,
            loading: true,
            saving: false,
            saveModalOpen: false,
            saveDraft: null,
            saveMessage: '',
            saveError: '',
            error: '',
            word: rawWord,
            normalizedWord,
            sentence,
            response: null,
        })

        try {
            const session = getUserSession()
            const response = await axios.post('/api/article/lookup-word', {
                userId: Number(session?.userId) || null,
                articleId: Number(articleId),
                word: normalizedWord,
                sentence,
            })

            setLookupState((prev) => ({
                ...prev,
                loading: false,
                error: '',
                normalizedWord: response.data?.normalizedWord || normalizedWord,
                response: response.data,
                contextTranslation: response.data?.contextTranslation || '',
            }))
        } catch (error) {
            const errorMsg = error?.response?.data?.message || 'Khong the tra tu luc nay. Vui long thu lai.'
            if (error?.response?.status === 403 && errorMsg.includes('Premium')) {
                alert('🔒 ' + errorMsg)
            }
            setLookupState((prev) => ({
                ...prev,
                loading: false,
                response: null,
                error: errorMsg,
            }))
        }
    }

    const handleArticleWordClick = (event) => {
        const token = event.target.closest('.reading-inline-word')
        if (!token) {
            return
        }

        const rawWord = token.textContent || ''
        const container = token.closest('p, li, blockquote, figcaption, h2, h3, h4')
        const sentence = cleanContextSentence(container?.textContent || article?.title || '')
        void openLookupModal(rawWord, sentence)
    }

    const closeLookupModal = () => {
        setLookupState((prev) => ({
            ...prev,
            open: false,
            saveModalOpen: false,
            saveDraft: null,
            error: '',
            saveMessage: '',
            saveError: '',
        }))
    }

    const handleOpenSaveMeaningModal = (meaning) => {
        const vocabLimit = premiumStatus?.featureLimits?.SAVED_VOCABULARY
        const canSave = premiumStatus?.isPremium || (vocabLimit && !vocabLimit.IS_LOCKED)

        if (!canSave) {
            alert('✨ Tính năng lưu từ vựng yêu cầu gói Premium hoặc đã bị khóa.');
            return
        }

        const defaultPhonetic = pronunciationUk?.ipa || pronunciationUs?.ipa || ''
        setLookupState((prev) => ({
            ...prev,
            saveModalOpen: true,
            saveError: '',
            saveMessage: '',
            saveDraft: {
                word: prev.response?.normalizedWord || prev.normalizedWord,
                phonetic: defaultPhonetic,
                level: prev.response?.level || '',
                partOfSpeech: meaning?.partOfSpeech || '',
                definitionEng: meaning?.definitionEn || '',
                definitionVi: meaning?.definitionVi || '',
                exampleEng: meaning?.example || prev.sentence || '',
                exampleVi: prev.response?.contextTranslation || '',
                saveType: 'SRS',
                deckId: '',
            },
        }))
        fetchDecks()
    }

    const fetchDecks = async () => {
        try {
            const authToken = localStorage.getItem('token') || session?.userId
            const response = await axios.get('/api/user/flashcards/decks', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            })
            setLookupState(prev => ({ ...prev, availableDecks: response.data }))
        } catch (err) {
            console.error('Failed to fetch decks:', err)
        }
    }

    const handleCloseSaveMeaningModal = () => {
        setLookupState((prev) => ({
            ...prev,
            saveModalOpen: false,
            saveDraft: null,
            saveError: '',
        }))
    }

    const handleSaveFormChange = (field, value) => {
        setLookupState((prev) => ({
            ...prev,
            saveDraft: {
                ...(prev.saveDraft || {}),
                [field]: value,
            },
        }))
    }

    const handleSaveMeaning = async () => {
        const session = getUserSession()
        const userId = Number(session?.userId)
        if (!Number.isFinite(userId) || userId <= 0) {
            setLookupState((prev) => ({
                ...prev,
                saveError: 'Vui long dang nhap de luu tu vao kho tu vung.',
                saveMessage: '',
            }))
            return
        }

        if (lookupState.saveDraft?.saveType === 'FLASHCARD' && !lookupState.saveDraft?.deckId) {
            setLookupState((prev) => ({
                ...prev,
                saveError: 'Vui lòng chọn bộ thẻ để lưu!',
                saveMessage: '',
            }))
            return
        }

        setLookupState((prev) => ({
            ...prev,
            saving: true,
            saveError: '',
            saveMessage: '',
        }))

        const firstPronunciation = (lookupState.response?.pronunciations || []).find((item) => item?.ipa || item?.audio)
        const ipa = lookupState.saveDraft?.phonetic || firstPronunciation?.ipa || ''

        try {
            const saveRes = await axios.post('/api/article/save-word', {
                userId,
                articleId: Number(articleId),
                word: lookupState.saveDraft?.word || lookupState.response?.normalizedWord || lookupState.normalizedWord,
                pronunciation: ipa,
                partOfSpeech: lookupState.saveDraft?.partOfSpeech || '',
                meaningEn: lookupState.saveDraft?.definitionEng || '',
                meaningVi: lookupState.saveDraft?.definitionVi || '',
                example: lookupState.saveDraft?.exampleEng || '',
                exampleVi: lookupState.saveDraft?.exampleVi || '',
                addToSRS: lookupState.saveDraft?.saveType === 'SRS'
            })

            if (lookupState.saveDraft?.saveType === 'FLASHCARD' && lookupState.saveDraft?.deckId) {
                const authToken = localStorage.getItem('token') || session?.userId
                const savedVocabId = saveRes.data?.id;
                
                await axios.post(`/api/user/flashcards/decks/${lookupState.saveDraft.deckId}/cards`, {
                    frontText: lookupState.saveDraft.word,
                    backText: lookupState.saveDraft.definitionVi,
                    customVocab: savedVocabId ? { id: savedVocabId } : null
                }, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                })
            }

            setLookupState((prev) => ({
                ...prev,
                saving: false,
                saveModalOpen: false,
                saveDraft: null,
                saveError: '',
                saveMessage: 'Đã lưu từ vựng thành công!',
            }))
            setTimeout(() => {
                setLookupState(prev => ({ ...prev, saveMessage: '' }))
            }, 3000)
        } catch (error) {
            setLookupState((prev) => ({
                ...prev,
                saving: false,
                saveMessage: '',
                saveError: error?.response?.data?.message || 'Khong the luu tu luc nay. Vui long thu lai.',
            }))
        }
    }

    if (isLoading) {
        return (
            <section className="reading-detail-page">
                <div className="reading-detail-page__container">
                    <Link to="/reading" className="reading-detail-back">? Back to Topics</Link>
                    <div className="reading-article-body">Dang tai bai viet...</div>
                </div>
            </section>
        )
    }

    if (!article || errorMessage) {
        return (
            <section className="reading-detail-page">
                <div className="reading-detail-page__container">
                    <Link to="/reading" className="reading-detail-back">Back to Reading</Link>
                    <div className="reading-article-body">Bai viet khong ton tai hoac co loi xay ra: {errorMessage || 'Unknown error'}</div>
                </div>
            </section>
        )
    }

    const minutes = estimateMinutes(article.content)

    return (
        <section className="reading-detail-page">
            <div className="reading-detail-page__container">
                <Link to="/reading" className="reading-detail-back">? Back to Topics</Link>

                <header className="reading-detail-hero">
                    <img src={article.articleImage || FALLBACK_ARTICLE_IMAGE} alt={article.title} className="reading-detail-hero__image" referrerPolicy="no-referrer" />
                    <div className="reading-detail-hero__content">
                        <p>{article.topicName}</p>
                        <h1>{article.title}</h1>
                        <div className="reading-detail-hero__meta">
                            <span>{article.source}</span>
                            <span>{minutes} min read</span>
                            <span>{article.difficulty}</span>
                            <span>{article.wordsHighlighted} tu khoa</span>
                            <span>{formatDate(article.createdAt)}</span>
                        </div>
                        <div className="reading-detail-hero__actions">
                            <button
                                type="button"
                                className="reading-download-btn"
                                onClick={handleDownloadArticle}
                                title={premiumStatus?.isPremium ? 'Tải bài viết' : 'Chỉ thành viên Premium có thể tải'}
                            >
                                {premiumStatus?.isPremium ? '📥 Tải bài viết' : '🔒 Tải (Premium)'}
                            </button>
                        </div>
                    </div>
                </header>

                <article className="reading-article-body">
                    {interactiveHtml ? (
                        <div
                            className="reading-article-body__rich"
                            dangerouslySetInnerHTML={{ __html: interactiveHtml }}
                            onClick={handleArticleWordClick}
                        />
                    ) : (
                        <p className="reading-article-body__paragraph">Bai viet nay chua co noi dung.</p>
                    )}
                </article>

                {lookupState.open ? (
                    <div className="dictionary-modal" role="dialog" aria-modal="true" aria-label="Tra tu theo ngu canh bai doc">
                        <button type="button" className="dictionary-modal__backdrop" onClick={closeLookupModal} aria-label="Dong" />
                        <div className="dictionary-modal__content" onClick={(event) => event.stopPropagation()}>
                            <button type="button" className="dictionary-close" onClick={closeLookupModal} aria-label="Dong dictionary">×</button>

                            {lookupState.loading ? (
                                <p className="reading-vocab-empty">Dang tra tu dien va doi chieu ngu canh...</p>
                            ) : null}

                            {!lookupState.loading && lookupState.error ? (
                                <div className="reading-vocab-empty reading-vocab-error-box">
                                    <span>{lookupState.error}</span>
                                    {lookupState.error.includes('Premium') && (
                                        <Link to="/subscription" className="reading-error-upgrade-link">
                                            Nâng cấp Premium ngay →
                                        </Link>
                                    )}
                                </div>
                            ) : null}

                            {!lookupState.loading && !lookupState.error && lookupState.response ? (
                                <>
                                    {/* Header: Word + Part of Speech */}
                                    <div className="dict-header-section">
                                        <div>
                                            <h2 className="dict-word-title">{lookupState.response?.word || lookupState.word}</h2>
                                            <div className="dict-header-badges">
                                                {lookupState.response?.level ? <span className="dict-pill">{lookupState.response.level}</span> : null}
                                                {lookupState.response?.meanings?.[0]?.partOfSpeech ? <span className="dict-pill">{lookupState.response.meanings[0].partOfSpeech.toUpperCase()}</span> : null}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pronunciations: UK and US */}
                                    <div className="dict-pronunciation-list">
                                        <div className="dict-pronunciation-row">
                                            <strong>UK</strong>
                                            {pronunciationUk?.audio ? (
                                                <button type="button" className="dict-speak-btn" onClick={() => handleSpeak(pronunciationUk.audio)} aria-label="Phat am UK">
                                                    <SpeakerIcon />
                                                </button>
                                            ) : null}
                                            <span>{pronunciationUk?.ipa || '-'}</span>
                                        </div>
                                        <div className="dict-pronunciation-row">
                                            <strong>US</strong>
                                            {pronunciationUs?.audio ? (
                                                <button type="button" className="dict-speak-btn" onClick={() => handleSpeak(pronunciationUs.audio)} aria-label="Phat am US">
                                                    <SpeakerIcon />
                                                </button>
                                            ) : null}
                                            <span>{pronunciationUs?.ipa || '-'}</span>
                                        </div>
                                    </div>

                                    {/* Meanings: Each as separate card */}
                                    <div className="dict-meanings-block">
                                        {(lookupState.response.meanings || []).map((meaning) => (
                                            <div
                                                key={meaning.index}
                                                className={`dict-meaning-card${meaning.contextMatch ? ' dict-meaning-card--context-match' : ''}`}
                                            >
                                                <div className="dict-meaning-card__header">
                                                    <div className="dict-meaning-card__left">
                                                        {meaning.partOfSpeech ? <span className="dict-pill-large">{meaning.partOfSpeech.toUpperCase()}</span> : null}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="dict-save-icon"
                                                        onClick={() => handleOpenSaveMeaningModal(meaning)}
                                                        disabled={lookupState.saving}
                                                        title="Luu tu"
                                                        aria-label="Luu tu"
                                                    >
                                                        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                                                            <path d="M5 3h14v18l-7-4-7 4V3z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                <p className="dict-meaning-card__definition">{meaning.definitionEn}</p>

                                                {meaning.definitionVi && (
                                                    <p className="dict-meaning-card__definition-vi">{meaning.definitionVi}</p>
                                                )}

                                                {lookupState.response?.contextTranslation && (
                                                    <div className="dict-context-translation">
                                                        <span className="dict-context-label">Dịch ngữ cảnh:</span>
                                                        <p className="dict-context-text">{lookupState.response.contextTranslation}</p>
                                                    </div>
                                                )}

                                                {meaning.example ? (
                                                    <ul className="dict-examples">
                                                        <li>{meaning.example}</li>
                                                    </ul>
                                                ) : null}
                                            </div>
                                        ))}
                                    </div>

                                    {lookupState.saveMessage ? (
                                        <p className="reading-vocab-empty">{lookupState.saveMessage}</p>
                                    ) : null}

                                    {lookupState.saveError ? (
                                        <div className="reading-vocab-empty reading-vocab-error-box">
                                            <span>{lookupState.saveError}</span>
                                            {lookupState.saveError.includes('Premium') && (
                                                <Link to="/subscription" className="reading-error-upgrade-link">
                                                    Nâng cấp Premium ngay →
                                                </Link>
                                            )}
                                        </div>
                                    ) : null}
                                </>
                            ) : null}
                        </div>
                    </div>
                ) : null}

                {lookupState.saveModalOpen && lookupState.saveDraft ? (
                    <div className="reading-save-modal-overlay" onClick={handleCloseSaveMeaningModal}>
                        <div className="reading-save-modal" onClick={(event) => event.stopPropagation()}>
                            <h2 className="reading-save-modal__title">Luu tu vung da chon</h2>

                            <div className="reading-save-modal__form">
                                <div className="reading-save-form__group">
                                    <label>Tu tieng Anh</label>
                                    <input type="text" value={lookupState.saveDraft.word || ''} onChange={(event) => handleSaveFormChange('word', event.target.value)} />
                                </div>

                                <div className="reading-save-form__group">
                                    <label>Phien am</label>
                                    <input type="text" value={lookupState.saveDraft.phonetic || ''} onChange={(event) => handleSaveFormChange('phonetic', event.target.value)} />
                                    <div className="reading-save-pronunciation-actions">
                                        {pronunciationUk?.audio ? (
                                            <button
                                                type="button"
                                                className="dict-speak-btn"
                                                onClick={() => handleSpeak(pronunciationUk.audio)}
                                                aria-label="Nghe phat am UK"
                                                title="Nghe UK"
                                            >
                                                <SpeakerIcon />
                                                <span>UK</span>
                                            </button>
                                        ) : null}
                                        {pronunciationUs?.audio ? (
                                            <button
                                                type="button"
                                                className="dict-speak-btn"
                                                onClick={() => handleSpeak(pronunciationUs.audio)}
                                                aria-label="Nghe phat am US"
                                                title="Nghe US"
                                            >
                                                <SpeakerIcon />
                                                <span>US</span>
                                            </button>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="reading-save-form__group">
                                    <label>Level</label>
                                    <input type="text" value={lookupState.saveDraft.level || ''} onChange={(event) => handleSaveFormChange('level', event.target.value)} />
                                </div>

                                <div className="reading-save-form__group">
                                    <label>Tu loai</label>
                                    <input type="text" value={lookupState.saveDraft.partOfSpeech || ''} onChange={(event) => handleSaveFormChange('partOfSpeech', event.target.value)} />
                                </div>

                                <div className="reading-save-form__group">
                                    <label>Dinh nghia tieng Anh</label>
                                    <textarea rows="3" value={lookupState.saveDraft.definitionEng || ''} onChange={(event) => handleSaveFormChange('definitionEng', event.target.value)} />
                                </div>

                                <div className="reading-save-form__group">
                                    <label>Dinh nghia tieng Viet</label>
                                    <textarea rows="3" value={lookupState.saveDraft.definitionVi || ''} onChange={(event) => handleSaveFormChange('definitionVi', event.target.value)} />
                                </div>

                                <div className="reading-save-form__group">
                                    <label>Vi du lien quan</label>
                                    <textarea rows="2" value={lookupState.saveDraft.exampleEng || ''} onChange={(event) => handleSaveFormChange('exampleEng', event.target.value)} />
                                </div>

                                <div className="reading-save-form__group">
                                    <label>Dich vi du (ngu canh)</label>
                                    <textarea rows="2" value={lookupState.saveDraft.exampleVi || ''} onChange={(event) => handleSaveFormChange('exampleVi', event.target.value)} />
                                </div>

                                <div className="dictionary-save-type-selector" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <label className="save-option-checkbox" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                                        <input 
                                            type="radio" 
                                            name="saveType" 
                                            value="SRS" 
                                            checked={lookupState.saveDraft.saveType === 'SRS'} 
                                            onChange={(e) => handleSaveFormChange('saveType', e.target.value)}
                                        />
                                        <span>Học thời điểm vàng (SRS)</span>
                                    </label>
                                    <label className="save-option-checkbox" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                                        <input 
                                            type="radio" 
                                            name="saveType" 
                                            value="FLASHCARD" 
                                            checked={lookupState.saveDraft.saveType === 'FLASHCARD'} 
                                            onChange={(e) => handleSaveFormChange('saveType', e.target.value)}
                                        />
                                        <span>Lưu vào Flashcard</span>
                                    </label>
                                </div>

                                {lookupState.saveDraft.saveType === 'FLASHCARD' && (
                                    <div className="reading-save-form__group" style={{ marginTop: '1rem' }}>
                                        <label>Chọn bộ thẻ</label>
                                        <select 
                                            value={lookupState.saveDraft.deckId} 
                                            onChange={(e) => handleSaveFormChange('deckId', e.target.value)}
                                            style={{ width: '100%', padding: '0.5rem', borderRadius: '0.4rem', border: '1px solid #ddd' }}
                                        >
                                            <option value="">-- Chọn bộ thẻ --</option>
                                            {lookupState.availableDecks.map(deck => (
                                                <option key={deck.id} value={deck.id}>{deck.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="reading-save-modal__actions">
                                <button type="button" className="reading-save-modal__btn reading-save-modal__btn--cancel" onClick={handleCloseSaveMeaningModal}>
                                    Huy
                                </button>
                                <button type="button" className="reading-save-modal__btn reading-save-modal__btn--save" onClick={handleSaveMeaning} disabled={lookupState.saving}>
                                    {lookupState.saving ? 'Dang luu...' : 'Luu'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </section>
    )
}
