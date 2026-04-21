import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Header } from './user/components/header/Header'
import { Sidebar } from './user/components/sidebar/Sidebar'
import { Homepage } from './user/pages/homepage/Homepage.jsx'
import { Vocabulary } from './user/pages/vocabulary/Vocabulary.jsx'
import { VocabularyManager } from './user/pages/vocabulary_manager/VocabularyManager.jsx'
import { VocabularyLesson } from './user/pages/vocabulary_lesson/VocabularyLesson.jsx'
import { Video } from './user/pages/video/Video.jsx'
import { VideoChannel } from './user/pages/video/VideoChannel.jsx'
import { VideoWatch } from './user/pages/video/VideoWatch.jsx'
import Reading from './user/pages/reading/Reading.jsx'
import { ReadingDetail } from './user/pages/reading/ReadingDetail.jsx'
import { Dictionary } from './user/pages/dictionary/Dictionary.jsx'
import { Subscription } from './user/pages/subscription/Subscription.jsx'
import { VocabularyTest } from './user/pages/vocabulary_test/VocabularyTest.jsx'
import { VocabularySaved } from './user/pages/vocabulary_saved/VocabularySaved.jsx'
import { Support } from './user/pages/support/Support.jsx'
import { Login } from './user/pages/auth/Login.jsx'
import { Register } from './user/pages/auth/Register.jsx'
import ManagePersonalInfoPage from './user/pages/settings/ManagePersonalInfoPage.jsx'
import Profile from './user/pages/profile/Profile.jsx'
import FlashcardManager from './user/pages/flashcard/FlashcardManager.jsx'
import FlashcardStudy from './user/pages/flashcard/FlashcardStudy.jsx'
import FlashcardDeckEditor from './user/pages/flashcard/FlashcardDeckEditor.jsx'
import AdminLogin from './admin/pages/auth/AdminLogin.jsx'
import PremiumCheckout from './user/pages/PremiumCheckout.jsx'
import PaymentResult from './user/pages/PaymentResult.jsx'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ProtectedRoute } from './user/utils/ProtectedRoute'
import './App.css'

const AdminApp = lazy(() => import('./admin/AdminApp.jsx').then((module) => ({ default: module.AdminApp })))

