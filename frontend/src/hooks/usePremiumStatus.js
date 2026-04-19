import { useEffect, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export function usePremiumStatus(userId) {
  const [premiumStatus, setPremiumStatus] = useState({
    isPremium: false,
    status: 'free',
    premiumUntil: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (!userId) {
      setPremiumStatus(prev => ({ ...prev, loading: false }))
      return
    }

    let cancelled = false

    async function fetchStatus() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}/premium-status`)
        
        if (response.status === 404) {
          if (!cancelled) {
            setPremiumStatus({
              isPremium: false,
              status: 'free',
              premiumUntil: null,
              loading: false,
              error: null,
            })
          }
          return
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch premium status: ${response.status}`)
        }

        const data = await response.json()
        if (!cancelled) {
          setPremiumStatus({
            isPremium: data.isPremium ?? false,
            status: data.status ?? 'free',
            premiumUntil: data.premiumUntil ?? null,
            featureLimits: data.featureLimits ?? null,
            loading: false,
            error: null,
          })
        }
      } catch (err) {
        if (!cancelled) {
          setPremiumStatus(prev => ({
            ...prev,
            loading: false,
            error: err instanceof Error ? err.message : 'Unknown error',
            isPremium: false,
          }))
        }
      }
    }

    fetchStatus()
    return () => { cancelled = true }
  }, [userId])

  return premiumStatus
}

export function isPremiumValid(premiumStatus) {
  if (!premiumStatus.isPremium) return false
  if (!premiumStatus.premiumUntil) return false
  return new Date(premiumStatus.premiumUntil) > new Date()
}
