import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePremiumStatus } from '@/hooks/usePremiumStatus'
import { getUserSession, getAuthHeader } from '@/user/utils/authSession'
import { toast } from '@/utils/toastUtils'
import { DictionarySearch } from './components/DictionarySearch'
import { DictionaryResult } from './components/DictionaryResult'
import { SaveVocabModal } from './components/SaveVocabModal'
import './dictionary.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

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
	const navigate = useNavigate()
	const session = getUserSession()
	const premiumStatus = usePremiumStatus(session?.userId)
	
	const [showSaveModal, setShowSaveModal] = useState(false)
	const [saveFormData, setSaveFormData] = useState({
		word: '',
		pronunciation: '',
		definitionEng: '',
		definitionVi: '',
		exampleEng: '',
		exampleVi: '',
	})

	const hasResult = searchedWord.trim().length > 0

	const resultEntry = useMemo(() => {
		if (!hasResult) return null
		return apiResult || null
	}, [hasResult, apiResult])

	const fetchWordLookup = async (w) => {
		if (!w || !w.trim()) return
		setLoading(true)
		setApiResult(null)
		setSearchText(w.trim())

		try {
			const response = await fetch(`${API_BASE_URL}/api/dictionary/lookup`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					word: w.trim(),
					contextSentence: '',
				}),
			})

			if (!response.ok) throw new Error(`HTTP ${response.status}`)

			const data = await response.json()
			if (data.error) {
				toast.error(data.error || 'Không tìm thấy từ này')
				setSearchedWord(w.trim())
				return
			}

			setSearchedWord(w.trim())
			if (data && data.meanings && data.meanings.length > 0) {
				const transformedEntry = {
					word: data.word || w.trim(),
					typeOfWord: data.meanings[0]?.typeOfWord || 'noun',
					uk: data.phonetic || '',
					us: data.phonetic || '',
					ukAudio: data.ukAudio || '',
					usAudio: data.usAudio || '',
					meanings: data.meanings.map((m, idx) => ({
						id: idx + 1,
						level: m.level || '',
						typeOfWord: m.typeOfWord || 'noun',
						definition: m.definition || '',
						example: m.example || '',
						examples: m.examples || [],
						meaningVi: m.meaningVi || '',
					})),
				}
				setApiResult(transformedEntry)
			} else {
				toast.info('Không tìm thấy định nghĩa cho từ này')
				setApiResult(null)
			}
		} catch (err) {
			toast.error('Lỗi khi tra từ điển')
			setSearchedWord(w.trim())
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		const wordParam = params.get('word')
		if (wordParam && wordParam.trim()) {
			fetchWordLookup(wordParam.trim())
		}
	}, [])

	const onSubmitSearch = async (event) => {
		if (event) event.preventDefault()
		if (!searchText.trim()) {
			toast.warning('Vui lòng nhập từ khóa')
			return
		}
		await fetchWordLookup(searchText)
	}

	const handleOpenSaveModal = (meaning) => {
		if (resultEntry) {
			setSaveFormData({
				word: resultEntry.word,
				pronunciation: resultEntry.uk,
				definitionEng: meaning.definition || '',
				definitionVi: meaning.meaningVi || '',
				exampleEng: meaning.examples[0] || meaning.example || '',
				exampleVi: '',
			})
			setShowSaveModal(true)
		}
	}

	const handleSaveFormChange = (field, value) => {
		setSaveFormData(prev => ({ ...prev, [field]: value }))
	}

	const playAudio = (url, wordToSpeak = '') => {
		if (url && url.startsWith('http')) {
			const audio = new Audio(url)
			audio.play().catch(() => {
				if (wordToSpeak && 'speechSynthesis' in window) {
					window.speechSynthesis.cancel()
					const utterance = new window.SpeechSynthesisUtterance(wordToSpeak)
					utterance.lang = 'en-US'
					window.speechSynthesis.speak(utterance)
				}
			})
		} else if (wordToSpeak && 'speechSynthesis' in window) {
			window.speechSynthesis.cancel()
			const utterance = new window.SpeechSynthesisUtterance(wordToSpeak)
			utterance.lang = 'en-US'
			window.speechSynthesis.speak(utterance)
		}
	}

	const handleSaveWord = async () => {
		if (!saveFormData.word || !saveFormData.definitionEng || !saveFormData.definitionVi) {
			toast.warning('Vui lòng nhập đầy đủ các trường')
			return
		}

		setLoading(true)
		try {
			const authToken = localStorage.getItem('token') || session?.userId;
			const vocabResponse = await fetch(`${API_BASE_URL}/api/user/vocab-custom/save`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...getAuthHeader()
				},
				body: JSON.stringify({ ...saveFormData, meaningEn: saveFormData.definitionEng, meaningVi: saveFormData.definitionVi, example: saveFormData.exampleEng, addToSRS: true }),
			})

			if (!vocabResponse.ok) {
				const errorMsg = await vocabResponse.text()
				if (errorMsg !== 'Từ đã được lưu') throw new Error(errorMsg || 'Failed to save word')
			}

			toast.success('Lưu vào lộ trình ôn tập Thời điểm vàng thành công')
			setShowSaveModal(false)
		} catch (err) {
			toast.error('Lỗi khi lưu từ vựng: ' + err.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<section className="dictionary-page">
			<div className="dictionary-page__container">
				<DictionarySearch 
					value={searchText}
					onChange={setSearchText}
					onSearch={onSubmitSearch}
					loading={loading}
				/>

				{!hasResult ? (
					<div className="dictionary-empty">
						<EmptyIcon />
						<p>Vui lòng nhập từ khóa để tra từ điển.</p>
					</div>
				) : (
					<DictionaryResult 
						result={resultEntry}
						onPlayAudio={playAudio}
						onSaveMeaning={handleOpenSaveModal}
					/>
				)}

				{showSaveModal && (
					<SaveVocabModal 
						formData={saveFormData}
						onFormChange={handleSaveFormChange}
						onClose={() => setShowSaveModal(false)}
						onSave={handleSaveWord}
						loading={loading}
					/>
				)}
			</div>
		</section>
	)
}
