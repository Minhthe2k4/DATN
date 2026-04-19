import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserSession } from '../../utils/authSession'
import { usePremiumStatus } from '../../../hooks/usePremiumStatus'
import { checkPremiumLimit } from '../../config/premiumLimits'
import './vocabularySaved.css'

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
	const premiumStatus = usePremiumStatus(userId)
	
	const [items, setItems] = useState(() => readSavedVocabulary())
	const [searchTerm, setSearchTerm] = useState('')
	const [editingId, setEditingId] = useState(null)
	const [draft, setDraft] = useState(null)

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
			const text = [item.word, item.phonetic, item.meaningEn, item.meaningVi, item.example]
				.filter(Boolean)
				.join(' ')
				.toLowerCase()
			return text.includes(q)
		})
	}, [items, searchTerm])

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
				phonetic: draft.phonetic || '',
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
						<p className="saved-vocab-header__eyebrow">Từ vựng đã lưu</p>
						<h1>Quản lý ngân hàng từ vựng</h1>
						<p>Tìm kiếm nhanh và chỉnh sửa/xóa từ theo từng cấp độ từ 1 đến 6.</p>
					</div>
					<button type="button" className="saved-vocab-header__back" onClick={() => navigate('/vocabulary')}>
						Quay lại Học từ vựng
					</button>
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
															value={draft.phonetic || ''}
															onChange={(event) => setDraft((prev) => ({ ...prev, phonetic: event.target.value }))}
															placeholder="Phiên âm"
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
													{item.phonetic ? <p className="saved-word-card__phonetic">{item.phonetic}</p> : null}
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
