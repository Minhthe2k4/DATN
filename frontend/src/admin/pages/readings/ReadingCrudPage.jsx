import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AdminPageHeader } from '../../components/console/AdminUi'
import { modal } from '../../../utils/modalUtils'
import '../../../user/pages/reading/readingDetail.css'
import './readingCrud.css'

import { adminFetch } from '../../utils/api'
import { 
  saveReading, 
  crawlArticle, 
  deleteReading 
} from './utils/readingUtils'

import { ReadingDeleteForm } from './components/ReadingDeleteForm'
import { ReadingPreview } from './components/ReadingPreview'
import { ReadingEditorForm } from './components/ReadingEditorForm'
import { ReadingSettingsForm } from './components/ReadingSettingsForm'

export function ReadingCrudPage({ mode }) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [topics, setTopics] = useState([])
  const [draft, setDraft] = useState({
    title: '',
    topicId: '',
    difficulty: 'Trung bình',
    content: '',
    articleImage: '',
    wordsHighlighted: 0,
    sourceUrl: '',
    status: 'Chờ biên tập',
  })

  const [isLoading, setIsLoading] = useState(mode !== 'create')
  const [isCrawling, setIsCrawling] = useState(false)
  const [isPreview, setIsPreview] = useState(false)

  useEffect(() => {
    let disposed = false
    async function loadData() {
      try {
        const topicRes = await adminFetch(`/api/admin/reading-topics`)
        if (topicRes.ok) {
          const data = await topicRes.json()
          if (!disposed) setTopics(data)
        }

        if (mode !== 'create' && id) {
          const res = await adminFetch(`/api/admin/readings/${id}`)
          if (res.ok) {
            const data = await res.json()
            if (!disposed) {
              setDraft({
                title: data.title || '',
                topicId: data.topicId ?? data.topic_id ?? (data.topic?.id) ?? '',
                difficulty: data.difficulty || 'Trung bình',
                content: data.content || '',
                articleImage: data.articleImage || '',
                wordsHighlighted: data.wordsHighlighted || 0,
                sourceUrl: data.sourceUrl || '',
                status: data.status || 'Chờ biên tập',
              })
            }
          }
        }
      } catch (err) {
        if (!disposed) modal.error('Không thể tải dữ liệu.')
      } finally {
        if (!disposed) setIsLoading(false)
      }
    }
    loadData()
    return () => { disposed = true }
  }, [id, mode])

  const setField = (field, value) => setDraft(prev => ({ ...prev, [field]: value }))

  const handleCrawl = async () => {
    if (!draft.sourceUrl.trim()) { modal.warning('Vui lòng nhập URL nguồn.'); return }
    setIsCrawling(true)
    try {
      const data = await crawlArticle(draft.sourceUrl)
      setDraft(prev => ({
        ...prev,
        title: data.title || prev.title,
        content: data.content || prev.content,
        articleImage: data.articleImage || prev.articleImage,
        wordsHighlighted: data.wordsHighlighted || prev.wordsHighlighted
      }))
      modal.success('Đã crawl dữ liệu thành công!')
    } catch (err) {
      modal.error(err.message || 'Crawl thất bại')
    } finally {
      setIsCrawling(false)
    }
  }

  const handleSave = async () => {
    if (!draft.title.trim() || !draft.content.trim() || !draft.topicId) { 
      modal.warning('Vui lòng nhập đầy đủ các trường thông tin bắt buộc.')
      return 
    }

    try {
      await saveReading(mode, id, draft)
      modal.success('Lưu bài đọc thành công!')
      navigate('/admin/readings')
    } catch (err) {
      modal.error(err.message || 'Thao tác thất bại.')
    }
  }

  const handleDelete = async (force = false) => {
    try {
      await deleteReading(id, force)
      modal.success(force ? 'Đã xóa vĩnh viễn bài đọc.' : 'Đã xóa tạm thời bài đọc.')
      navigate('/admin/readings')
    } catch (err) {
      modal.error(err.message || 'Thao tác thất bại.')
    }
  }

  if (isLoading) return <div className="p-4">Đang tải...</div>

  const pageTitle = mode === 'create' ? 'Thêm bài đọc mới' : mode === 'edit' ? 'Chỉnh sửa bài đọc' : 'Xóa bài đọc'

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Reading Content"
          title={pageTitle}
          description={mode === 'delete' ? 'Xác nhận thao tác xóa bài đọc.' : 'Biên tập nội dung bài đọc, crawl dữ liệu từ nguồn và đánh dấu từ vựng.'}
          actions={<Link to="/admin/readings" className="btn btn-outline-secondary">Quay lại danh sách</Link>}
        />

        {mode === 'delete' ? (
          <ReadingDeleteForm 
            title={draft.title} 
            id={id} 
            onDelete={handleDelete} 
          />
        ) : (
          <div className="row g-3">
            <div className="col-12 col-xl-8">
              {isPreview ? (
                <ReadingPreview 
                  draft={draft} 
                  topics={topics} 
                  onBackToEdit={() => setIsPreview(false)} 
                />
              ) : (
                <ReadingEditorForm 
                  draft={draft} 
                  setField={setField} 
                />
              )}
            </div>

            <div className="col-12 col-xl-4">
              <ReadingSettingsForm 
                draft={draft}
                setField={setField}
                topics={topics}
                handleCrawl={handleCrawl}
                isCrawling={isCrawling}
                handleSave={handleSave}
                isPreview={isPreview}
                setIsPreview={setIsPreview}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
