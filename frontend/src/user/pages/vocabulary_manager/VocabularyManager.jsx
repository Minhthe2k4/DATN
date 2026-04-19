import { useMemo, useState } from 'react'
import { getUserSession } from '../../utils/authSession'
import './vocabularyManager.css'

const STORAGE_KEY = 'dashboard-vocab-bank-v1'

const KNOWN_WORDS = {
	platform: {
		phonetic: '/ˈplæt.fɔːrm/',
		meaningEn: 'A base or place where people can do a specific activity.',
		meaningVi: 'Nền tảng hoặc nơi để thực hiện một hoạt động cụ thể.',
		example: 'This app is a learning platform for daily English practice.',
	},
	efficient: {
		phonetic: '/ɪˈfɪʃ.ənt/',
		meaningEn: 'Working well without wasting time or energy.',
		meaningVi: 'Hiệu quả, không lãng phí thời gian hoặc năng lượng.',
		example: 'A short review routine can be very efficient.',
	},
	adapt: {
		phonetic: '/əˈdæpt/',
		meaningEn: 'To change your behavior or method to fit a new situation.',
		meaningVi: 'Thích nghi, điều chỉnh để phù hợp với tình huống mới.',
		example: 'Students adapt quickly when the lesson format changes.',
	},
	innovate: {
		phonetic: '/ˈɪn.ə.veɪt/',
		meaningEn: 'To introduce new ideas or methods.',
		meaningVi: 'Đổi mới, đưa ra ý tưởng hoặc phương pháp mới.',
		example: 'Great teams innovate when old solutions stop working.',
	},
	collaborate: {
		phonetic: '/kəˈlæb.ə.reɪt/',
		meaningEn: 'To work together with others.',
		meaningVi: 'Hợp tác, làm việc cùng với người khác.',
		example: 'Designers and developers collaborate on each release.',
	},
}

function readStorage() {
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY)
		const parsed = raw ? JSON.parse(raw) : []
		return Array.isArray(parsed) ? parsed : []
	} catch {
		return []
	}
}

