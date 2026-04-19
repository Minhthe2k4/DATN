/**
 * Admin API Service
 * Fetches admin dashboard and management data from backend
 * Falls back to mock data if API fails
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

// Fallback mock data - used only if API fails
const fallbackData = {
  adminSummary: {
    totalUsers: 18420,
    activeUsers: 12784,
    newUsersToday: 164,
    dailyLogins: 5932,
    totalWords: 12680,
    totalLessons: 384,
    totalReadings: 142,
    totalVideos: 96,
    dailyStudySessions: 4210,
    dailyWordsLearned: 18354,
    lessonCompletionRate: 78,
    averageAccuracyRate: 84,
    dailyReviews: 6920,
    wordsInReview: 9824,
    scheduledReviews: 4281,
    masteredWords: 3650,
    premiumUsers: 2315,
    pendingPremiumRequests: 48,
  },
  trendSeries: [
    { label: 'T2', users: 28, words: 46, lessons: 11, reviews: 35 },
    { label: 'T3', users: 34, words: 52, lessons: 13, reviews: 38 },
    { label: 'T4', users: 31, words: 48, lessons: 15, reviews: 44 },
    { label: 'T5', users: 43, words: 60, lessons: 18, reviews: 51 },
    { label: 'T6', users: 47, words: 72, lessons: 17, reviews: 58 },
    { label: 'T7', users: 39, words: 55, lessons: 14, reviews: 49 },
    { label: 'CN', users: 36, words: 50, lessons: 12, reviews: 46 },
  ],
  userActivityLeaders: [
    { name: 'Nguyen Linh', streak: 112, learnedWords: 820, completion: 94 },
    { name: 'Tran Nam', streak: 89, learnedWords: 760, completion: 91 },
    { name: 'Le Minh Thu', streak: 76, learnedWords: 704, completion: 88 },
    { name: 'Phan Bao', streak: 63, learnedWords: 655, completion: 86 },
  ],
}

/**
 * Get admin summary dashboard data
 * @returns {Promise<Object>} Admin summary with stats
 */
export async function fetchAdminSummary() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/overview`, {
      credentials: 'include',
    })
    if (!response.ok) return fallbackData.adminSummary
    const data = await response.json()
    return data
  } catch (error) {
    console.warn('Failed to fetch admin summary, using fallback:', error)
    return fallbackData.adminSummary
  }
}

/**
 * Get weekly trend data
 * @returns {Promise<Array>} Trend series data
 */
export async function fetchTrendSeries() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/trends`, {
      credentials: 'include',
    })
    if (!response.ok) return fallbackData.trendSeries
    return await response.json()
  } catch (error) {
    console.warn('Failed to fetch trend data, using fallback:', error)
    return fallbackData.trendSeries
  }
}

/**
 * Get top active users
 * @returns {Promise<Array>} User activity leaders
 */
export async function fetchUserActivityLeaders() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/leaders`, {
      credentials: 'include',
    })
    if (!response.ok) return fallbackData.userActivityLeaders
    return await response.json()
  } catch (error) {
    console.warn('Failed to fetch activity leaders, using fallback:', error)
    return fallbackData.userActivityLeaders
  }
}

/**
 * Get all topics
 * @returns {Promise<Array>} Topics list
 */
export async function fetchTopics() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/topics`, {
      credentials: 'include',
    })
    if (!response.ok) return []
    return await response.json()
  } catch (error) {
    console.warn('Failed to fetch topics:', error)
    return []
  }
}

/**
 * Get all vocabulary entries with optional filtering
 * @param {Object} filters - Filter options (topic_id, level, status, etc.)
 * @returns {Promise<Array>} Vocabulary entries
 */
export async function fetchVocabularyEntries(filters = {}) {
  try {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    const queryString = params.toString()
    const url = `${API_BASE_URL}/api/vocabulary${queryString ? '?' + queryString : ''}`

    const response = await fetch(url, {
      credentials: 'include',
    })
    if (!response.ok) return []
    return await response.json()
  } catch (error) {
    console.warn('Failed to fetch vocabulary entries:', error)
    return []
  }
}

