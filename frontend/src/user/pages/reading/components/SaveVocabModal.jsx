import React from 'react';
import { createPortal } from 'react-dom';
export function SpeakerIcon() {
    return (
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path d="M11 5L6 9H2v6h4l5 4V5z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M15.54 8.46a5 5 0 010 7.07M18.37 5.63a9 9 0 010 12.73" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    )
}
export function SaveVocabModal({
    lookupState,
    handleCloseSaveMeaningModal,
    handleSaveFormChange,
    handleSaveMeaning,
    handleSpeak,
    pronunciationUk,
    pronunciationUs
}) {
    const [container, setContainer] = React.useState(null);

    React.useEffect(() => {
        setContainer(document.body);
    }, []);

    if (!container || !lookupState.saveModalOpen || !lookupState.saveDraft) return null;

    return createPortal(
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
                        <input type="text" value={lookupState.saveDraft.pronunciation || ''} onChange={(event) => handleSaveFormChange('pronunciation', event.target.value)} />
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
                        <input type="text" value={lookupState.saveDraft.typeOfWord || ''} onChange={(event) => handleSaveFormChange('typeOfWord', event.target.value)} />
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

                    <div className="reading-save-notice" style={{ marginTop: '1rem', padding: '0.8rem', background: '#f8fafc', borderRadius: '0.6rem', border: '1px solid #e2e8f0' }}>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                            ✨ Từ vựng sẽ được lưu vào lộ trình ôn tập <strong>Thời điểm vàng</strong> để giúp bạn ghi nhớ lâu dài.
                        </p>
                    </div>
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
        </div>,
        container
    );
}
