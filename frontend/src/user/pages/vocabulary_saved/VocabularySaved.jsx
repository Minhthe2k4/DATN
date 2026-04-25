import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserSession } from '../../utils/authSession'
import { usePremiumStatus } from '../../../hooks/usePremiumStatus'
import { checkPremiumLimit } from '../../config/premiumLimits'
import './vocabularySaved.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

const STORAGE_KEY = 'dashboard-vocab-bank-v1'

function readSavedVocabulary() {
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY)
		const parsed = raw ? JSON.parse(raw) : []
		return Array.isArray(parsed) ? parsed : []
	} catch {
		return []
	}
}

function writeSavedVocabulary(items) {
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function normalizeLevel(level) {
	const numeric = Number(level)
	if (!Number.isFinite(numeric)) {
		return 1
	}
	return Math.max(1, Math.min(6, Math.round(numeric)))
}

export function VocabularySaved() {
	const navigate = useNavigate()
	const session = getUserSession()
	const userId = session?.userId ? Number(session.userId) : null
	const isLoggedIn = !!session
	const premiumStatus = usePremiumStatus(userId)
	
	const [items, setItems] = useState(() => readSavedVocabulary())
	const [searchTerm, setSearchTerm] = useState('')
	const [editingId, setEditingId] = useState(null)
	const [draft, setDraft] = useState(null)
	const [isLoading, setIsLoading] = useState(false)

	// Check if user has reached vocabulary limit
	const vocabLimit = useMemo(() => {
		return checkPremiumLimit('SAVED_VOCABULARY', items.length, premiumStatus?.isPremium, premiumStatus?.featureLimits)
	}, [items.length, premiumStatus?.isPremium, premiumStatus?.featureLimits])

	const filteredItems = useMemo(() => {
		const q = searchTerm.trim().toLowerCase()
		if (!q) {
			return items
		}

		return items.filter((item) => {
			const text = [item.word, item.pronunciation, item.meaningEn, item.meaningVi, item.example]
				.filter(Boolean)
				.join(' ')
				.toLowerCase()
			return text.includes(q)
		})
	}, [items, searchTerm])

	const fetchLearningVocab = async () => {
		if (!isLoggedIn) {
			console.log('VocabularySaved: Not logged in, skipping fetch.')
			return
		}
		setIsLoading(true)
		console.log('VocabularySaved: Fetching SRS data for user', session?.userId)
		try {
			const authToken = localStorage.getItem('token') || session?.userId
			const response = await fetch(`${API_BASE_URL}/api/user/learning/all-vocab`, {
				headers: { 'Authorization': `Bearer ${authToken}` }
			})
			if (response.ok) {
				const data = await response.json()
				console.log('VocabularySaved: SUCCESS! Fetched:', data.length, 'words')
				// Transform cloud data
				const cloudItems = data.map(it => ({
					...it,
					level: it.masteryLevel || 1,
					isCloud: true // Mark as synchronized
				}))
				setItems(cloudItems)
				writeSavedVocabulary(cloudItems)
			} else {
				console.error('VocabularySaved: API Error:', response.status)
			}
		} catch (err) {
			console.warn('VocabularySaved: Network error:', err)
		} finally {
			setIsLoading(false)
		}
	}

	const syncLocalToCloud = async () => {
		if (!isLoggedIn) return
		const localItems = readSavedVocabulary().filter(it => !it.isCloud)
		if (localItems.length === 0) {
			alert('Tất cả từ vựng đã được đồng bộ!')
			return
		}

		setIsLoading(true)
		try {
			const authToken = localStorage.getItem('token') || session?.userId
			const vocabsToSave = localItems.map(it => ({
				word: it.word,
				pronunciation: it.pronunciation,
				meaningEn: it.meaningEn,
				meaningVi: it.meaningVi,
				example: it.example,
				exampleVi: it.exampleVi,
				level: 'A1' // Default
			}))

			const response = await fetch(`${API_BASE_URL}/api/user/learning/complete-lesson/custom`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${authToken}`
				},
				body: JSON.stringify({
					vocabularies: vocabsToSave,
					addToSRS: true
				}),
			})

			if (response.ok) {
				alert(`Đã đồng bộ thành công ${localItems.length} từ vào hệ thống SRS!`)
				fetchLearningVocab()
			}
		} catch (err) {
			console.error('Sync failed:', err)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		console.log('VocabularySaved: Component Mounted. isLoggedIn:', isLoggedIn)
		if (isLoggedIn) {
			fetchLearningVocab()
		}
	}, [isLoggedIn, session?.userId])

	const groupedByLevel = useMemo(() => {
		const groups = new Map()
		for (let level = 1; level <= 6; level += 1) {
			groups.set(level, [])
		}

		for (const item of filteredItems) {
			const level = normalizeLevel(item.level)
			groups.get(level).push(item)
		}

		return groups
	}, [filteredItems])

	const startEdit = (item) => {
		setEditingId(item.id)
		setDraft({
			...item,
			level: normalizeLevel(item.level),
		})
	}

	const cancelEdit = () => {
		setEditingId(null)
		setDraft(null)
	}

	const saveEdit = () => {
		if (!draft?.word?.trim()) {
			return
		}

		// Check if user has reached limit (when creating new words)
		if (editingId === null && vocabLimit.isLimited && !premiumStatus?.isPremium) {
			alert(`❌ Bạn đã đạt giới hạn lưu từ (${vocabLimit.limit} từ). Nâng cấp Premium để lưu không giới hạn!`)
			return
		}

		const nextItems = items.map((item) => {
			if (item.id !== editingId) {
				return item
			}

			return {
				...item,
				word: draft.word.trim(),
				pronunciation: draft.pronunciation || '',
				meaningEn: draft.meaningEn || '',
				meaningVi: draft.meaningVi || '',
				example: draft.example || '',
				level: normalizeLevel(draft.level),
			}
		})

		setItems(nextItems)
		writeSavedVocabulary(nextItems)
		cancelEdit()
	}

	const removeWord = (id) => {
		const nextItems = items.filter((item) => item.id !== id)
		setItems(nextItems)
		writeSavedVocabulary(nextItems)
		if (editingId === id) {
			cancelEdit()
		}
	}

	return (
		<section className="saved-vocab-page">
			<div className="saved-vocab-page__container">
				<header className="saved-vocab-header">
					<div>
						<p className="saved-vocab-header__eyebrow">Hệ thống Spaced Repetition</p>
						<h1 style={{ color: '#2563eb', textTransform: 'uppercase' }}>Quản lý Thời điểm vàng (SRS)</h1>
						<p style={{ fontWeight: 'bold', color: '#1e293b' }}>
							Dữ liệu 6 cột dưới đây được đồng bộ 100% với Biểu đồ học tập của bạn.
						</p>
					</div>
					<div className="saved-vocab-header__actions">
						<button 
							type="button" 
							className="saved-vocab-sync-btn" 
							onClick={syncLocalToCloud}
							disabled={isLoading}
							title="Đưa từ vựng từ máy này vào hệ thống học SRS"
						>
							☁️ Đồng bộ SRS
						</button>
						<button 
							type="button" 
							className="saved-vocab-refresh-btn" 
							onClick={fetchLearningVocab}
							disabled={isLoading}
						>
							{isLoading ? '🔄...' : '🔄 Làm mới'}
						</button>
						<button type="button" className="saved-vocab-header__back" onClick={() => navigate('/vocabulary')}>
							Quay lại Học từ vựng
						</button>
					</div>
				</header>

				{/* Premium Storage Status */}
				{!premiumStatus?.isPremium && (
					<div className="premium-storage-info">
						<div className="storage-bar">
							<div 
								className={`storage-fill ${vocabLimit.isWarning ? 'warning' : ''} ${vocabLimit.isLimited ? 'limited' : ''}`}
								style={{ width: `${Math.min(100, (items.length / vocabLimit.limit) * 100)}%` }}
							></div>
						</div>
						<p className={`storage-text ${vocabLimit.isWarning || vocabLimit.isLimited ? 'highlight' : ''}`}>
							📚 {items.length} / {vocabLimit.limit} từ
							{vocabLimit.isLimited && <span> — 🔒 Đã đạt giới hạn</span>}
							{vocabLimit.isWarning && !vocabLimit.isLimited && <span> — ⚠️ Sắp hết dung lượng</span>}
						</p>
						{vocabLimit.isWarning && !vocabLimit.isLimited && (
							<p className="storage-hint">💡 Chỉ còn {vocabLimit.remaining} từ. Nâng cấp Premium để lưu không giới hạn!</p>
						)}
					</div>
				)}
				{premiumStatus?.isPremium && (
					<div className="premium-badge">
						⭐ Bạn là thành viên Premium — Lưu từ không giới hạn!
					</div>
				)}

				<div className="saved-vocab-toolbar">
					<input
						type="search"
						placeholder="Tìm từ muốn sửa hoặc xóa..."
						value={searchTerm}
						onChange={(event) => setSearchTerm(event.target.value)}
					/>
					<span>{filteredItems.length} từ phù hợp</span>
				</div>

				<div className="saved-vocab-grid">
					{Array.from({ length: 6 }, (_, index) => {
						const level = index + 1
						const words = groupedByLevel.get(level) ?? []

						return (
							<section key={level} className="saved-level-column" aria-label={`Cấp độ ${level}`}>
								<header className="saved-level-column__head">
									<h2>Cấp {level}</h2>
									<span>{words.length} từ</span>
								</header>

								<div className="saved-level-column__list">
									{words.length === 0 ? (
										<p className="saved-level-empty">Chưa có từ ở cấp này.</p>
									) : (
										words.map((item) => {
											const isEditing = editingId === item.id

											if (isEditing) {
												return (
													<article key={item.id} className="saved-word-card is-editing">
														<input
															type="text"
															value={draft.word}
															onChange={(event) => setDraft((prev) => ({ ...prev, word: event.target.value }))}
														/>
														<input
															type="text"
															value={draft.pronunciation || ''}
															onChange={(event) => setDraft((prev) => ({ ...prev, pronunciation: event.target.value }))}
															placeholder="Phien am"
														/>
														<textarea
															rows={2}
															value={draft.meaningVi || ''}
															onChange={(event) => setDraft((prev) => ({ ...prev, meaningVi: event.target.value }))}
															placeholder="Nghĩa tiếng Việt"
														/>
														<textarea
															rows={2}
															value={draft.meaningEn || ''}
															onChange={(event) => setDraft((prev) => ({ ...prev, meaningEn: event.target.value }))}
															placeholder="Nghĩa tiếng Anh"
														/>
														<input
															type="number"
															min={1}
															max={6}
															value={draft.level}
															onChange={(event) => setDraft((prev) => ({ ...prev, level: event.target.value }))}
														/>
														<div className="saved-word-card__actions">
															<button type="button" onClick={saveEdit}>Lưu</button>
															<button type="button" className="is-ghost" onClick={cancelEdit}>Hủy</button>
														</div>
													</article>
												)
											}

											return (
												<article key={item.id} className="saved-word-card">
													<div className="saved-word-card__head">
														<h3>{item.word}</h3>
														<span>Lv.{normalizeLevel(item.level)}</span>
													</div>
													{item.pronunciation ? <p className="saved-word-card__phonetic">{item.pronunciation}</p> : null}
													{item.meaningVi ? <p><strong>VI:</strong> {item.meaningVi}</p> : null}
													{item.meaningEn ? <p><strong>EN:</strong> {item.meaningEn}</p> : null}
													{item.example ? <p className="saved-word-card__example">{item.example}</p> : null}
													<div className="saved-word-card__actions">
														<button type="button" onClick={() => startEdit(item)}>Sửa</button>
														<button type="button" className="is-danger" onClick={() => removeWord(item.id)}>Xóa</button>
													</div>
												</article>
											)
										})
									)}
								</div>
							</section>
						)
					})}
				</div>
			</div>
		</section>
	)
}
