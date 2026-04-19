import { useEffect, useState } from 'react'
import './support.css'
import { fetchFAQ, fetchSupportTopics, submitSupportTicket } from '@/lib/api/support-api'

// Default fallback topics in case API fails
const DEFAULT_TOPICS = [
  'Tài khoản & đăng nhập',
  'Thanh toán & Premium',
  'Nội dung học tập',
  'Tính năng ứng dụng',
  'Báo lỗi ứng dụng',
  'Khác',
]

// Default fallback FAQ in case API fails
const DEFAULT_FAQ = [
  {
    question: 'Tôi quên mật khẩu, phải làm gì?',
    answer:
      'Vào trang Đăng nhập, nhấn "Quên mật khẩu?" rồi nhập email đã đăng ký. Hệ thống sẽ gửi link đặt lại mật khẩu trong vòng vài phút. Kiểm tra cả hộp thư Spam nếu không thấy.',
  },
  {
    question: 'Tôi đã thanh toán Premium nhưng tài khoản chưa được nâng cấp?',
    answer:
      'Sau khi thanh toán thành công, tài khoản thường được nâng cấp ngay lập tức. Nếu sau 15 phút vẫn chưa thấy thay đổi, hãy thử đăng xuất và đăng nhập lại. Nếu vẫn không được, gửi yêu cầu hỗ trợ kèm ảnh chụp biên lai thanh toán.',
  },
  {
    question: 'Làm sao để xóa tài khoản?',
    answer:
      'Vào Cài đặt → Tài khoản → Xóa tài khoản. Lưu ý dữ liệu học tập sẽ bị xóa vĩnh viễn và không thể khôi phục. Nếu bạn đang có gói Premium, hãy liên hệ hỗ trợ trước để được tư vấn.',
  },
  {
    question: 'Tính năng Spaced Repetition hoạt động như thế nào?',
    answer:
      'Hệ thống theo dõi các từ bạn đã học và nhắc lại đúng lúc bạn sắp quên — dựa trên thuật toán ghi nhớ khoa học SM-2. Từ nào trả lời đúng sẽ được nhắc lại muộn hơn, sai sẽ được ôn sớm hơn.',
  },
  {
    question: 'Tôi có thể học ngoại tuyến không?',
    answer:
      'Tính năng học ngoại tuyến chỉ dành cho tài khoản Premium. Sau khi tải nội dung về, bạn có thể luyện từ vựng và xem lại bài đọc mà không cần kết nối internet.',
  },
  {
    question: 'Tại sao video không phát được?',
    answer:
      'Video được nhúng từ YouTube nên cần kết nối internet ổn định. Nếu video không tải được, hãy kiểm tra kết nối mạng, thử tải lại trang, hoặc mở trực tiếp trên trình duyệt.',
  },
]

function ChevronIcon() {
  return (
    <svg className="support-faq__chevron" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ width: 22, height: 22 }}>
      <path d="M5 10.5l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FaqItem({ item }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className={`support-faq__item${isOpen ? ' is-open' : ''}`}>
      <button
        type="button"
        className="support-faq__question"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        {item.question}
        <ChevronIcon />
      </button>
      {isOpen ? <div className="support-faq__answer">{item.answer}</div> : null}
    </div>
  )
}

function emptyForm() {
  return { name: '', email: '', topic: '', message: '' }
}

