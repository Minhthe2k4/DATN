import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AdminPageHeader, AdminSectionCard } from '../../components/console/AdminUi'
import '../../../user/pages/reading/readingDetail.css'
import './readingCrud.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
const DIFFICULTY_OPTIONS = ['Cơ bản', 'Trung bình', 'Nâng cao']
const STATUS_OPTIONS = ['Chờ biên tập', 'Đã xuất bản', 'Nháp']

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
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let disposed = false
    async function loadData() {
      try {
        const topicRes = await fetch(`${API_BASE_URL}/api/admin/reading-topics`)
        if (topicRes.ok) {
          const data = await topicRes.json()
          if (!disposed) setTopics(data)
        }

        if (mode !== 'create' && id) {
          const res = await fetch(`${API_BASE_URL}/api/admin/readings/${id}`)
          if (res.ok) {
            const data = await res.json()
            if (!disposed) {
              setDraft({
                title: data.title || '',
                topicId: data.topicId || '',
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
        if (!disposed) setError('Không thể tải dữ liệu.')
      } finally {
        if (!disposed) setIsLoading(false)
      }
    }
    loadData()
    return () => { disposed = true }
  }, [id, mode])

  const setField = (field, value) => setDraft(prev => ({ ...prev, [field]: value }))

  const handleCrawl = async () => {
    if (!draft.sourceUrl.trim()) { setError('Vui lòng nhập URL nguồn.'); return }
    setIsCrawling(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/readings/crawl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceUrl: draft.sourceUrl.trim() }),
      })
      if (!response.ok) throw new Error('Crawl thất bại')
      const data = await response.json()
      setDraft(prev => ({
        ...prev,
        title: data.title || prev.title,
        content: data.content || prev.content,
        articleImage: data.articleImage || prev.articleImage,
        wordsHighlighted: data.wordsHighlighted || prev.wordsHighlighted
      }))
      setSuccess('Đã crawl dữ liệu thành công!')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsCrawling(false)
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

  const handleSave = async () => {
    if (!draft.title.trim()) { setError('Tiêu đề không được để trống.'); return }
    if (!draft.topicId) { setError('Vui lòng chọn chủ đề.'); return }

    setError('')
    try {
      const url = `${API_BASE_URL}/api/admin/readings${mode === 'edit' ? `/${id}` : ''}`
      const response = await fetch(url, {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          topicId: Number(draft.topicId),
          wordsHighlighted: Number(draft.wordsHighlighted)
        }),
      })
      if (!response.ok) throw new Error(await extractError(response, 'Lưu thất bại'))
      setSuccess('Lưu bài đọc thành công!')
      window.setTimeout(() => navigate('/admin/readings'), 1500)
    } catch (err) {
      setError(err.message || 'Thao tác thất bại.')
    }
  }

  const handleDelete = async (force = false) => {
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/readings/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' })
      if (!response.ok && response.status !== 204) throw new Error(await extractError(response, 'Xóa thất bại'))
      setSuccess(force ? 'Đã xóa vĩnh viễn bài đọc.' : 'Đã xóa tạm thời bài đọc.')
      window.setTimeout(() => navigate('/admin/readings'), 1500)
    } catch (err) {
      setError(err.message || 'Thao tác thất bại.')
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
          <div className="row g-3">
            <div className="col-12">
              <AdminSectionCard title={pageTitle}>
                <div className="alert alert-danger">
                  Bạn đang chuẩn bị xóa bài đọc <strong>{draft.title || id}</strong>.
                  <br /><br />
                  - <strong>Xóa tạm thời:</strong> Bài báo sẽ được chuyển về trạng thái "Nháp" và ẩn khỏi website, nhưng vẫn được lưu lại trong danh sách biên tập.
                  <br />
                  - <strong>Xóa vĩnh viễn:</strong> Toàn bộ dữ liệu của bài báo này sẽ bị gỡ bỏ hoàn toàn khỏi hệ thống.
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-warning" onClick={() => handleDelete(false)}>Xóa tạm thời</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(true)}>Xóa vĩnh viễn</button>
                  <Link to="/admin/readings" className="btn btn-outline-secondary ms-2">Hủy</Link>
                </div>
                {error && <div className="text-danger mt-3">{error}</div>}
                {success && <div className="text-success mt-3">{success}</div>}
              </AdminSectionCard>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            <div className="col-12 col-xl-8">
              <AdminSectionCard title={isPreview ? "Xem trước giao diện người dùng" : "Nội dung bài viết"}>
                {isPreview ? (
                  <div className="reading-detail-page admin-preview-mode">
                    <div className="reading-detail-page__container">
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="m-0 text-primary fw-bold">Xem trước nội dung</h4>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => setIsPreview(false)}>
                          Quay lại chỉnh sửa
                        </button>
                      </div>

                      <header className="reading-detail-hero mb-4">
                        <img
                          src={draft.articleImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80'}
                          alt="Hero"
                          className="reading-detail-hero__image"
                        />
                        <div className="reading-detail-hero__content">
                          <p>{topics.find(t => String(t.id) === String(draft.topicId))?.name || 'Chủ đề'}</p>
                          <h1>{draft.title || 'Tiêu đề bài báo'}</h1>
                          <div className="reading-detail-hero__meta">
                            <span>{draft.difficulty}</span>
                            <span>{draft.wordsHighlighted} từ khóa</span>
                            <span>{Math.max(1, Math.ceil((draft.content?.split(/\s+/)?.length || 0) / 180))} phút đọc</span>
                          </div>
                        </div>
                      </header>

                      <article className="reading-article-body" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div className="reading-article-body__rich">
                          {(() => {
                            const raw = String(draft.content ?? '').trim()
                            if (!raw) return <p className="text-muted">Chưa có nội dung bài viết...</p>

                            const hasHtml = /<\/?[a-z][\s\S]*>/i.test(raw)
                            if (hasHtml) {
                              return <div dangerouslySetInnerHTML={{ __html: raw }} />
                            }

                            return raw.split(/\n{2,}/).map((para, idx) => (
                              <p key={idx} className="mb-3">{para}</p>
                            ))
                          })()}
                        </div>
                      </article>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Tiêu đề bài báo <span className="text-danger">*</span></label>
                      <input className="form-control" value={draft.title} onChange={e => setField('title', e.target.value)} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Nội dung <span className="text-danger">*</span></label>
                      <textarea className="form-control" rows="15" value={draft.content} onChange={e => setField('content', e.target.value)} />
                    </div>
                  </>
                )}
              </AdminSectionCard>
            </div>

            <div className="col-12 col-xl-4">
              <div style={{ position: 'sticky', top: '20px' }}>
                <AdminSectionCard title="Thiết lập & Nguồn">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">URL nguồn (Crawl)</label>
                    <div className="input-group">
                      <input className="form-control" placeholder="https://..." value={draft.sourceUrl} onChange={e => setField('sourceUrl', e.target.value)} />
                      <button className="btn btn-outline-primary" onClick={handleCrawl} disabled={isCrawling}>
                        {isCrawling ? '...' : 'Crawl'}
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Chủ đề <span className="text-danger">*</span></label>
                    <select className="form-select" value={draft.topicId} onChange={e => setField('topicId', e.target.value)}>
                      <option value="">Chọn chủ đề</option>
                      {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Độ khó</label>
                    <select className="form-select" value={draft.difficulty} onChange={e => setField('difficulty', e.target.value)}>
                      {DIFFICULTY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Ảnh bìa (URL)</label>
                    <input className="form-control" value={draft.articleImage} onChange={e => setField('articleImage', e.target.value)} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Số từ nổi bật</label>
                    <input type="number" className="form-control" value={draft.wordsHighlighted} onChange={e => setField('wordsHighlighted', e.target.value)} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Trạng thái</label>
                    <select className="form-select" value={draft.status} onChange={e => setField('status', e.target.value)}>
                      {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div className="d-grid gap-2 mt-4">
                    <button className="btn btn-primary" onClick={handleSave}>Lưu bài viết</button>
                    <button className="btn btn-outline-primary" onClick={() => setIsPreview(!isPreview)}>
                      {isPreview ? 'Sửa nội dung' : 'Xem trước'}
                    </button>
                  </div>

                  {error && <div className="alert alert-danger mt-3">{error}</div>}
                  {success && <div className="alert alert-success mt-3">{success}</div>}
                </AdminSectionCard>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
