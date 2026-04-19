import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { lessons, vocabularyEntries } from '../../data/adminData'
import { AdminPageHeader, AdminSectionCard } from '../../components/console/AdminUi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
const PART_OF_SPEECH = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'article', 'pronoun']
const LEVELS = ['Cơ bản', 'Trung bình', 'Nâng cao']
const STATUSES = ['Đã duyệt', 'Chờ duyệt']

async function requestGeneratedPronunciation(word) {
  const response = await fetch(`${API_BASE_URL}/api/admin/vocabulary/pronunciation/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word }),
  })

  if (!response.ok) {
    throw new Error(`Generate pronunciation failed: ${response.status}`)
  }

  const payload = await response.json()
  return payload?.pronunciation || ''
}

function normalizeStatus(status) {
  if (status === 'Chờ rà soát' || status === 'Nháp') {
    return 'Chờ duyệt'
  }
  return status || 'Đã duyệt'
}

function normalizeLessonRow(row) {
  return {
    id: row.id,
    name: row.name ?? '',
    topic_id: row.topicId ?? row.topic_id ?? '',
  }
}

function normalizeVocabularyRow(row) {
  return {
    id: row.id,
    word: row.word ?? '',
    pronunciation: row.pronunciation ?? '',
    part_of_speech: row.partOfSpeech ?? row.part_of_speech ?? '',
    meaning_en: row.meaningEn ?? row.meaning_en ?? '',
    meaning_vi: row.meaningVi ?? row.meaning_vi ?? '',
    example: row.example ?? '',
    level: row.level ?? 'Trung bình',
    status: normalizeStatus(row.status),
    lesson_id: row.lessonId ?? row.lesson_id ?? '',
    topic_id: row.topicId ?? row.topic_id ?? '',
  }
}

function getInitialForm(row, mode) {
  if (mode === 'create') {
    return {
      word: '',
      pronunciation: '',
      part_of_speech: '',
      meaning_en: '',
      meaning_vi: '',
      example: '',
      level: 'Trung bình',
      status: 'Chờ duyệt',
      lesson_id: lessons[0]?.id || '',
    }
  }

  return {
    word: row?.word || '',
    pronunciation: row?.pronunciation || '',
    part_of_speech: row?.part_of_speech || '',
    meaning_en: row?.meaning_en || '',
    meaning_vi: row?.meaning_vi || '',
    example: row?.example || '',
    level: row?.level || 'Trung bình',
    status: normalizeStatus(row?.status),
    lesson_id: row?.lesson_id || '',
  }
}

export function VocabularyCrudPage({ mode }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lessonOptions, setLessonOptions] = useState(lessons)
  const [currentRow, setCurrentRow] = useState(() => {
    if (mode === 'create') {
      return null
    }
    return vocabularyEntries.find((item) => String(item.id) === String(id)) || null
  })
  const [form, setForm] = useState(() => getInitialForm(currentRow, mode))
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(mode !== 'create')
  const [isGeneratingPronunciation, setIsGeneratingPronunciation] = useState(false)

  useEffect(() => {
    let isDisposed = false

    async function loadData() {
      try {
        const lessonResponse = await fetch(`${API_BASE_URL}/api/admin/lessons`)
        if (lessonResponse.ok) {
          const lessonPayload = await lessonResponse.json()
          if (!isDisposed && Array.isArray(lessonPayload)) {
            const normalizedLessons = lessonPayload.map(normalizeLessonRow)
            setLessonOptions(normalizedLessons)
            if (mode === 'create') {
              setForm((prev) => ({ ...prev, lesson_id: prev.lesson_id || normalizedLessons[0]?.id || '' }))
            }
          }
        }

        if (mode === 'create') {
          return
        }

        const vocabularyResponse = await fetch(`${API_BASE_URL}/api/admin/vocabulary/${id}`)
        if (!vocabularyResponse.ok) {
          throw new Error(`Cannot fetch vocabulary: ${vocabularyResponse.status}`)
        }

        const vocabularyPayload = await vocabularyResponse.json()
        if (isDisposed) {
          return
        }

        const normalizedVocabulary = normalizeVocabularyRow(vocabularyPayload)
        setCurrentRow(normalizedVocabulary)
        setForm(getInitialForm(normalizedVocabulary, mode))
        setError('')
      } catch {
        if (!isDisposed) {
          setError('Không thể tải dữ liệu từ vựng từ backend.')
        }
      } finally {
        if (!isDisposed) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isDisposed = true
    }
  }, [id, mode])

  if (mode !== 'create' && !currentRow && !isLoading) {
    return (
      <div className="page-content">
        <div className="container-fluid">
          <AdminSectionCard title="Không tìm thấy từ vựng" description={`ID ${id} không có trong dữ liệu.`}>
            <Link to="/admin/vocabulary" className="btn btn-primary">Quay lại danh sách</Link>
          </AdminSectionCard>
        </div>
      </div>
    )
  }

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const lessonName = useMemo(() => {
    return lessonOptions.find((lesson) => String(lesson.id) === String(form.lesson_id))?.name || ''
  }, [form.lesson_id, lessonOptions])

  const generatePronunciation = async () => {
    const word = form.word.trim()
    if (!word) {
      setError('Nhập từ tiếng Anh trước khi gen phiên âm.')
      return
    }

    try {
      setIsGeneratingPronunciation(true)
      const generated = await requestGeneratedPronunciation(word)
      if (!generated) {
        throw new Error('Empty pronunciation')
      }

      setForm((prev) => ({ ...prev, pronunciation: generated }))
      setError('')
    } catch {
      setError('Không thể gen phiên âm lúc này. Vui lòng thử lại.')
    } finally {
      setIsGeneratingPronunciation(false)
    }
  }

  const onSubmit = async () => {
    let payload = {
      word: form.word.trim(),
      pronunciation: form.pronunciation.trim(),
      part_of_speech: form.part_of_speech,
      meaning_en: form.meaning_en.trim(),
      meaning_vi: form.meaning_vi.trim(),
      example: form.example.trim(),
      level: form.level,
      status: form.status,
      lesson_id: form.lesson_id,
    }

    if (mode !== 'delete') {
      if (!payload.word) { setError('Vui lòng nhập từ tiếng Anh'); return }
      if (!payload.part_of_speech) { setError('Vui lòng chọn loại từ'); return }
      if (!payload.meaning_en) { setError('Vui lòng nhập định nghĩa tiếng Anh'); return }
      if (!payload.meaning_vi) { setError('Vui lòng nhập nghĩa tiếng Việt'); return }
      if (!payload.example) { setError('Vui lòng nhập câu ví dụ'); return }
      if (!payload.lesson_id) { setError('Vui lòng chọn bài học'); return }

      if (!payload.pronunciation) {
        try {
          setIsGeneratingPronunciation(true)
          payload = {
            ...payload,
            pronunciation: (await requestGeneratedPronunciation(payload.word)).trim(),
          }
          setForm((prev) => ({ ...prev, pronunciation: payload.pronunciation }))
        } catch {
          setError('Không thể tự gen phiên âm cho từ này. Vui lòng thử lại hoặc nhập tay.')
          return
        } finally {
          setIsGeneratingPronunciation(false)
        }
      }

      if (!payload.pronunciation) {
        setError('Không thể tự gen phiên âm cho từ này. Vui lòng nhập tay.')
        return
      }
    }

    try {
      if (mode === 'create') {
        const response = await fetch(`${API_BASE_URL}/api/admin/vocabulary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            word: payload.word,
            pronunciation: payload.pronunciation,
            partOfSpeech: payload.part_of_speech,
            meaningEn: payload.meaning_en,
            meaningVi: payload.meaning_vi,
            example: payload.example,
            level: payload.level,
            status: payload.status,
            lessonId: Number(payload.lesson_id),
          }),
        })
        if (!response.ok) {
          throw new Error(`Create vocabulary failed: ${response.status}`)
        }
        setError('')
        setSuccess(`Đã thêm từ "${form.word}" thành công.`)
        return
      }

      if (mode === 'edit') {
        const response = await fetch(`${API_BASE_URL}/api/admin/vocabulary/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            word: payload.word,
            pronunciation: payload.pronunciation,
            partOfSpeech: payload.part_of_speech,
            meaningEn: payload.meaning_en,
            meaningVi: payload.meaning_vi,
            example: payload.example,
            level: payload.level,
            status: payload.status,
            lessonId: Number(payload.lesson_id),
          }),
        })
        if (!response.ok) {
          throw new Error(`Update vocabulary failed: ${response.status}`)
        }
        setError('')
        setSuccess(`Đã cập nhật từ "${form.word}" thành công.`)
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/vocabulary/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok && response.status !== 204) {
        throw new Error(`Delete vocabulary failed: ${response.status}`)
      }

      setError('')
      setSuccess(`Đã xóa từ "${currentRow.word}" thành công.`)
      window.setTimeout(() => navigate('/admin/vocabulary'), 600)
    } catch {
      setSuccess('')
      setError('Thao tác thất bại. Vui lòng kiểm tra backend và thử lại.')
    }
  }

  const title = mode === 'create' ? 'Thêm từ vựng' : mode === 'edit' ? 'Sửa từ vựng' : 'Xóa từ vựng'

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Vocabulary Manager"
          title={title}
          description={mode === 'delete' ? 'Xác nhận xóa từ vựng.' : 'Quản lý từ vựng theo quy chuẩn database và schema.'}
          actions={<Link to="/admin/vocabulary" className="btn btn-outline-secondary">Quay lại danh sách</Link>}
        />

        {isLoading ? <div className="alert alert-light border">Đang tải dữ liệu từ vựng...</div> : null}

        <div className="row g-3">
          <div className="col-12 col-lg-8">
            <AdminSectionCard title={title} description={mode === 'delete' ? 'Hành động này không thể hoàn tác.' : 'Điền đầy đủ thông tin từ vựng.'}>
              {mode === 'delete' ? (
                <div>
                  <div className="alert alert-danger" role="alert">
                    Bạn chuẩn bị xóa từ vựng <strong>{currentRow?.word}</strong> (ID: {id}). Này không thể hoàn tác.
                  </div>
                  <button type="button" className="btn btn-danger me-2" onClick={onSubmit}>Xác nhận xóa</button>
                  <Link to="/admin/vocabulary" className="btn btn-outline-secondary">Hủy</Link>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); onSubmit() }}>
                  {/* Main Info */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Từ tiếng Anh <span className="text-danger">*</span></label>
                    <input className="form-control" value={form.word} onChange={(e) => setField('word', e.target.value)} placeholder="resilient" />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Phiên âm <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <input className="form-control" value={form.pronunciation} onChange={(e) => setField('pronunciation', e.target.value)} placeholder="/rɪˈzɪliənt/" />
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={generatePronunciation}
                          disabled={isGeneratingPronunciation}
                        >
                          {isGeneratingPronunciation ? 'Đang gen...' : 'AI gen'}
                        </button>
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Loại từ <span className="text-danger">*</span></label>
                      <select className="form-select" value={form.part_of_speech} onChange={(e) => setField('part_of_speech', e.target.value)}>
                        <option value="">— Chọn —</option>
                        {PART_OF_SPEECH.map((pos) => <option key={pos} value={pos}>{pos}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Definitions */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Định nghĩa tiếng Anh <span className="text-danger">*</span></label>
                    <textarea className="form-control" rows="2" value={form.meaning_en} onChange={(e) => setField('meaning_en', e.target.value)} placeholder="Able to recover quickly from difficulties."></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Nghĩa tiếng Việt <span className="text-danger">*</span></label>
                    <textarea className="form-control" rows="2" value={form.meaning_vi} onChange={(e) => setField('meaning_vi', e.target.value)} placeholder="Kiên cường, bền bỉ, dẻo dai"></textarea>
                  </div>

                  {/* Example */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Câu ví dụ <span className="text-danger">*</span></label>
                    <textarea className="form-control" rows="2" value={form.example} onChange={(e) => setField('example', e.target.value)} placeholder="The startup remained resilient during the downturn."></textarea>
                  </div>

                  {/* Classification */}
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Bài học <span className="text-danger">*</span></label>
                      <select className="form-select" value={form.lesson_id} onChange={(e) => setField('lesson_id', e.target.value)}>
                        <option value="">— Chọn bài học —</option>
                        {lessonOptions.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.name}</option>)}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Độ khó</label>
                      <select className="form-select" value={form.level} onChange={(e) => setField('level', e.target.value)}>
                        {LEVELS.map((lv) => <option key={lv} value={lv}>{lv}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Trạng thái duyệt</label>
                    <select className="form-select" value={form.status} onChange={(e) => setField('status', e.target.value)}>
                      {STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </div>

                  <div className="d-flex gap-2 mt-4">
                    <button type="submit" className="btn btn-primary">{mode === 'create' ? 'Thêm từ vựng' : 'Lưu thay đổi'}</button>
                    <Link to="/admin/vocabulary" className="btn btn-outline-secondary">Hủy</Link>
                  </div>
                </form>
              )}

              {error && <div className="alert alert-danger mt-3">{error}</div>}
              {success && <div className="alert alert-success mt-3">{success}</div>}
            </AdminSectionCard>
          </div>

          {/* Right Sidebar */}
          <div className="col-12 col-lg-4">
            <AdminSectionCard title="Hướng dẫn" description="Quy chuẩn nhập liệu">
              <ul className="mb-0 ps-3 d-grid gap-1 small">
                <li><strong>Từ:</strong> chữ thường (lowercase)</li>
                <li><strong>Phiên âm:</strong> ký hiệu IPA /.../ </li>
                <li><strong>Loại từ:</strong> noun, verb, adj...</li>
                <li><strong>Định nghĩa:</strong> ngắn, dễ hiểu</li>
                <li><strong>Ví dụ:</strong> câu hoàn chỉnh</li>
                <li><strong>Trạng thái:</strong> Nháp → Chờ → Duyệt</li>
              </ul>
            </AdminSectionCard>

            {currentRow && (
              <AdminSectionCard title="Thông tin hiện tại" className="mt-3">
                <div className="d-grid gap-2 small">
                  <div>
                    <strong>ID:</strong>
                    <br />
                    <code>{currentRow.id}</code>
                  </div>
                  <div>
                    <strong>Bài học:</strong>
                    <br />
                    <span>{lessonName || currentRow.lesson_id || currentRow.topic_id}</span>
                  </div>
                  <div>
                    <strong>Trạng thái:</strong>
                    <br />
                    <span className="badge bg-info">{currentRow.status}</span>
                  </div>
                </div>
              </AdminSectionCard>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
