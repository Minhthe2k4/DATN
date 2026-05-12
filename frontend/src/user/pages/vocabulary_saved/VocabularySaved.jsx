import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserSession, getAuthHeader } from '../../utils/authSession'
import { usePremiumStatus } from '../../../hooks/usePremiumStatus'
import './vocabularySaved.css'

import {
	readSavedVocabulary,
	writeSavedVocabulary,
	normalizeLevel
} from './vocabSavedUtils'

import { VocabSavedHeader } from './components/VocabSavedHeader'
import { VocabSavedToolbar } from './components/VocabSavedToolbar'
import { VocabLevelColumn } from './components/VocabLevelColumn'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

/**
 * Component quản lý Sổ tay từ vựng cá nhân (Personal Dictionary).
 * Chức năng:
 * 1. Hiển thị danh sách từ vựng đã lưu, phân loại theo 6 cấp độ thuộc lòng.
 * 2. Tìm kiếm, lọc từ vựng theo bài học hoặc từ vựng tự thêm.
 * 3. Đồng bộ từ vựng từ LocalStorage lên Cloud (Backend).
 * 4. Chỉnh sửa thông tin từ vựng cá nhân.
 */
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
	const [filterLesson, setFilterLesson] = useState('all')

	// Logic lọc danh sách từ vựng dựa trên từ khóa tìm kiếm và bài học
	const filteredItems = useMemo(() => {
		let result = items
		const q = searchTerm.trim().toLowerCase()

		// Tìm kiếm đa trường: từ, phiên âm, nghĩa Anh/Việt, ví dụ
		if (q) {
			result = result.filter((item) => {
				const text = [item.word, item.pronunciation, item.meaningEn, item.meaningVi, item.example]
					.filter(Boolean)
					.join(' ')
					.toLowerCase()
				return text.includes(q)
			})
		}

		// Lọc theo bài học cụ thể hoặc chỉ từ vựng tự thêm (custom)
		if (filterLesson !== 'all') {
			result = result.filter(item => {
				if (filterLesson === 'custom') return item.isCustom || !item.lessonId
				return String(item.lessonId) === filterLesson
			})
		}

		return result
	}, [items, searchTerm, filterLesson])

	const availableLessons = useMemo(() => {
		const lessonMap = new Map()
		items.forEach(item => {
			if (item.lessonId && item.lessonName) {
				lessonMap.set(String(item.lessonId), item.lessonName)
			}
		})
		return Array.from(lessonMap.entries()).map(([id, name]) => ({ id, name }))
	}, [items])

	const fetchLearningVocab = async () => {
		if (!isLoggedIn) return
		setIsLoading(true)
		try {
			const response = await fetch(`${API_BASE_URL}/api/user/learning/all-vocab`, {
				headers: { ...getAuthHeader() }
			})
			if (response.ok) {
				const data = await response.json()
				const cloudItems = data.map(it => ({
					...it,
					level: it.masteryLevel || 1,
					isCloud: true
				}))
				setItems(cloudItems)
				writeSavedVocabulary(cloudItems)
			}
		} catch (err) {
			console.warn('VocabularySaved fetch error:', err)
		} finally {
			setIsLoading(false)
		}
	}

	// LUỒNG ĐỒNG BỘ: Đẩy từ vựng lưu tạm ở LocalStorage lên Database sau khi đăng nhập
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
				level: 'A1'
			}))

			// Gửi yêu cầu lưu hàng loạt (Batch save) và khởi tạo SRS cho các từ này
			const response = await fetch(`${API_BASE_URL}/api/user/learning/complete-lesson/custom`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...getAuthHeader()
				},
				body: JSON.stringify({
					vocabularies: vocabsToSave,
					addToSRS: true
				}),
			})

			if (response.ok) {
				alert(`Đã đồng bộ thành công ${localItems.length} từ vào hệ thống!`)
				fetchLearningVocab()
			}
		} catch (err) {
			console.error('Sync failed:', err)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		if (isLoggedIn) {
			fetchLearningVocab()
		}
	}, [isLoggedIn, session?.userId])

	// Phân nhóm từ vựng theo 6 cấp độ thuộc lòng để hiển thị thành các cột
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
		setDraft({ ...item, level: normalizeLevel(item.level) })
	}

	const cancelEdit = () => {
		setEditingId(null)
		setDraft(null)
	}

	const saveEdit = async () => {
		if (!draft?.word?.trim()) return

		const itemToEdit = items.find(item => item.id === editingId)
		if (!itemToEdit) return

		try {
			setIsLoading(true)
			if (itemToEdit.isCustom) {
				const response = await fetch(`${API_BASE_URL}/api/user/vocab-custom/${itemToEdit.vocabId}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						...getAuthHeader()
					},
					body: JSON.stringify({
						word: draft.word.trim(),
						pronunciation: draft.pronunciation?.trim() || '',
						meaningVi: draft.meaningVi?.trim() || '',
						meaningEn: draft.meaningEn?.trim() || '',
						example: draft.example?.trim() || '',
						level: normalizeLevel(draft.level)
					})
				})
				if (!response.ok) throw new Error('Update failed')
			} else {
				alert('Từ vựng hệ thống hiện chưa hỗ trợ chỉnh sửa cá nhân.')
				cancelEdit()
				return
			}

			const nextItems = items.map((item) => (item.id === editingId ? { ...item, ...draft } : item))
			setItems(nextItems)
			writeSavedVocabulary(nextItems)
			cancelEdit()
		} catch (err) {
			console.error('Save error:', err)
			alert('Không thể lưu thay đổi.')
		} finally {
			setIsLoading(false)
		}
	}

	const removeWord = (id) => {
		const nextItems = items.filter((item) => item.id !== id)
		setItems(nextItems)
		writeSavedVocabulary(nextItems)
		if (editingId === id) cancelEdit()
	}

	return (
		<section className="saved-vocab-page">
			<div className="saved-vocab-page__container">
				<VocabSavedHeader
					onSync={syncLocalToCloud}
					onRefresh={fetchLearningVocab}
					onBack={() => navigate('/vocabulary')}
					isLoading={isLoading}
				/>

				<VocabSavedToolbar
					searchTerm={searchTerm}
					setSearchTerm={setSearchTerm}
					filterLesson={filterLesson}
					setFilterLesson={setFilterLesson}
					availableLessons={availableLessons}
					resultsCount={filteredItems.length}
				/>

				<div className="saved-vocab-grid">
					{Array.from({ length: 6 }, (_, index) => {
						const level = index + 1
						return (
							<VocabLevelColumn
								key={level}
								level={level}
								words={groupedByLevel.get(level) ?? []}
								editingId={editingId}
								draft={draft}
								setDraft={setDraft}
								onStartEdit={startEdit}
								onCancelEdit={cancelEdit}
								onSave={saveEdit}
								onRemove={removeWord}
							/>
						)
					})}
				</div>
			</div>
		</section>
	)
}

