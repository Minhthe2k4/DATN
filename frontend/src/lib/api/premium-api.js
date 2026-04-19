/**
 * Premium Features API Service
 * Fetches premium feature limits and pricing from backend
 * Falls back to defaults if API fails
 */

import { getUserSession } from '@/user/utils/authSession'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

// Default premium limits - used as fallback
const defaultLimits = {
  SAVED_VOCABULARY: {
    FREE_LIMIT: 50,
    PREMIUM_UNLIMITED: true,
    WARNING_THRESHOLD: 40,
  },
  SAVED_ARTICLES: {
    FREE_LIMIT: 10,
    PREMIUM_UNLIMITED: true,
    WARNING_THRESHOLD: 8,
  },
  VIDEO_DOWNLOADS: {
    FREE_LIMIT: 0,
    PREMIUM_UNLIMITED: true,
  },
  READING_ARTICLES_MONTHLY: {
    FREE_LIMIT: 10,
    PREMIUM_UNLIMITED: true,
  },
  CUSTOM_VOCABULARY_SETS: {
    FREE_LIMIT: 2,
    PREMIUM_UNLIMITED: true,
  },
  VOCABULARY_TESTS_MONTHLY: {
    FREE_LIMIT: 5,
    PREMIUM_UNLIMITED: true,
  },
}

const defaultPlans = [
  {
    id: 'lifetime',
    label: 'Vĩnh viễn',
    badge: 'Lựa chọn tốt nhất',
    price: '₫849,000',
    oldPrice: '₫1,499,000',
    discount: '-43%',
    note: 'Thanh toán một lần',
    highlight: true,
  },
  {
    id: 'yearly',
    label: '1 năm',
    pricePerMonth: '₫36,583/tháng',
    price: '₫439,000',
    oldPrice: '₫549,000',
    discount: '-20%',
    note: 'Thanh toán hàng năm',
  },
  {
    id: 'quarterly',
    label: '3 tháng',
    pricePerMonth: '₫116,333/tháng',
    price: '₫349,000',
    note: 'Thanh toán hàng quý',
  },
]

/**
 * Get premium feature limits for user
 * Limits may differ for free vs premium users
 * @returns {Promise<Object>} Premium limits configuration
 */
export async function fetchPremiumLimits() {
  try {
    const session = getUserSession()
    if (!session || !session.userId) return defaultLimits
    
    const response = await fetch(`${API_BASE_URL}/api/users/${session.userId}/premium-status`)
    if (!response.ok) return defaultLimits
    
    const data = await response.json()
    // The endpoint returns { featureLimits: { ... } }
    return data.featureLimits || defaultLimits
  } catch (error) {
    console.warn('Failed to fetch premium limits, using defaults:', error)
    return defaultLimits
  }
}

/**
 * Get subscription plans available for purchase
 * @returns {Promise<Array>} Subscription plans with pricing
 */
export async function fetchSubscriptionPlans() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/premium/plans`, {
      credentials: 'include',
    })
    if (!response.ok) return defaultPlans
    return await response.json()
  } catch (error) {
    console.warn('Failed to fetch subscription plans, using defaults:', error)
    return defaultPlans
  }
}

/**
 * Get current user's subscription status
 * @returns {Promise<Object>} User subscription details (plan, expiry, etc.)
 */
export async function fetchUserSubscription() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/subscription`, {
      credentials: 'include',
    })
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.warn('Failed to fetch user subscription:', error)
    return null
  }
}

/**
 * Check if user has premium access
 * @returns {Promise<boolean>} True if user has active premium
 */
export async function checkPremiumStatus() {
  try {
    const session = getUserSession()
    if (!session || !session.userId) return false
    
    const response = await fetch(`${API_BASE_URL}/api/users/${session.userId}/premium-status`)
    if (!response.ok) return false
    
    const data = await response.json()
    return data.isPremium === true
  } catch (error) {
    console.warn('Failed to check premium status:', error)
    return false
  }
}

/**
 * Get premium features list
 * @returns {Promise<Array>} List of premium features with descriptions
 */
export async function fetchPremiumFeatures() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/premium/features`, {
      credentials: 'include',
    })
    if (!response.ok) return []
    return await response.json()
  } catch (error) {
    console.warn('Failed to fetch premium features:', error)
    return []
  }
}

/**
 * Create payment intent for subscription
 * @param {string} planId - Plan identifier (lifetime, yearly, quarterly)
 * @returns {Promise<Object>} Payment intent details
 */
export async function createPaymentIntent(planId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/premium/payment-intent`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    })
    if (!response.ok) throw new Error('Failed to create payment intent')
    return await response.json()
  } catch (error) {
    console.error('Payment intent creation failed:', error)
    throw error
  }
}

/**
 * Check user's usage against limits
 * @param {string} featureName - Feature to check (e.g., 'SAVED_VOCABULARY')
 * @param {number} currentUsage - Current usage count
 * @returns {Promise<Object>} Usage status and warnings
 */
export async function checkFeatureUsage(featureName, currentUsage) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/feature-usage`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featureName, currentUsage }),
    })
    if (!response.ok) return { allowed: true, warning: null }
    return await response.json()
  } catch (error) {
    console.warn('Failed to check feature usage:', error)
    return { allowed: true, warning: null }
  }
}
