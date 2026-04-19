import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePremiumStatus } from '@/hooks/usePremiumStatus'
import { getUserSession } from '@/user/utils/authSession'
import './dictionary.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

function SearchIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
			<circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
			<path d="M16 16l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
		</svg>
	)
}

function SpeakerIcon() {
	return (
		<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
			<path d="M11 5L6 9H2v6h4l5 4V5z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
			<path d="M15.54 8.46a5 5 0 010 7.07M18.37 5.63a9 9 0 010 12.73" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
		</svg>
	)
}

function BookmarkIcon() {
	return (
		<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
			<path d="M5 3h14v18l-7-4-7 4V3z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
		</svg>
	)
}

function EmptyIcon() {
	return (
		<svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">
			<circle cx="60" cy="60" r="40" fill="#edf1ff" />
			<rect x="37" y="26" width="46" height="60" rx="10" fill="#f8faff" stroke="#cfd8f3" strokeWidth="2" />
			<path d="M72 26l11 11H72z" fill="#e5ebff" />
			<circle cx="60" cy="55" r="10" fill="#e0e8ff" stroke="#9aa8dd" strokeWidth="2" />
			<path d="M56 57h8M58 52h4" stroke="#6675c8" strokeWidth="2" strokeLinecap="round" />
			<path d="M72 72l11 11" stroke="#7d8ce5" strokeWidth="5" strokeLinecap="round" />
		</svg>
	)
}

