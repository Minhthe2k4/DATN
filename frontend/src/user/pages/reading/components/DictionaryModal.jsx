import React from 'react';
import { Link } from 'react-router-dom';

export function SpeakerIcon() {
    return (
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path d="M11 5L6 9H2v6h4l5 4V5z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M15.54 8.46a5 5 0 010 7.07M18.37 5.63a9 9 0 010 12.73" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    )
}

export function DictionaryModal({
    lookupState,
    closeLookupModal,
    openLookupModal,
    handleSpeak,
    handleOpenSaveMeaningModal,
    pronunciationUk,
    pronunciationUs
}) {
    if (!lookupState.open || lookupState.saveModalOpen) return null;

    return (
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
                        <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                            <button
                                type="button"
                                className="vlesson-primary"
                                style={{ height: '32px', fontSize: '12px' }}
                                onClick={() => openLookupModal(lookupState.word, lookupState.sentence)}
                            >
                                Thử lại
                            </button>
                            {lookupState.error.includes('Premium') && (
                                <Link to="/subscription" className="reading-error-upgrade-link" style={{ fontSize: '12px' }}>
                                    Nâng cấp Premium →
                                </Link>
                            )}
                        </div>
                    </div>
                ) : null}

                {!lookupState.loading && !lookupState.error && lookupState.response ? (
                    <>
                        {/* Header: Word + Part of Speech */}
                        <div className="dict-header-section">
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <h2 className="dict-word-title">{lookupState.response?.word || lookupState.word}</h2>
                                    {lookupState.response?.dictionarySource && (
                                        <span style={{ fontSize: '10px', color: '#94a3b8', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                                            {lookupState.response.dictionarySource}
                                        </span>
                                    )}
                                </div>
                                <div className="dict-header-badges">
                                    {lookupState.response?.level ? <span className="dict-pill">{lookupState.response.level}</span> : null}
                                    {lookupState.response?.meanings?.[0]?.typeOfWord ? <span className="dict-pill">{lookupState.response.meanings[0].typeOfWord.toUpperCase()}</span> : null}
                                </div>
                            </div>
                            {lookupState.response?.dictionarySource !== 'AI-Generated' && (
                                <button
                                    type="button"
                                    className="vlesson-ghost"
                                    style={{ fontSize: '11px', padding: '4px 8px' }}
                                    onClick={() => openLookupModal(lookupState.word, lookupState.sentence, true)}
                                    disabled={lookupState.loading}
                                >
                                    ✨ Làm mới từ AI
                                </button>
                            )}
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
                                            {meaning.typeOfWord ? <span className="dict-pill-large">{meaning.typeOfWord.toUpperCase()}</span> : null}
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

                    </>
                ) : null}
            </div>
        </div>
    );
}