function writeStorage(items) {
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function clampLevel(value) {
	return Math.max(1, Math.min(6, value))
}

function estimateWordLevel(word, meaningEn = '', example = '') {
	const clean = String(word || '').trim().toLowerCase()
	if (!clean) {
		return 1
	}

	let score = 0
	if (clean.length >= 5) score += 1
	if (clean.length >= 8) score += 1
	if (clean.length >= 11) score += 1
	if (/tion$|sion$|ment$|ture$|ship$|ology$/.test(clean)) score += 1
	if ((meaningEn || '').split(' ').length >= 7) score += 1
	if ((example || '').split(' ').length >= 10) score += 1

	return clampLevel(1 + Math.floor(score / 1.2))
}

function guessPhonetic(word) {
	const base = String(word || '').trim().toLowerCase()
	if (!base) {
		return '/.../'
	}

	return `/${base
		.replace(/tion/g, 'shən')
		.replace(/ph/g, 'f')
		.replace(/th/g, 'θ')
		.replace(/oo/g, 'uː')
		.replace(/ee/g, 'iː')
		.replace(/a([bcdfghjklmnpqrstvwxyz])/g, 'æ$1')
		.replace(/e([bcdfghjklmnpqrstvwxyz])/g, 'e$1')}/`
}

function fallbackVietnamese(word, meaningEn) {
	if (meaningEn) {
		return `Nghĩa gần đúng của "${word}": ${meaningEn}`
	}

	return `Bản dịch tạm thời cho từ "${word}".`
}

async function translateToVietnamese(word, meaningEn) {
	const normalized = String(word || '').trim().toLowerCase()
	if (KNOWN_WORDS[normalized]?.meaningVi) {
		return KNOWN_WORDS[normalized].meaningVi
	}

	if (!meaningEn) {
		return fallbackVietnamese(word, '')
	}

	try {
		const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(meaningEn)}&langpair=en|vi`
		const response = await fetch(url)
		if (!response.ok) {
			return fallbackVietnamese(word, meaningEn)
		}

		const data = await response.json()
		const translated = data?.responseData?.translatedText
		if (!translated || translated.toLowerCase() === meaningEn.toLowerCase()) {
			return fallbackVietnamese(word, meaningEn)
		}

		return translated
	} catch {
		return fallbackVietnamese(word, meaningEn)
	}
}

async function fetchDictionaryProfile(word) {
	const normalized = String(word || '').trim().toLowerCase()
	if (!normalized) {
		return null
	}

	if (KNOWN_WORDS[normalized]) {
		const known = KNOWN_WORDS[normalized]
		return {
			...known,
			level: estimateWordLevel(normalized, known.meaningEn, known.example),
		}
	}

	let phonetic = guessPhonetic(normalized)
	let meaningEn = `An English vocabulary word: ${normalized}.`
	let example = `The word "${normalized}" appears in this vocabulary note.`

	try {
		const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(normalized)}`)
		if (response.ok) {
			const data = await response.json()
			const entry = Array.isArray(data) ? data[0] : null
			const phoneticText = entry?.phonetic || entry?.phonetics?.find((item) => item?.text)?.text
			const firstMeaning = entry?.meanings?.[0]?.definitions?.[0]
			if (phoneticText) {
				phonetic = phoneticText
			}
			if (firstMeaning?.definition) {
				meaningEn = firstMeaning.definition
			}
			if (firstMeaning?.example) {
				example = firstMeaning.example
			}
		}
	} catch {
		// Keep fallbacks when the external dictionary is unavailable.
	}

	const meaningVi = await translateToVietnamese(normalized, meaningEn)
	let exampleVi = ''
	if (example) {
		try {
			const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(example)}&langpair=en|vi`
			const response = await fetch(url)
			if (response.ok) {
				const data = await response.json()
				exampleVi = data?.responseData?.translatedText || ''
			}
		} catch {
			exampleVi = ''
		}
	}

	const level = estimateWordLevel(normalized, meaningEn, example)

	return {
		phonetic,
		meaningEn,
		meaningVi,
		example,
		exampleVi,
		level,
	}
}

function playWordAudio(word) {
	if (!word || !('speechSynthesis' in window)) {
		return
	}

	window.speechSynthesis.cancel()
	const utterance = new window.SpeechSynthesisUtterance(word)
	utterance.lang = 'en-US'
	utterance.rate = 0.9
	window.speechSynthesis.speak(utterance)
}

function createRow() {
	return {
		id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		word: '',
		phonetic: '',
		meaningEn: '',
		meaningVi: '',
		example: '',
		exampleVi: '',
		showExample: false,
		level: '',
		status: 'idle',
		error: '',
	}
}

function createSavedItem(row) {
	return {
		id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		word: row.word.trim(),
		phonetic: row.phonetic,
		meaningEn: row.meaningEn,
		meaningVi: row.meaningVi,
		example: row.example,
		exampleVi: row.exampleVi,
		level: row.level,
		levelSource: 'AI',
	}
}

function getDelimiterValue(mode, customValue, defaults) {
	if (mode === 'tab') return '\t'
	if (mode === 'comma') return ','
	if (mode === 'newline') return '\n'
	if (mode === 'semicolon') return ';'
	if (mode === 'custom') return customValue || defaults
	return defaults
}

function parseImportText(text, termMode, termCustom, cardMode, cardCustom) {
	const cardDelimiter = getDelimiterValue(cardMode, cardCustom, '\n')
	const termDelimiter = getDelimiterValue(termMode, termCustom, '\t')
	const rawCards = text
		.split(cardDelimiter)
		.map((item) => item.trim())
		.filter(Boolean)

	return rawCards.map((card, index) => {
		const parts = card.split(termDelimiter)
		return {
			id: `preview-${index}`,
			word: (parts[0] || '').trim(),
			definition: parts.slice(1).join(termDelimiter).trim(),
		}
	}).filter((item) => item.word)
}

export function VocabularyManager() {
	const session = getUserSession()
	const isLoggedIn = !!session
	const [rows, setRows] = useState(() => [createRow()])
	const [savedItems, setSavedItems] = useState(() => readStorage())
	const [message, setMessage] = useState('')
	const [editingId, setEditingId] = useState(null)
	const [editDraft, setEditDraft] = useState(null)
	const [isSaving, setIsSaving] = useState(false)
	const [isImportModalOpen, setIsImportModalOpen] = useState(false)
	const [importText, setImportText] = useState('')
	const [termDelimiterMode, setTermDelimiterMode] = useState('tab')
	const [termCustomDelimiter, setTermCustomDelimiter] = useState('')
	const [cardDelimiterMode, setCardDelimiterMode] = useState('newline')
	const [cardCustomDelimiter, setCardCustomDelimiter] = useState('')

	const totalWords = savedItems.length
	const avgLevel = useMemo(() => {
		if (!savedItems.length) {
			return 0
		}

		const total = savedItems.reduce((sum, item) => sum + Number(item.level || 0), 0)
		return (total / savedItems.length).toFixed(1)
	}, [savedItems])

	const importPreview = useMemo(
		() => parseImportText(importText, termDelimiterMode, termCustomDelimiter, cardDelimiterMode, cardCustomDelimiter),
		[importText, termDelimiterMode, termCustomDelimiter, cardDelimiterMode, cardCustomDelimiter]
	)

	const persistSavedItems = (nextItems) => {
		setSavedItems(nextItems)
		writeStorage(nextItems)
	}

	const updateRow = (id, patch) => {
		setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)))
	}

	const updateRowField = (id, field, value) => {
		updateRow(id, { [field]: value })
	}

	const toggleRowExample = (id) => {
		setRows((prev) => prev.map((row) => (
			row.id === id ? { ...row, showExample: !row.showExample } : row
		)))
	}

	const handleWordChange = (id, value) => {
		updateRow(id, {
			word: value,
			phonetic: '',
			meaningEn: '',
			meaningVi: '',
			example: '',
			level: '',
			status: 'idle',
			error: '',
		})
	}

	const generateForRow = async (row) => {
		const cleanWord = row.word.trim()
		if (!cleanWord) {
			return null
		}

		updateRow(row.id, { status: 'loading', error: '' })
		try {
			const generated = await fetchDictionaryProfile(cleanWord)
			if (!generated) {
				updateRow(row.id, { status: 'error', error: 'Không tạo được thông tin AI cho từ này.' })
				return null
			}

			updateRow(row.id, {
				phonetic: row.phonetic || generated.phonetic,
				meaningEn: row.meaningEn || generated.meaningEn,
				meaningVi: row.meaningVi || generated.meaningVi,
				example: row.example || generated.example,
				exampleVi: row.exampleVi || generated.exampleVi,
				level: row.level || generated.level,
				status: 'ready',
				error: '',
			})
			return generated
		} catch {
			updateRow(row.id, { status: 'error', error: 'AI tạm thời không thể xử lý từ này.' })
			return null
		}
	}

	const handleWordBlur = async (row) => {
		if (!row.word.trim() || row.status === 'loading' || row.meaningEn) {
			return
		}

		await generateForRow(row)
	}

	const insertRowAfter = (id) => {
		setRows((prev) => {
			const index = prev.findIndex((row) => row.id === id)
			if (index === -1) {
				return [...prev, createRow()]
			}

			const next = [...prev]
			next.splice(index + 1, 0, createRow())
			return next
		})
	}

	const closeImportModal = () => {
		setIsImportModalOpen(false)
		setImportText('')
		setTermDelimiterMode('tab')
		setTermCustomDelimiter('')
		setCardDelimiterMode('newline')
		setCardCustomDelimiter('')
	}

	const importPreviewIntoRows = async () => {
		if (!importPreview.length) {
			setMessage('Không có dữ liệu hợp lệ để nhập.')
			return
		}

		const importedRows = importPreview.map((item) => ({
			...createRow(),
			word: item.word,
			meaningVi: item.definition,
			status: 'idle',
		}))

		setRows(importedRows.length ? importedRows : [createRow()])
		closeImportModal()
		setMessage(`Đã đưa ${importedRows.length} từ vào màn hình thêm từ. AI đang hoàn thiện thông tin.`)

		for (const row of importedRows) {
			await generateForRow(row)
		}
	}

	const removeRow = (id) => {
		setRows((prev) => {
			if (prev.length === 1) {
				return [createRow()]
			}
			return prev.filter((row) => row.id !== id)
		})
	}

	const saveAllRows = async () => {
		if (!isLoggedIn) {
			setMessage('Vui lòng đăng nhập để lưu từ vựng vào bộ từ của bạn.')
			return
		}

		const filledRows = rows.filter((row) => row.word.trim())

		setIsSaving(true)
		const generatedRows = []
		for (const row of filledRows) {
			let nextRow = row
			if (!row.meaningEn || !row.phonetic || !row.meaningVi || !row.level) {
				const generated = await fetchDictionaryProfile(row.word)
				if (!generated) {
					continue
				}
				nextRow = {
					...row,
					...generated,
					status: 'ready',
				}
				updateRow(row.id, nextRow)
			}

			generatedRows.push(createSavedItem(nextRow))
		}

		if (!generatedRows.length) {
			setIsSaving(false)
			setMessage('Không có từ hợp lệ để lưu.')
			return
		}

		const nextItems = [...generatedRows, ...savedItems]
		persistSavedItems(nextItems)
		
		// Save to backend API
		try {
			const vocabsToSave = generatedRows.map((item) => ({
				word: item.word,
				phonetic: item.phonetic,
				meaningEn: item.meaningEn,
				meaningVi: item.meaningVi,
				example: item.example,
				exampleVi: item.exampleVi,
				level: item.level,
				levelSource: item.levelSource,
			}))

			const authToken = localStorage.getItem('token') || session?.userId;
			const response = await fetch('/api/user/vocab-custom/save-multiple', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${authToken}`
				},
				body: JSON.stringify({ vocabularies: vocabsToSave }),
				credentials: 'include',
			})

			if (response.ok) {
				const data = await response.json()
				console.log('Backend response:', data)
				if (data.status === 'local_storage') {
					console.log('Saved to local storage (not authenticated)')
				} else {
					console.log('Saved to backend successfully')
				}
			} else {
				console.warn('Failed to save to backend:', response.statusText)
			}
		} catch (error) {
			console.warn('Error saving to backend:', error)
		}

		setRows([createRow()])
		setIsSaving(false)
		setMessage(`Đã thêm ${generatedRows.length} từ vựng thủ công vào bộ từ.`)
	}

	const startEdit = (item) => {
		setEditingId(item.id)
		setEditDraft({ ...item })
	}

	const cancelEdit = () => {
		setEditingId(null)
		setEditDraft(null)
	}

	const saveEdit = () => {
		if (!editDraft?.word?.trim()) {
			setMessage('Không thể lưu: từ vựng đang trống.')
			return
		}

		const nextItems = savedItems.map((item) => (item.id === editingId
			? {
				...item,
				...editDraft,
				level: clampLevel(Number(editDraft.level) || 1),
			}
			: item))
		persistSavedItems(nextItems)
		cancelEdit()
		setMessage('Đã cập nhật từ vựng.')
	}

	const deleteItem = (id) => {
		const nextItems = savedItems.filter((item) => item.id !== id)
		persistSavedItems(nextItems)
		if (editingId === id) {
			cancelEdit()
		}
	}

	return (
		<section className="vmanager-page">
			<div className="vmanager-shell">
				<header className="vmanager-head">
					<div>
						<h1>Thêm từ vựng thủ công</h1>
						<p>Nhập từ, AI sẽ tự động điền phiên âm, nghĩa Anh, nghĩa Việt và level.</p>
					</div>
					<div className="vmanager-summary">
						<div>
							<span>Total words</span>
							<strong>{totalWords}</strong>
						</div>
						<div>
							<span>Avg level</span>
							<strong>{avgLevel}</strong>
						</div>
					</div>
				</header>

				{message && <div className="vmanager-note">{message}</div>}

				<section className="vmanager-builder">
					<div className="vmanager-toolbar">
						<button type="button" className="vmanager-btn vmanager-btn--ghost" onClick={() => setIsImportModalOpen(true)}>Thêm từ</button>
						<button type="button" className="vmanager-btn" onClick={saveAllRows} disabled={isSaving}>
							{isSaving ? 'Đang lưu...' : 'Lưu vào bộ từ vựng'}
						</button>
					</div>

					<div className="vmanager-rows">
						{rows.map((row, index) => (
							<div key={row.id} className="vmanager-row-stack">
								<article className="vmanager-row-card">
									<div className="vmanager-row-card__top">
										<span className="vmanager-row-card__index">{index + 1}</span>
										<div className="vmanager-row-card__actions">
											{row.status === 'loading' && <span className="vmanager-row-card__status">AI đang sinh...</span>}
											<button type="button" className="vmanager-row-card__remove" onClick={() => removeRow(row.id)}>
												Xóa
											</button>
										</div>
									</div>

									<div className="vmanager-row-card__grid">
										<div className="vmanager-main-panel">
											<div className="vmanager-field vmanager-field--term">
												<label>Từ vựng</label>
												<input
													type="text"
													value={row.word}
													onChange={(event) => handleWordChange(row.id, event.target.value)}
													onBlur={() => handleWordBlur(row)}
													placeholder="Nhập từ vựng..."
													lang="vi"
												/>
											</div>
										</div>

										<aside className="vmanager-ai-panel">
											<div className="vmanager-ai-panel__head">
												<span>Thông tin AI</span>
												{row.status === 'ready' && <em>Đã sinh</em>}
											</div>
											<div className="vmanager-field-grid vmanager-field-grid--compact">
												<div className="vmanager-field">
													<label>Phonetic</label>
													<input value={row.phonetic} onChange={(event) => updateRowField(row.id, 'phonetic', event.target.value)} placeholder="AI sẽ điền phiên âm" />
												</div>
												<div className="vmanager-field">
													<label>Level</label>
													<input value={row.level} onChange={(event) => updateRowField(row.id, 'level', event.target.value)} placeholder="AI sẽ điền level" />
												</div>
												<div className="vmanager-field vmanager-field--wide">
													<label>Nghĩa tiếng Anh</label>
													<textarea value={row.meaningEn} onChange={(event) => updateRowField(row.id, 'meaningEn', event.target.value)} placeholder="AI sẽ điền nghĩa tiếng Anh" rows={2} />
												</div>
												<div className="vmanager-field vmanager-field--wide">
													<label>Nghĩa tiếng Việt</label>
													<textarea value={row.meaningVi} onChange={(event) => updateRowField(row.id, 'meaningVi', event.target.value)} placeholder="AI sẽ điền nghĩa tiếng Việt" rows={2} lang="vi" />
												</div>
												{row.showExample && (
													<>
														<div className="vmanager-field vmanager-field--wide">
															<label>Example</label>
															<textarea value={row.example} onChange={(event) => updateRowField(row.id, 'example', event.target.value)} placeholder="AI sẽ điền ví dụ" rows={2} />
														</div>
														<div className="vmanager-field vmanager-field--wide">
															<label>Dịch ví dụ</label>
															<textarea value={row.exampleVi} onChange={(event) => updateRowField(row.id, 'exampleVi', event.target.value)} placeholder="AI sẽ dịch ví dụ" rows={2} lang="vi" />
														</div>
													</>
												)}
											</div>
										</aside>
									</div>

									<div className="vmanager-row-card__footer">
										<button type="button" className="vmanager-mini-btn" onClick={() => generateForRow(row)}>AI tạo lại</button>
										<button type="button" className="vmanager-mini-btn" onClick={() => playWordAudio(row.word)}>Audio</button>
										<button type="button" className="vmanager-mini-btn" onClick={() => toggleRowExample(row.id)}>
											{row.showExample ? 'Ẩn ví dụ' : 'Mở ví dụ'}
										</button>
										{row.error && <div className="vmanager-ai-box__error">{row.error}</div>}
									</div>
								</article>

								<div className="vmanager-row-stack__add">
									<button type="button" className="vmanager-add-circle" onClick={() => insertRowAfter(row.id)}>+</button>
								</div>
							</div>
						))}
					</div>
				</section>

				{isImportModalOpen && (
					<div className="vmanager-modal-backdrop" role="dialog" aria-modal="true">
						<div className="vmanager-modal">
							<div className="vmanager-modal__head">
								<div>
									<h2>Nhập dữ liệu</h2>
									<p>Chép và dán dữ liệu ở đây. Mỗi dòng là một thẻ, AI sẽ tự sinh thông tin bổ sung.</p>
								</div>
								<button type="button" className="vmanager-modal__close" onClick={closeImportModal}>×</button>
							</div>

							<textarea
								className="vmanager-modal__textarea"
								value={importText}
								onChange={(event) => setImportText(event.target.value)}
								lang="vi"
								placeholder={`Tu 1\tDinh nghia 1\nTu 2\tDinh nghia 2\nTu 3\tDinh nghia 3`}
							/>

							<div className="vmanager-modal__options">
								<div className="vmanager-option-group">
									<h3>Giữa thuật ngữ và định nghĩa</h3>
									<label><input type="radio" name="termDelimiter" checked={termDelimiterMode === 'tab'} onChange={() => setTermDelimiterMode('tab')} /> Tab</label>
									<label><input type="radio" name="termDelimiter" checked={termDelimiterMode === 'comma'} onChange={() => setTermDelimiterMode('comma')} /> Phẩy</label>
									<label className="vmanager-option-group__custom"><input type="radio" name="termDelimiter" checked={termDelimiterMode === 'custom'} onChange={() => setTermDelimiterMode('custom')} /> Tùy chỉnh</label>
									{termDelimiterMode === 'custom' && <input value={termCustomDelimiter} onChange={(event) => setTermCustomDelimiter(event.target.value)} placeholder="Ký tự tách" />}
								</div>

								<div className="vmanager-option-group">
									<h3>Giữa các thẻ</h3>
									<label><input type="radio" name="cardDelimiter" checked={cardDelimiterMode === 'newline'} onChange={() => setCardDelimiterMode('newline')} /> Dòng mới</label>
									<label><input type="radio" name="cardDelimiter" checked={cardDelimiterMode === 'semicolon'} onChange={() => setCardDelimiterMode('semicolon')} /> Chấm phẩy</label>
									<label className="vmanager-option-group__custom"><input type="radio" name="cardDelimiter" checked={cardDelimiterMode === 'custom'} onChange={() => setCardDelimiterMode('custom')} /> Tùy chỉnh</label>
									{cardDelimiterMode === 'custom' && <input value={cardCustomDelimiter} onChange={(event) => setCardCustomDelimiter(event.target.value)} placeholder="Ký tự tách" />}
								</div>
							</div>

							<div className="vmanager-modal__preview">
								<h3>Xem trước <span>{importPreview.length} thẻ</span></h3>
								{importPreview.length ? (
									<div className="vmanager-modal__preview-list">
										{importPreview.slice(0, 6).map((item) => (
											<div key={item.id} className="vmanager-modal__preview-item">
												<strong>{item.word}</strong>
												<span>{item.definition || 'Không có định nghĩa đi kèm'}</span>
											</div>
										))}
									</div>
								) : (
									<p>Không có nội dung để xem trước.</p>
								)}
							</div>

							<div className="vmanager-modal__footer">
								<button type="button" className="vmanager-btn vmanager-btn--ghost" onClick={closeImportModal}>Hủy nhập</button>
								<button type="button" className="vmanager-btn" onClick={importPreviewIntoRows}>Nhập</button>
							</div>
						</div>
					</div>
				)}

				<section className="vmanager-library">
					<h2>Từ đã thêm</h2>
					<div className="vmanager-library__list">
						{savedItems.map((item) => {
							const isEditing = editingId === item.id
							return (
								<article key={item.id} className="vmanager-saved-card">
									{isEditing ? (
										<div className="vmanager-saved-edit">
											<input value={editDraft.word} onChange={(event) => setEditDraft((prev) => ({ ...prev, word: event.target.value }))} />
											<input value={editDraft.phonetic} onChange={(event) => setEditDraft((prev) => ({ ...prev, phonetic: event.target.value }))} />
											<input value={editDraft.meaningEn} onChange={(event) => setEditDraft((prev) => ({ ...prev, meaningEn: event.target.value }))} />
											<input value={editDraft.meaningVi} onChange={(event) => setEditDraft((prev) => ({ ...prev, meaningVi: event.target.value }))} />
											<input value={editDraft.example} onChange={(event) => setEditDraft((prev) => ({ ...prev, example: event.target.value }))} />
											<input value={editDraft.exampleVi} onChange={(event) => setEditDraft((prev) => ({ ...prev, exampleVi: event.target.value }))} />
											<input value={editDraft.level} onChange={(event) => setEditDraft((prev) => ({ ...prev, level: event.target.value }))} />
											<div className="vmanager-saved-card__actions">
												<button type="button" className="vmanager-mini-btn" onClick={saveEdit}>Save</button>
												<button type="button" className="vmanager-mini-btn" onClick={cancelEdit}>Hủy</button>
											</div>
										</div>
									) : (
										<>
											<div className="vmanager-saved-card__head">
												<div>
													<h3>{item.word}</h3>
													<p>{item.phonetic}</p>
												</div>
												<span className="vmanager-level-pill">Level {item.level}</span>
											</div>
											<p><strong>EN:</strong> {item.meaningEn}</p>
											<p><strong>VI:</strong> {item.meaningVi}</p>
											<p><strong>Example:</strong> {item.example}</p>
											<p><strong>Dịch ví dụ:</strong> {item.exampleVi}</p>
											<div className="vmanager-saved-card__actions">
												<button type="button" className="vmanager-mini-btn" onClick={() => playWordAudio(item.word)}>Audio</button>
												<button type="button" className="vmanager-mini-btn" onClick={() => startEdit(item)}>Sửa</button>
												<button type="button" className="vmanager-mini-btn is-danger" onClick={() => deleteItem(item.id)}>Xóa</button>
											</div>
										</>
									)}
								</article>
							)
						})}
									{savedItems.length === 0 && <div className="vmanager-empty">Chưa có từ nào được thêm thủ công.</div>}
					</div>
				</section>
			</div>
		</section>
	)
}
