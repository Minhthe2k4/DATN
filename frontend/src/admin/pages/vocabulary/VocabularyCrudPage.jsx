import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { lessons, vocabularyEntries } from '../../data/adminData'
import { AdminPageHeader, AdminSectionCard } from '../../components/console/AdminUi'
import { modal } from '../../../utils/modalUtils'

import { adminFetch } from '../../utils/api'
import { VocabularyForm } from './components/VocabularyForm'
import { DeleteConfirmation } from './components/DeleteConfirmation'
import { VocabularySidebar } from './components/VocabularySidebar'

async function requestGeneratedPronunciation(word) {
  const response = await adminFetch(`/api/admin/vocabulary/pronunciation/generate`, {
    method: 'POST',
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
    type_of_word: row.typeOfWord ?? row.type_of_word ?? '',
    meaning_en: row.meaningEn ?? row.meaning_en ?? '',
    meaning_vi: row.meaningVi ?? row.meaning_vi ?? '',
    example: row.example ?? '',
    example_vi: row.exampleVi ?? row.example_vi ?? '',
    level: row.level ?? 'A1',
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
      type_of_word: '',
      meaning_en: '',
      meaning_vi: '',
      example: '',
      example_vi: '',
      level: 'A1',
      status: 'Chờ duyệt',
      lesson_id: lessons[0]?.id || '',
    }
  }

  return {
    word: row?.word || '',
    pronunciation: row?.pronunciation || '',
    type_of_word: row?.type_of_word || '',
    meaning_en: row?.meaning_en || '',
    meaning_vi: row?.meaning_vi || '',
    example: row?.example || '',
    example_vi: row?.example_vi || '',
    level: row?.level || 'A1',
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
  const [isLoading, setIsLoading] = useState(mode !== 'create')
  const [isGeneratingPronunciation, setIsGeneratingPronunciation] = useState(false)
  const lessonName = useMemo(() => {
    return lessonOptions.find((lesson) => String(lesson.id) === String(form.lesson_id))?.name || ''
  }, [form.lesson_id, lessonOptions])

  useEffect(() => {
    let isDisposed = false

    async function loadData() {
      try {
        const lessonResponse = await adminFetch(`/api/admin/lessons`)
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

        const vocabularyResponse = await adminFetch(`/api/admin/vocabulary/${id}`)
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
        if (!isDisposed) {
          // Success case - do nothing or show success if needed (usually just load data)
        }
    } catch (err) {
        if (!isDisposed) {
          modal.error('Không thể tải dữ liệu từ vựng từ backend.')
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

  const generatePronunciation = async () => {
    const word = form.word.trim()
    if (!word) {
      modal.warning('Nhập từ tiếng Anh trước khi gen phiên âm.')
      return
    }

    try {
      setIsGeneratingPronunciation(true)
      const generated = await requestGeneratedPronunciation(word)
      if (!generated) {
        throw new Error('Empty pronunciation')
      }

      setForm((prev) => ({ ...prev, pronunciation: generated }))
    } catch {
      modal.error('Không thể gen phiên âm lúc này. Vui lòng thử lại.')
    } finally {
      setIsGeneratingPronunciation(false)
    }
  }

  const extractError = async (res, defaultMsg) => {
    try {
      const data = await res.json()
      return data.message || defaultMsg
    } catch {
      return defaultMsg
    }
  }

  const onSubmit = async (force = false) => {
    let payload = {
      word: form.word.trim(),
      pronunciation: form.pronunciation.trim(),
      type_of_word: form.type_of_word,
      meaning_en: form.meaning_en.trim(),
      meaning_vi: form.meaning_vi.trim(),
      example: form.example.trim(),
      example_vi: form.example_vi.trim(),
      level: form.level,
      status: form.status,
      lesson_id: form.lesson_id,
    }

    if (mode !== 'delete') {
      if (!payload.word) { modal.warning('Vui lòng nhập từ tiếng Anh'); return }
      if (!payload.type_of_word) { modal.warning('Vui lòng chọn loại từ'); return }
      if (!payload.meaning_en) { modal.warning('Vui lòng nhập định nghĩa tiếng Anh'); return }
      if (!payload.meaning_vi) { modal.warning('Vui lòng nhập nghĩa tiếng Việt'); return }
      if (!payload.example) { modal.warning('Vui lòng nhập câu ví dụ'); return }
      if (!payload.lesson_id) { modal.warning('Vui lòng chọn bài học'); return }

      if (!payload.pronunciation) {
        try {
          setIsGeneratingPronunciation(true)
          payload = {
            ...payload,
            pronunciation: (await requestGeneratedPronunciation(payload.word)).trim(),
          }
          setForm((prev) => ({ ...prev, pronunciation: payload.pronunciation }))
        } catch {
          modal.error('Không thể tự gen phiên âm cho từ này. Vui lòng thử lại hoặc nhập tay.')
          return
        } finally {
          setIsGeneratingPronunciation(false)
        }
      }

      if (!payload.pronunciation) {
        modal.warning('Không thể tự gen phiên âm cho từ này. Vui lòng nhập tay.')
        return
      }
    }

    try {
      if (mode === 'create') {
        const response = await adminFetch(`/api/admin/vocabulary`, {
          method: 'POST',
          body: JSON.stringify({
            word: payload.word,
            pronunciation: payload.pronunciation,
            typeOfWord: payload.type_of_word,
            meaningEn: payload.meaning_en,
            meaningVi: payload.meaning_vi,
            example: payload.example,
            exampleVi: payload.example_vi,
            level: payload.level,
            status: payload.status,
            lessonId: Number(payload.lesson_id),
          }),
        })
        if (!response.ok) {
          throw new Error(await extractError(response, 'Tạo mới thất bại'))
        }
        modal.success(`Đã thêm từ "${form.word}" thành công.`)
        navigate('/admin/vocabulary')
        return
      }

      if (mode === 'edit') {
        const response = await adminFetch(`/api/admin/vocabulary/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            word: payload.word,
            pronunciation: payload.pronunciation,
            typeOfWord: payload.type_of_word,
            meaningEn: payload.meaning_en,
            meaningVi: payload.meaning_vi,
            example: payload.example,
            exampleVi: payload.example_vi,
            level: payload.level,
            status: payload.status,
            lessonId: Number(payload.lesson_id),
          }),
        })
        if (!response.ok) {
          throw new Error(await extractError(response, 'Cập nhật thất bại'))
        }
        modal.success(`Đã cập nhật từ "${form.word}" thành công.`)
        navigate('/admin/vocabulary')
        return
      }

      const response = await adminFetch(`/api/admin/vocabulary/${id}${force ? '?force=true' : ''}`, {
        method: 'DELETE',
      })
      if (!response.ok && response.status !== 204) {
        throw new Error(await extractError(response, 'Xóa thất bại'))
      }

      modal.success(force ? `Đã xóa vĩnh viễn từ "${currentRow.word}".` : `Đã xóa tạm thời từ "${currentRow.word}".`)
      navigate('/admin/vocabulary')
    } catch (err) {
      modal.error(err.message || 'Thao tác thất bại. Vui lòng kiểm tra backend và thử lại.')
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
            <AdminSectionCard 
              title={title} 
              description={mode === 'delete' ? 'Hành động này không thể hoàn tác.' : 'Điền đầy đủ thông tin từ vựng.'}
            >
              {mode === 'delete' ? (
                <DeleteConfirmation currentRow={currentRow} id={id} onSubmit={onSubmit} />
              ) : (
                <VocabularyForm 
                  form={form} 
                  setField={setField} 
                  onSubmit={onSubmit}
                  generatePronunciation={generatePronunciation}
                  isGeneratingPronunciation={isGeneratingPronunciation}
                  lessonOptions={lessonOptions}
                  mode={mode}
                />
              )}
            </AdminSectionCard>
          </div>

          <div className="col-12 col-lg-4">
            <VocabularySidebar currentRow={currentRow} lessonName={lessonName} />
          </div>
        </div>
      </div>
    </div>
  )
}