/**
 * Get all lessons with optional filtering
 * @param {Object} filters - Filter options (topic_id, level, status)
 * @returns {Promise<Array>} Lessons
 */
export async function fetchLessons(filters = {}) {
  try {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    const queryString = params.toString()
    const url = `${API_BASE_URL}/api/lessons${queryString ? '?' + queryString : ''}`

    const response = await fetch(url, {
      credentials: 'include',
    })
    if (!response.ok) return []
    return await response.json()
  } catch (error) {
    console.warn('Failed to fetch lessons:', error)
    return []
  }
}

/**
 * Get all reading articles with optional filtering
 * @param {Object} filters - Filter options (topic_id, level, status)
 * @returns {Promise<Array>} Reading articles
 */
export async function fetchReadingArticles(filters = {}) {
  try {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    const queryString = params.toString()
    const url = `${API_BASE_URL}/api/readings${queryString ? '?' + queryString : ''}`

    const response = await fetch(url, {
      credentials: 'include',
    })
    if (!response.ok) return []
    return await response.json()
  } catch (error) {
    console.warn('Failed to fetch reading articles:', error)
    return []
  }
}

/**
 * Get all video lessons with optional filtering
 * @param {Object} filters - Filter options (topic_id, level)
 * @returns {Promise<Array>} Video lessons
 */
export async function fetchVideoLessons(filters = {}) {
  try {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    const queryString = params.toString()
    const url = `${API_BASE_URL}/api/videos${queryString ? '?' + queryString : ''}`

    const response = await fetch(url, {
      credentials: 'include',
    })
    if (!response.ok) return []
    return await response.json()
  } catch (error) {
    console.warn('Failed to fetch video lessons:', error)
    return []
  }
}

/**
 * Get all users with optional filtering
 * @param {Object} filters - Filter options (status, premium, etc.)
 * @returns {Promise<Array>} Users list
 */
export async function fetchUsers(filters = {}) {
  try {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    const queryString = params.toString()
    const url = `${API_BASE_URL}/api/admin/users${queryString ? '?' + queryString : ''}`

    const response = await fetch(url, {
      credentials: 'include',
    })
    if (!response.ok) return []
    return await response.json()
  } catch (error) {
    console.warn('Failed to fetch users:', error)
    return []
  }
}

/**
 * Get premium requests
 * @returns {Promise<Array>} Premium upgrade requests
 */
export async function fetchPremiumRequests() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/premium-requests`, {
      credentials: 'include',
    })
    if (!response.ok) return []
    return await response.json()
  } catch (error) {
    console.warn('Failed to fetch premium requests:', error)
    return []
  }
}

/**
 * Get support tickets
 * @param {Object} filters - Filter options (status, topic)
 * @returns {Promise<Array>} Support tickets
 */
export async function fetchSupportTickets(filters = {}) {
  try {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    const queryString = params.toString()
    const url = `${API_BASE_URL}/api/admin/support/tickets${queryString ? '?' + queryString : ''}`

    const response = await fetch(url, {
      credentials: 'include',
    })
    if (!response.ok) return []
    return await response.json()
  } catch (error) {
    console.warn('Failed to fetch support tickets:', error)
    return []
  }
}

/**
 * Get revenue data
 * @returns {Promise<Object>} Revenue summary with trends
 */
export async function fetchRevenueData() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/revenue`, {
      credentials: 'include',
    })
    if (!response.ok) return { summary: {}, trends: [], transactions: [] }
    return await response.json()
  } catch (error) {
    console.warn('Failed to fetch revenue data:', error)
    return { summary: {}, trends: [], transactions: [] }
  }
}

/**
 * Get all roles and permissions
 * @returns {Promise<Array>} Role definitions
 */
export async function fetchRoles() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/roles`, {
      credentials: 'include',
    })
    if (!response.ok) return []
    return await response.json()
  } catch (error) {
    console.warn('Failed to fetch roles:', error)
    return []
  }
}
