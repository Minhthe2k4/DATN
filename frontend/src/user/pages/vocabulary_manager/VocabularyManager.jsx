import { useMemo, useState, useEffect } from 'react'
import { getUserSession, getAuthHeader } from '../../utils/authSession'
import { usePremiumStatus } from '../../../hooks/usePremiumStatus'
import { toast } from '@/utils/toastUtils'
import './vocabularyManager.css'

import {
	readStorage,
	writeStorage,
	fetchDictionaryProfile,
	playWordAudio,
	createRow,
	createSavedItem,
	parseImportText
} from './vocabUtils'

import { VocabManagerHeader } from './components/VocabManagerHeader'
import { VocabManagerToolbar } from './components/VocabManagerToolbar'
import { VocabManagerRow } from './components/VocabManagerRow'
import { VocabImportModal } from './components/VocabImportModal'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
const STORAGE_KEY = 'dashboard-vocab-bank-v1'

export function VocabularyManager() {
	const session = getUserSession()
	const userId = session?.userId ? Number(session.userId) : null
	const premiumStatus = usePremiumStatus(userId)

	const isLoggedIn = !!session
	const [rows, setRows] = useState(() => [createRow()])
	const [savedItems, setSavedItems] = useState(() => readStorage(STORAGE_KEY))
	const [isSaving, setIsSaving] = useState(false)
	const [isImportModalOpen, setIsImportModalOpen] = useState(false)
	const [importText, setImportText] = useState('')
	const [termDelimiterMode, setTermDelimiterMode] = useState('tab')
	const [termCustomDelimiter, setTermCustomDelimiter] = useState('')
	const [cardDelimiterMode, setCardDelimiterMode] = useState('newline')
	const [cardCustomDelimiter, setCardCustomDelimiter] = useState('')
	const [saveOptions] = useState({ saveToSRS: true })

	const importPreview = useMemo(
		() => parseImportText(importText, termDelimiterMode, termCustomDelimiter, cardDelimiterMode, cardCustomDelimiter),
		[importText, termDelimiterMode, termCustomDelimiter, cardDelimiterMode, cardCustomDelimiter]
	)

	const fetchLearningVocab = async () => {
		if (!isLoggedIn) return
		try {
			const response = await fetch(`${API_BASE_URL}/api/user/learning/all-vocab`, {
				headers: { ...getAuthHeader() }
			})
			if (response.ok) {
				const data = await response.json()
				setSavedItems(data)
			}
		} catch (err) {
			console.warn('Failed to fetch learning vocab:', err)
		}
	}

	useEffect(() => {
		if (isLoggedIn) {
			fetchLearningVocab()
		}
	}, [isLoggedIn, session?.userId])

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
			pronunciation: '',
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
		if (!cleanWord) return null

		updateRow(row.id, { status: 'loading', error: '' })
		try {
			const generated = await fetchDictionaryProfile(cleanWord)
			if (!generated) {
				updateRow(row.id, { status: 'error', error: 'Không tạo được thông tin AI cho từ này.' })
				return null
			}

			updateRow(row.id, {
				pronunciation: row.pronunciation || generated.pronunciation,
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
		if (!row.word.trim() || row.status === 'loading' || row.meaningEn) return
		await generateForRow(row)
	}

	const insertRowAfter = (id) => {
		setRows((prev) => {
			const index = prev.findIndex((row) => row.id === id)
			if (index === -1) return [...prev, createRow()]
			const next = [...prev]
			next.splice(index + 1, 0, createRow())
			return next
		})
	}

	const closeImportModal = () => {
		setIsImportModalOpen(false)
		setImportText('')
	}

	const importPreviewIntoRows = async () => {
		if (!importPreview.length) {
			toast.warning('Không có dữ liệu hợp lệ để nhập.')
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
		toast.info(`Đã đưa ${importedRows.length} từ vào màn hình thêm từ. AI đang hoàn thiện thông tin.`)

		for (const row of importedRows) {
			await generateForRow(row)
		}
	}

	const removeRow = (id) => {
		setRows((prev) => {
			if (prev.length === 1) return [createRow()]
			return prev.filter((row) => row.id !== id)
		})
	}

	const saveAllRows = async () => {
		if (!isLoggedIn) {
			toast.error('Vui lòng đăng nhập để lưu từ vựng.')
			return
		}

		const filledRows = rows.filter((row) => row.word.trim())
		if (!filledRows.length) {
			toast.warning('Không có từ để lưu.')
			return
		}

		setIsSaving(true)
		const generatedRows = []
		for (const row of filledRows) {
			let nextRow = row
			if (!row.meaningEn || !row.pronunciation || !row.meaningVi || !row.level) {
				const generated = await fetchDictionaryProfile(row.word)
				if (generated) {
					nextRow = { ...row, ...generated, status: 'ready' }
					updateRow(row.id, nextRow)
				}
			}
			generatedRows.push(createSavedItem(nextRow))
		}

		try {
			const vocabsToSave = generatedRows.map((item) => ({
				word: item.word,
				pronunciation: item.pronunciation,
				meaningEn: item.meaningEn,
				meaningVi: item.meaningVi,
				example: item.example,
				exampleVi: item.exampleVi,
				level: item.level,
				levelSource: item.levelSource,
			}))

			const response = await fetch(`${API_BASE_URL}/api/user/vocab-custom/save-multiple`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...getAuthHeader()
				},
				body: JSON.stringify({
					vocabularies: vocabsToSave,
					addToSRS: saveOptions.saveToSRS
				}),
			})

			if (response.ok) {
				toast.success(`Đã lưu thành công ${generatedRows.length} từ vựng.`)
				await fetchLearningVocab()
				setRows([createRow()])
			} else {
				const errorText = await response.text()
				toast.error(`Lỗi: ${errorText}`)
			}
		} catch (error) {
			toast.error('Lỗi kết nối khi lưu dữ liệu.')
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<section className="vmanager-page">
			<div className="vmanager-shell">
				<VocabManagerHeader />

				<section className="vmanager-builder">
					<VocabManagerToolbar 
						onOpenImport={() => setIsImportModalOpen(true)}
						onSaveAll={saveAllRows}
						isSaving={isSaving}
					/>

					<div className="vmanager-rows">
						{rows.map((row, index) => (
							<VocabManagerRow 
								key={row.id}
								row={row}
								index={index}
								onUpdateField={updateRowField}
								onUpdateWord={handleWordChange}
								onBlurWord={handleWordBlur}
								onToggleExample={toggleRowExample}
								onRegenerate={generateForRow}
								onRemove={removeRow}
								onInsertAfter={insertRowAfter}
							/>
						))}
					</div>
				</section>

				<VocabImportModal 
					isOpen={isImportModalOpen}
					onClose={closeImportModal}
					importText={importText}
					setImportText={setImportText}
					termDelimiterMode={termDelimiterMode}
					setTermDelimiterMode={setTermDelimiterMode}
					termCustomDelimiter={termCustomDelimiter}
					setTermCustomDelimiter={setTermCustomDelimiter}
					cardDelimiterMode={cardDelimiterMode}
					setCardDelimiterMode={setCardDelimiterMode}
					cardCustomDelimiter={cardCustomDelimiter}
					setCardCustomDelimiter={setCardCustomDelimiter}
					importPreview={importPreview}
					onImport={importPreviewIntoRows}
				/>
			</div>
		</section>
	)
}