function App() {
  const location = useLocation()
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register'
  const isAdminLoginRoute = location.pathname === '/admin/login'
  const isAdminRoute = location.pathname.startsWith('/admin')
  const [isRouteAnimating, setIsRouteAnimating] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const storedValue = window.localStorage.getItem('dashboard-sidebar-collapsed')
    return storedValue === '1'
  })
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    const storedSoundEnabled = window.localStorage.getItem('dashboard-ui-sound-enabled')
    if (storedSoundEnabled === null) {
      return true
    }

    return storedSoundEnabled === '1'
  })

  const [isDarkMode, setIsDarkMode] = useState(() =>
    window.localStorage.getItem('dashboard-dark-mode') === '1'
  )

  const didMountRef = useRef(false)
  const routeTimerRef = useRef(null)
  const audioContextRef = useRef(null)
  const isAudioUnlockedRef = useRef(false)
  useEffect(() => {
    document.documentElement.style.setProperty('--app-shell-background', '#ffffff')
    document.documentElement.style.setProperty('--app-page-background', '#ffffff')
    document.documentElement.style.setProperty('--app-page-background-rgb', '255, 255, 255')
  }, [])

  useEffect(() => {
    if (isAdminRoute) {
      document.body.classList.add('admin-mode')
    } else {
      document.body.classList.remove('admin-mode')
    }

    return () => {
      document.body.classList.remove('admin-mode')
    }
  }, [isAdminRoute])

  useEffect(() => {
    window.localStorage.setItem('dashboard-ui-sound-enabled', isSoundEnabled ? '1' : '0')
  }, [isSoundEnabled])

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode)
    window.localStorage.setItem('dashboard-dark-mode', isDarkMode ? '1' : '0')
  }, [isDarkMode])

  useEffect(() => {
    window.localStorage.setItem('dashboard-sidebar-collapsed', isSidebarCollapsed ? '1' : '0')
  }, [isSidebarCollapsed])

  useEffect(() => {
    const unlockAudio = () => {
      if (isAudioUnlockedRef.current) {
        return
      }

      try {
        const context = new window.AudioContext()
        context.resume()
        audioContextRef.current = context
        isAudioUnlockedRef.current = true
      } catch {
        // Keep silent when WebAudio is not available.
      }
    }

    window.addEventListener('pointerdown', unlockAudio, { once: true })

    return () => {
      window.removeEventListener('pointerdown', unlockAudio)
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }

    const rafId = window.requestAnimationFrame(() => {
      setIsRouteAnimating(true)
    })

    if (routeTimerRef.current) {
      window.clearTimeout(routeTimerRef.current)
    }

    if (isAudioUnlockedRef.current && audioContextRef.current) {
      const now = audioContextRef.current.currentTime
      const osc = audioContextRef.current.createOscillator()
      const gain = audioContextRef.current.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(540, now)
      osc.frequency.exponentialRampToValueAtTime(760, now + 0.06)

      gain.gain.setValueAtTime(0.001, now)
      gain.gain.linearRampToValueAtTime(0.06, now + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.13)

      osc.connect(gain)
      gain.connect(audioContextRef.current.destination)

      osc.start(now)
      osc.stop(now + 0.14)
    }

    routeTimerRef.current = window.setTimeout(() => {
      setIsRouteAnimating(false)
    }, 380)

    return () => {
      window.cancelAnimationFrame(rafId)
      if (routeTimerRef.current) {
        window.clearTimeout(routeTimerRef.current)
      }
    }
  }, [location.pathname])

  useEffect(() => {
    const scrollToPageTop = () => {
      const mainScrollContainer = document.querySelector('.app-main')
      if (mainScrollContainer instanceof HTMLElement) {
        mainScrollContainer.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      }

      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }

    scrollToPageTop()
    const rafId = window.requestAnimationFrame(scrollToPageTop)

    return () => {
      window.cancelAnimationFrame(rafId)
    }
  }, [location.pathname, location.search])

  useEffect(() => {
    const playUiClickSound = () => {
      if (!isSoundEnabled || !isAudioUnlockedRef.current || !audioContextRef.current) {
        return
      }

      const context = audioContextRef.current
      const now = context.currentTime
      const osc = context.createOscillator()
      const gain = context.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(620, now)
      osc.frequency.exponentialRampToValueAtTime(860, now + 0.03)
      gain.gain.setValueAtTime(0.001, now)
      gain.gain.linearRampToValueAtTime(0.03, now + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08)

      osc.connect(gain)
      gain.connect(context.destination)
      osc.start(now)
      osc.stop(now + 0.09)
    }

    const handleDocumentClick = (event) => {
      if (!(event.target instanceof Element)) {
        return
      }

      const interactiveElement = event.target.closest('button, a, [role="button"]')
      if (!interactiveElement) {
        return
      }

      playUiClickSound()
    }

    document.addEventListener('click', handleDocumentClick)

    return () => {
      document.removeEventListener('click', handleDocumentClick)
    }
  }, [isSoundEnabled])

  if (isAdminLoginRoute) {
    return (
      <div className="admin-login-page">
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </div>
    )
  }

  if (isAdminRoute) {
    return (
      <Suspense fallback={<div className="admin-loading" />}>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Suspense>
    )
  }

  if (isAuthRoute) {
    return (
      <div className={`auth-route-stage route-stage${isRouteAnimating ? ' is-animating' : ''}`}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    )
  }

  return (
    <div className={`app-shell${isSidebarCollapsed ? ' is-sidebar-collapsed' : ''}`}>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      <div className="app-workspace">
        <Header
          isSoundEnabled={isSoundEnabled}
          onToggleSound={() => setIsSoundEnabled((prev) => !prev)}
                  isDarkMode={isDarkMode}
                  onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        />

        <main className="app-main">
          <div className={`route-stage${isRouteAnimating ? ' is-animating' : ''}`}>
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/vocabulary" element={<Vocabulary />} />
              <Route path="/vocabulary-manager" element={<VocabularyManager />} />
              <Route path="/vocabulary-lesson" element={<VocabularyLesson />} />
              <Route path="/reading" element={<Reading />} />
              <Route path="/reading/:topicId/:articleId" element={<ReadingDetail />} />
              <Route path="/dictionary" element={<Dictionary />} />
              <Route path="/video" element={<Video />} />
              <Route path="/video/:channelSlug" element={<VideoChannel />} />
              <Route path="/video/:channelSlug/watch/:videoId" element={<VideoWatch />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/vocabulary-test" element={<VocabularyTest />} />
              <Route path="/vocabulary-saved" element={<VocabularySaved />} />
              <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />
              <Route path="/flashcards" element={<ProtectedRoute><FlashcardManager/></ProtectedRoute>} />
              <Route path="/flashcards/study/:deckId" element={<ProtectedRoute><FlashcardStudy/></ProtectedRoute>} />
              <Route path="/flashcards/deck-editor/:deckId" element={<ProtectedRoute><FlashcardDeckEditor/></ProtectedRoute>} />
              <Route path="/profile/manage" element={<ProtectedRoute><ManagePersonalInfoPage/></ProtectedRoute>} />
              <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><ManagePersonalInfoPage/></ProtectedRoute>} />
              <Route path="/premium-checkout" element={<ProtectedRoute><PremiumCheckout /></ProtectedRoute>} />
              <Route path="/payment-result" element={<ProtectedRoute><PaymentResult /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