export function Dictionary() {
	const [searchText, setSearchText] = useState('')
	const [searchedWord, setSearchedWord] = useState('')
	const [apiResult, setApiResult] = useState(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const navigate = useNavigate()
	const session = getUserSession()
	const premiumStatus = usePremiumStatus(session?.userId)
	
	const [showSaveModal, setShowSaveModal] = useState(false)
	const [saveFormData, setSaveFormData] = useState({
		word: '',
		phonetic: '',
		definitionEng: '',
		definitionVi: '',
		exampleEng: '',
		exampleVi: '',
	})

	const hasResult = searchedWord.trim().length > 0

	const resultEntry = useMemo(() => {
		if (!hasResult) {
			return null
		}
		if (apiResult) {
			return apiResult
		}
		return null
	}, [hasResult, searchedWord, apiResult])

	const onSubmitSearch = async (event) => {
		event.preventDefault()
		if (!searchText.trim()) {
			setError('Please enter a word')
			return
		}

		setLoading(true)
		setError('')
		setApiResult(null)

		try {
			const response = await fetch(`${API_BASE_URL}/api/dictionary/lookup`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					word: searchText.trim(),
					contextSentence: '',
				}),
			})

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`)
			}

			const data = await response.json()
			
			if (data.error) {
				setError(data.error || 'Word not found')
				setSearchedWord(searchText)
				setApiResult(null)
				return
			}

			setSearchedWord(searchText)
			
			if (data && data.meanings && data.meanings.length > 0) {
				const transformedEntry = {
					word: data.word || searchText.trim(),
					partOfSpeech: data.meanings[0]?.partOfSpeech || 'noun',
					uk: data.phonetic || '',
					us: data.phonetic || '',
					ukAudio: data.ukAudio || '',
					usAudio: data.usAudio || '',
					meanings: data.meanings.map((m, idx) => ({
						id: idx + 1,
						level: m.level || '',
						partOfSpeech: m.partOfSpeech || 'noun',
						definition: m.definition || '',
						example: m.example || '',
						examples: m.examples || [],
						meaningVi: m.meaningVi || '',
					})),
				}
				setApiResult(transformedEntry)
			} else {
				setError('Không tìm thấy định nghĩa cho từ này')
				setApiResult(null)
			}
		} catch (err) {
			setError(err.message || 'Failed to lookup word')
			setSearchedWord(searchText)
			setApiResult(null)
		} finally {
			setLoading(false)
		}
	}

	const handleOpenSaveModal = (meaning) => {
		if (resultEntry) {
			setSaveFormData({
				word: resultEntry.word,
				phonetic: resultEntry.uk,
				definitionEng: meaning.definition || '',
				definitionVi: meaning.meaningVi || '',
				exampleEng: meaning.examples[0] || meaning.example || '',
				exampleVi: '',
			})
			setShowSaveModal(true)
		}
	}

	const handleCloseSaveModal = () => {
		setShowSaveModal(false)
	}

	const handleSaveFormChange = (field, value) => {
		setSaveFormData(prev => ({
			...prev,
			[field]: value
		}))
	}

	const playAudio = (url) => {
		if (!url) return
		const audio = new Audio(url)
		audio.play().catch(err => console.error('Audio playback failed:', err))
	}

	const handleSaveWord = async () => {
		if (!saveFormData.word || !saveFormData.definitionEng || !saveFormData.definitionVi) {
			alert('Vui lòng nhập đầy đủ các trường')
			return
		}

		setLoading(true)
		try {
			const authToken = localStorage.getItem('token') || session?.userId;
			const response = await fetch(`${API_BASE_URL}/api/user/vocab-custom/save`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${authToken}`
				},
				body: JSON.stringify({
					word: saveFormData.word,
					phonetic: saveFormData.phonetic,
					meaningEn: saveFormData.definitionEng,
					meaningVi: saveFormData.definitionVi,
					example: saveFormData.exampleEng,
					exampleVi: saveFormData.exampleVi,
				}),
			})

			if (!response.ok) {
				const errorMsg = await response.text()
				if (errorMsg === 'Từ đã được lưu') {
					alert('Từ đã được lưu')
				} else if (response.status === 402 || errorMsg.includes('giới hạn')) {
					alert(errorMsg || 'Bạn đã đạt giới hạn lưu từ vựng. Vui lòng nâng cấp Premium!')
				} else {
					throw new Error(errorMsg || 'Failed to save word')
				}
				return
			}

			alert('Lưu từ thành công')
			setShowSaveModal(false)
		} catch (err) {
			alert('Lỗi khi lưu từ vựng: ' + err.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<section className="dictionary-page">
			<div className="dictionary-page__container">
				<form className="dictionary-search" onSubmit={onSubmitSearch}>
					<div className="dictionary-search__input-wrap">
						<SearchIcon />
						<input
							type="text"
							placeholder="Tìm từ vựng"
							value={searchText}
							onChange={(event) => setSearchText(event.target.value)}
							disabled={loading}
						/>
					</div>
					<button type="submit" className="dictionary-search__lang" disabled={loading}>
						{loading ? 'Đang tải...' : 'Anh - Anh'}
					</button>
				</form>

				{error && (
					<div className="dictionary-error-banner">
						{error}
					</div>
				)}

				{!hasResult ? (
					<div className="dictionary-empty">
						<EmptyIcon />
						<p>Vui lòng nhập từ khóa để tra từ điển.</p>
					</div>
				) : resultEntry && (
					<section className="dictionary-result">
						<header className="dictionary-result__topbar">
							<div className="dictionary-result__tabs">
								<button type="button" className="is-active">Anh - Anh</button>
								<button type="button">Tiếng Việt</button>
								<button type="button">Chat GPT</button>
							</div>
						</header>

						<div className="dictionary-entry">
							<div className="dictionary-entry__head">
								<h1>{resultEntry.word}</h1>
								<span className="dictionary-pill">{resultEntry.partOfSpeech}</span>
							</div>

							<div className="dictionary-pronunciation-grid">
								<div className="dictionary-pronunciation-line">
									<strong>UK</strong>
									<button type="button" aria-label="Phát âm UK" onClick={() => playAudio(resultEntry.ukAudio)} disabled={!resultEntry.ukAudio}>
										<SpeakerIcon />
									</button>
									<span>{resultEntry.uk}</span>
								</div>

								<div className="dictionary-pronunciation-line">
									<strong>US</strong>
									<button type="button" aria-label="Phát âm US" onClick={() => playAudio(resultEntry.usAudio)} disabled={!resultEntry.usAudio}>
										<SpeakerIcon />
									</button>
									<span>{resultEntry.us}</span>
								</div>
							</div>

							<div className="dictionary-meanings-block">
								{resultEntry.meanings.map((meaning) => (
									<article key={meaning.id} className="dictionary-meaning-row">
										<div className="dictionary-meaning-row__title">
											<div className="meaning-title-content">
												{meaning.level && <span className="dictionary-pill dictionary-pill--level">{meaning.level}</span>}
												<span className="dictionary-pill">{meaning.partOfSpeech}</span>
												<strong>{meaning.definition}</strong>
											</div>
											<button type="button" className="dictionary-save-icon" aria-label="Lưu nghĩa" onClick={() => handleOpenSaveModal(meaning)}>
												<BookmarkIcon />
											</button>
										</div>
										
										{meaning.meaningVi && (
											<div className="dictionary-meaning-vi">
												🇻🇳 {meaning.meaningVi}
											</div>
										)}

										{meaning.examples && meaning.examples.length > 0 && (
											<div className="dictionary-examples">
												<strong>Ví dụ:</strong>
												<ul>
													{meaning.examples.map((ex, idx) => (
														<li key={idx}>{ex}</li>
													))}
												</ul>
											</div>
										)}
									</article>
								))}
							</div>
						</div>
					</section>
				)}

				{showSaveModal && (
					<div className="dictionary-save-modal-overlay" onClick={handleCloseSaveModal}>
						<div className="dictionary-save-modal" onClick={(e) => e.stopPropagation()}>
							<h2 className="dictionary-save-modal__title">Lưu từ vựng</h2>
							
							<div className="dictionary-save-modal__form">
								<div className="dictionary-save-form__group">
									<label>Từ tiếng Anh</label>
									<input
										type="text"
										value={saveFormData.word}
										onChange={(e) => handleSaveFormChange('word', e.target.value)}
									/>
								</div>

								<div className="dictionary-save-form__group">
									<label>Phiên âm</label>
									<input
										type="text"
										value={saveFormData.phonetic}
										onChange={(e) => handleSaveFormChange('phonetic', e.target.value)}
									/>
								</div>

								<div className="dictionary-save-form__row">
									<div className="dictionary-save-form__group">
										<label>Định nghĩa (English)</label>
										<textarea
											value={saveFormData.definitionEng}
											onChange={(e) => handleSaveFormChange('definitionEng', e.target.value)}
											rows="3"
										/>
									</div>
									<div className="dictionary-save-form__group">
										<label>Định nghĩa (Việt)</label>
										<textarea
											value={saveFormData.definitionVi}
											onChange={(e) => handleSaveFormChange('definitionVi', e.target.value)}
											rows="3"
										/>
									</div>
								</div>

								<div className="dictionary-save-form__row">
									<div className="dictionary-save-form__group">
										<label>Ví dụ (English)</label>
										<textarea
											value={saveFormData.exampleEng}
											onChange={(e) => handleSaveFormChange('exampleEng', e.target.value)}
											rows="2"
										/>
									</div>
									<div className="dictionary-save-form__group">
										<label>Ví dụ (Việt)</label>
										<textarea
											value={saveFormData.exampleVi}
											onChange={(e) => handleSaveFormChange('exampleVi', e.target.value)}
											rows="2"
										/>
									</div>
								</div>
							</div>

							<div className="dictionary-save-modal__actions">
								<button type="button" className="dict-modal-btn dict-modal-btn--cancel" onClick={handleCloseSaveModal}>Hủy</button>
								<button type="button" className="dict-modal-btn dict-modal-btn--save" onClick={handleSaveWord} disabled={loading}>
									{loading ? 'Đang lưu...' : 'Lưu'}
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</section>
	)
}
