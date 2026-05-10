import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getUserSession } from '../../utils/authSession'
import { usePremiumStatus } from '../../../hooks/usePremiumStatus'
import './readingDetail.css'
import '../../components/interaction/interaction.css'
import {
    estimateMinutes,
    normalizeContentHtml,
    tokenizeContentHtml,
    cleanContextSentence,
    extractSentence
} from './utils'
import { DictionaryModal } from './components/DictionaryModal'
import { SaveVocabModal } from './components/SaveVocabModal'
import { ReadingDetailHero } from './components/ReadingDetailHero'

// Custom Hooks
import { useArticleData } from './hooks/useArticleData'
import { useArticleProgress } from './hooks/useArticleProgress'
import { useDictionaryLookup } from './hooks/useDictionaryLookup'

export function SpeakerIcon() {
    return (
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path d="M11 5L6 9H2v6h4l5 4V5z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M15.54 8.46a5 5 0 010 7.07M18.37 5.63a9 9 0 010 12.73" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    )
}

export function ReadingDetail() {
    const { topicId, articleId } = useParams()
    const session = getUserSession()
    const userId = session?.userId ? Number(session.userId) : null
    const premiumStatus = usePremiumStatus(userId)

    const { article, isLoading, errorMessage, savedVocab, fetchSavedVocab } = useArticleData(articleId, topicId, userId)
    const { progressPercent } = useArticleProgress(articleId, article, userId)
    
    const {
        lookupState,
        openLookupModal,
        closeLookupModal,
        handleOpenSaveMeaningModal,
        handleCloseSaveMeaningModal,
        handleSaveFormChange,
        handleSaveMeaning,
        pronunciationUk,
        pronunciationUs
    } = useDictionaryLookup(articleId, premiumStatus, fetchSavedVocab)

    const contentHtml = useMemo(() => normalizeContentHtml(article?.content), [article?.content])
    const interactiveHtml = useMemo(
        () => tokenizeContentHtml(contentHtml, lookupState.normalizedWord, savedVocab),
        [contentHtml, lookupState.normalizedWord, savedVocab],
    )

    const handleSpeak = (audioUrl) => {
        if (!audioUrl) return
        const audio = new Audio(audioUrl)
        void audio.play().catch(() => {})
    }

    const handleArticleWordClick = (event) => {
        const token = event.target.closest('.reading-inline-word')
        if (!token) return

        const container = token.closest('p, li, blockquote, figcaption, h2, h3, h4')
        const fullText = container?.textContent || article?.title || ''
        const rawWord = token.textContent || ''
        const sentence = cleanContextSentence(extractSentence(fullText, rawWord))
        void openLookupModal(rawWord, sentence)
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

                <ReadingDetailHero 
                    article={article} 
                    minutes={minutes} 
                    progressPercent={progressPercent} 
                />

                <article className="reading-article-body">
                    {interactiveHtml ? (
                        <div
                            className="reading-article-body__rich"
                            onClick={handleArticleWordClick}
                            dangerouslySetInnerHTML={{ __html: interactiveHtml }}
                        />
                    ) : (
                        <p className="reading-article-body__paragraph">Bai viet nay chua co noi dung.</p>
                    )}
                </article>

                <DictionaryModal 
                    lookupState={lookupState}
                    closeLookupModal={closeLookupModal}
                    openLookupModal={openLookupModal}
                    handleSpeak={handleSpeak}
                    handleOpenSaveMeaningModal={handleOpenSaveMeaningModal}
                    pronunciationUk={pronunciationUk}
                    pronunciationUs={pronunciationUs}
                />

                <SaveVocabModal 
                    lookupState={lookupState}
                    handleCloseSaveMeaningModal={handleCloseSaveMeaningModal}
                    handleSaveFormChange={handleSaveFormChange}
                    handleSaveMeaning={handleSaveMeaning}
                    handleSpeak={handleSpeak}
                    pronunciationUk={pronunciationUk}
                    pronunciationUs={pronunciationUs}
                />
            </div>
        </section>
    )
}
