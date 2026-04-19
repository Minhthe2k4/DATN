import { fetchPremiumLimits as fetchLimitsFromAPI } from '@/lib/api/premium-api'

/**
 * Premium Feature Limits Configuration
 * 
 * These limits define what free vs premium users can access.
 * This configuration is now fetched from the API.
 * 
 * Default limits used as fallback if API fails.
 */

const DEFAULT_LIMITS = {
  // Saved Vocabulary: How many words can free users save?
  SAVED_VOCABULARY: {
    FREE_LIMIT: 50,        // Free users can save max 50 words
    PREMIUM_UNLIMITED: true, // Premium users: unlimited
    WARNING_THRESHOLD: 40,  // Show warning at 80% capacity
  },

  // Saved Articles/Bookmarks: How many can free users bookmark?
  SAVED_ARTICLES: {
    FREE_LIMIT: 10,        // Free users can bookmark max 10 articles
    PREMIUM_UNLIMITED: true,
    WARNING_THRESHOLD: 8,
  },

  // Video Downloads: How many can free users download?
  VIDEO_DOWNLOADS: {
    FREE_LIMIT: 0,        // Free users cannot download videos
    PREMIUM_UNLIMITED: true,
  },

  // Monthly Reading Quota: How many articles/month?
  READING_ARTICLES_MONTHLY: {
    FREE_LIMIT: 10,       // Free users: 10 articles/month
    PREMIUM_UNLIMITED: true,
  },

  // Custom Vocabulary Sets: How many can free users create?
  CUSTOM_VOCABULARY_SETS: {
    FREE_LIMIT: 2,        // Free users: 2 custom sets max
    PREMIUM_UNLIMITED: true,
  },

  // Vocabulary Tests per Month: Unlimited for premium
  VOCABULARY_TESTS_MONTHLY: {
    FREE_LIMIT: 5,        // Free users: 5 tests/month
    PREMIUM_UNLIMITED: true,
  },
}

// Cached limits
let cachedLimits = null

/**
 * Get premium limits (fetched from API, with fallback to defaults)
 * @returns {Promise<Object>} Premium limits configuration
 */
export async function getPremiumLimits() {
  if (cachedLimits) return cachedLimits

  try {
    const limits = await fetchLimitsFromAPI()
    cachedLimits = limits
    return limits
  } catch (error) {
    console.warn('Failed to fetch premium limits from API, using defaults:', error)
    return DEFAULT_LIMITS
  }
}

/**
 * Get default limits synchronously (use for initialization)
 * Should be replaced with getPremiumLimits() for real data
 * @returns {Object} Default premium limits
 */
export function getDefaultPremiumLimits() {
  return DEFAULT_LIMITS
}

/**
 * Invalidate limits cache (call after updating limits on admin panel)
 */
export function invalidateLimitsCache() {
  cachedLimits = null
}

// Export for backward compatibility
export const PREMIUM_LIMITS = DEFAULT_LIMITS

/**
 * Get premium limit for a feature
 * @param {string} featureName - Feature key from PREMIUM_LIMITS
 * @param {boolean} isPremium - Is user premium?
 * @param {Object} dynamicLimits - Dynamic limits from API
 * @returns {number|boolean} Limit value or true if unlimited
 */
export function getPremiumLimit(featureName, isPremium, dynamicLimits = null) {
  const feature = dynamicLimits?.[featureName] || PREMIUM_LIMITS[featureName]
  if (!feature) {
    console.warn(`Unknown premium feature: ${featureName}`)
    return null
  }

  if (isPremium && feature.PREMIUM_UNLIMITED) {
    return Infinity
  }

  return feature.FREE_LIMIT
}

/**
 * Check if user has reached the limit for a feature
 * @param {string} featureName - Feature key from PREMIUM_LIMITS
 * @param {number} currentUsage - How much user has already used
 * @param {boolean} isPremium - Is user premium?
 * @param {Object} dynamicLimits - Dynamic limits from API
 * @returns {object} { isLimited: boolean, remaining: number, limit: number, isWarning: boolean }
 */
export function checkPremiumLimit(featureName, currentUsage, isPremium, dynamicLimits = null) {
  const feature = dynamicLimits?.[featureName] || PREMIUM_LIMITS[featureName]
  if (!feature) {
    console.warn(`Unknown premium feature: ${featureName}`)
    return { isLimited: false, remaining: Infinity, limit: Infinity, isWarning: false }
  }

  if (isPremium && feature.PREMIUM_UNLIMITED) {
    return { isLimited: false, remaining: Infinity, limit: Infinity, isWarning: false }
  }

  const limit = feature.FREE_LIMIT
  const remaining = Math.max(0, limit - currentUsage)
  const isLimited = currentUsage >= limit
  const isWarning = !isLimited && currentUsage >= (feature.WARNING_THRESHOLD || limit * 0.8)

  return { isLimited, remaining, limit, isWarning }
}
