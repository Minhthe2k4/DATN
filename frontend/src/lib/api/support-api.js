/**
 * Support & Help API Service
 * Fetches FAQ, support categories, and manages support tickets
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

// Default FAQ - used as fallback
const defaultFAQ = [
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

const defaultTopics = [
  'Tài khoản & đăng nhập',
  'Thanh toán & Premium',
  'Nội dung học tập',
  'Tính năng ứng dụng',
  'Báo lỗi ứng dụng',
  'Khác',
]

/**
 * Get FAQ items, optionally filtered
 * @param {Object} filters - Filter options (search, category)
 * @returns {Promise<Array>} FAQ items with questions and answers
 */
export async function fetchFAQ(filters = {}) {
  try {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    const queryString = params.toString()
    const url = `${API_BASE_URL}/api/support/faq${queryString ? '?' + queryString : ''}`

    const response = await fetch(url, {
      credentials: 'include',
    })
    if (!response.ok) return defaultFAQ
    return await response.json()
  } catch (error) {
    console.warn('Failed to fetch FAQ, using defaults:', error)
    return defaultFAQ
  }
}

/**
 * Get support ticket categories/topics
 * @returns {Promise<Array>} List of support categories
 */
export async function fetchSupportTopics() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/support/topics`, {
      credentials: 'include',
    })
    if (!response.ok) return defaultTopics
    return await response.json()
  } catch (error) {
    console.warn('Failed to fetch support topics, using defaults:', error)
    return defaultTopics
  }
}

/**
 * Submit a new support ticket
 * @param {string} topic - Support category
 * @param {string} message - Issue description
 * @param {string} email - Contact email (optional, uses user's email if not provided)
 * @returns {Promise<Object>} Created ticket with ID
 */
export async function submitSupportTicket({ topic, message, email = null }) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/support/tickets`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        message,
        email,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to submit support ticket')
    }

    return await response.json()
  } catch (error) {
    console.error('Support ticket submission failed:', error)
    throw error
  }
}

/**
 * Get user's support tickets
 * @param {Object} filters - Filter options (status, limit)
 * @returns {Promise<Array>} User's support tickets
 */
export async function fetchUserTickets(filters = {}) {
  try {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    const queryString = params.toString()
    const url = `${API_BASE_URL}/api/user/support/tickets${queryString ? '?' + queryString : ''}`

    const response = await fetch(url, {
      credentials: 'include',
    })
    if (!response.ok) return []
    return await response.json()
  } catch (error) {
    console.warn('Failed to fetch user tickets:', error)
    return []
  }
}

/**
 * Get single support ticket details
 * @param {string} ticketId - Support ticket ID
 * @returns {Promise<Object>} Ticket with messages and status
 */
export async function fetchTicketDetails(ticketId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/support/tickets/${ticketId}`, {
      credentials: 'include',
    })
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.warn('Failed to fetch ticket details:', error)
    return null
  }
}

/**
 * Reply to a support ticket
 * @param {string} ticketId - Support ticket ID
 * @param {string} message - Reply message
 * @returns {Promise<Object>} Updated ticket
 */
export async function replyToTicket(ticketId, message) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/support/tickets/${ticketId}/reply`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })

    if (!response.ok) throw new Error('Failed to reply to ticket')
    return await response.json()
  } catch (error) {
    console.error('Reply to ticket failed:', error)
    throw error
  }
}

/**
 * Close a support ticket
 * @param {string} ticketId - Support ticket ID
 * @returns {Promise<Object>} Updated ticket
 */
export async function closeTicket(ticketId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/support/tickets/${ticketId}/close`, {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) throw new Error('Failed to close ticket')
    return await response.json()
  } catch (error) {
    console.error('Close ticket failed:', error)
    throw error
  }
}

/**
 * Rate support experience
 * @param {string} ticketId - Support ticket ID
 * @param {number} rating - Rating 1-5
 * @param {string} feedback - Optional feedback
 * @returns {Promise<Object>} Rating submission result
 */
export async function rateSupport(ticketId, rating, feedback = '') {
  try {
    const response = await fetch(`${API_BASE_URL}/api/support/tickets/${ticketId}/rate`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, feedback }),
    })

    if (!response.ok) throw new Error('Failed to submit rating')
    return await response.json()
  } catch (error) {
    console.error('Rating submission failed:', error)
    throw error
  }
}