export function Support() {
  const [form, setForm] = useState(emptyForm())
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [ticketId, setTicketId] = useState(null)
  const [faqItems, setFaqItems] = useState(DEFAULT_FAQ)
  const [topicOptions, setTopicOptions] = useState(DEFAULT_TOPICS)
  const [faqLoading, setFaqLoading] = useState(true)

  // Load FAQ and topics from API on mount
  useEffect(() => {
    const loadData = async () => {
      setFaqLoading(true)
      try {
        const [faq, topics] = await Promise.all([
          fetchFAQ(),
          fetchSupportTopics(),
        ])
        if (faq.length > 0) setFaqItems(faq)
        if (topics.length > 0) setTopicOptions(topics)
      } catch (error) {
        console.warn('Failed to load FAQ and topics:', error)
      } finally {
        setFaqLoading(false)
      }
    }

    loadData()
  }, [])

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const next = {}
    if (!form.topic) next.topic = 'Vui lòng chọn chủ đề.'
    if (!form.message.trim()) next.message = 'Vui lòng mô tả vấn đề của bạn.'
    else if (form.message.trim().length < 20) next.message = 'Mô tả cần ít nhất 20 ký tự để chúng tôi hiểu rõ vấn đề.'
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setLoading(true)
    setServerError('')

    try {
      const result = await submitSupportTicket({
        topic: form.topic,
        message: form.message,
      })
      setTicketId(result.id)
      setSubmitted(true)
    } catch (error) {
      setServerError(error.message || 'Lỗi kết nối với máy chủ. Vui lòng kiểm tra kết nối mạng.')
      console.error('Support ticket submission error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setForm(emptyForm())
    setErrors({})
    setSubmitted(false)
    setServerError('')
    setTicketId(null)
  }

  return (
    <div className="support-page">
      <div className="support-page__container">
        {/* Hero */}
        <div className="support-hero">
          <div className="support-hero__eyebrow">Trung tâm hỗ trợ</div>
          <h1>Chúng tôi luôn sẵn sàng giúp bạn</h1>
          <p>
            Tra cứu câu hỏi thường gặp bên dưới, hoặc gửi yêu cầu trực tiếp — đội ngũ hỗ trợ sẽ phản hồi trong vòng 24 giờ làm việc.
          </p>
        </div>

        {/* FAQ */}
        <div className="support-faq">
          <div className="support-section-title">Câu hỏi thường gặp</div>
          {faqLoading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Đang tải...</div>
          ) : (
            <div className="support-faq__list">
              {faqItems.map((item) => (
                <FaqItem key={item.question} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Form or Success */}
        <div className="support-section-title">Gửi yêu cầu hỗ trợ</div>
        {submitted ? (
          <div className="support-success">
            <div className="support-success__icon">
              <CheckIcon />
            </div>
            <h3>Yêu cầu đã được gửi!</h3>
            <p>
              Mã yêu cầu của bạn: <strong>#{ticketId}</strong>
            </p>
            <p>
              Đội ngũ hỗ trợ sẽ phản hồi trong vòng 24 giờ làm việc. Bạn có thể theo dõi yêu cầu của mình trong mục "Hỗ trợ".
            </p>
            <button type="button" className="support-success__btn" onClick={handleReset}>
              Gửi yêu cầu khác
            </button>
          </div>
        ) : (
          <div className="support-form-card">
            {serverError && (
              <div style={{
                padding: '12px 16px',
                marginBottom: '16px',
                background: '#ffebee',
                color: '#c62828',
                borderRadius: '6px',
                fontSize: '14px',
                border: '1px solid #ef5350'
              }}>
                {serverError}
              </div>
            )}
            <form onSubmit={handleSubmit} noValidate>
              <div className="support-form__field">
                <label className="support-form__label" htmlFor="support-topic">
                  Chủ đề <span>*</span>
                </label>
                <select
                  id="support-topic"
                  className="support-form__select"
                  value={form.topic}
                  onChange={(e) => setField('topic', e.target.value)}
                >
                  <option value="">— Chọn chủ đề —</option>
                  {topicOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.topic ? <div className="support-form__error">{errors.topic}</div> : null}
              </div>

              <div className="support-form__field">
                <label className="support-form__label" htmlFor="support-message">
                  Mô tả vấn đề <span>*</span>
                </label>
                <textarea
                  id="support-message"
                  className="support-form__textarea"
                  placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải để chúng tôi hỗ trợ nhanh nhất có thể..."
                  value={form.message}
                  onChange={(e) => setField('message', e.target.value)}
                />
                {errors.message ? <div className="support-form__error">{errors.message}</div> : null}
              </div>

              <div className="support-form__actions">
                <button
                  type="submit"
                  className="support-form__submit"
                  disabled={loading}
                >
                  {loading ? 'Đang gửi...' : 'Gửi yêu cầu hỗ trợ'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
