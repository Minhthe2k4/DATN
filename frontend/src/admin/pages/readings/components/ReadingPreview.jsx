import React from 'react'
import { AdminSectionCard } from '../../../components/console/AdminUi'

export function ReadingPreview({ draft, topics, onBackToEdit }) {
  const currentTopic = topics.find(t => String(t.id) === String(draft.topicId))?.name || 'Chủ đề'
  const readingTime = Math.max(1, Math.ceil((draft.content?.split(/\s+/)?.length || 0) / 180))

  return (
    <AdminSectionCard title="Xem trước giao diện người dùng">
      <div className="reading-detail-page admin-preview-mode">
        <div className="reading-detail-page__container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="m-0 text-primary fw-bold">Xem trước nội dung</h4>
            <button className="btn btn-sm btn-outline-secondary" onClick={onBackToEdit}>
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
              <p>{currentTopic}</p>
              <h1>{draft.title || 'Tiêu đề bài báo'}</h1>
              <div className="reading-detail-hero__meta">
                <span>{draft.difficulty}</span>
                <span>{draft.wordsHighlighted} từ khóa</span>
                <span>{readingTime} phút đọc</span>
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
    </AdminSectionCard>
  )
}
