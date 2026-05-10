import { lazy, Suspense, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Header } from './components/Header'
import { Slidebar } from './components/Sidebar'
import { isAdminLoggedIn } from './utils/adminSession'
import './assets/css/bootstrap.min.css'
import './assets/css/icons.min.css'
import './assets/css/app.min.css'
import './assets/css/admin-overrides.css'
import './assets/css/admin-console.css'

const TopicManagement = lazy(() => import('./pages/topics/TopicManagement').then((module) => ({ default: module.TopicManagement })))
const LessonManagement = lazy(() => import('./pages/lessons/LessonManagement').then((module) => ({ default: module.LessonManagement })))
const LessonCrudPage = lazy(() => import('./pages/lessons/LessonCrudPage').then((module) => ({ default: module.LessonCrudPage })))
const LessonDetailPage = lazy(() => import('./pages/lessons/LessonDetailPage').then((module) => ({ default: module.LessonDetailPage })))
const VocabularyManagement = lazy(() => import('./pages/vocabulary/VocabularyManagement').then((module) => ({ default: module.VocabularyManagement })))
const VocabularyCrudPage = lazy(() => import('./pages/vocabulary/VocabularyCrudPage').then((module) => ({ default: module.VocabularyCrudPage })))
const VocabularyDetailPage = lazy(() => import('./pages/vocabulary/VocabularyDetailPage').then((module) => ({ default: module.VocabularyDetailPage })))
const ReadingManagement = lazy(() => import('./pages/readings/ReadingManagement').then((module) => ({ default: module.ReadingManagement })))
const ReadingCrudPage = lazy(() => import('./pages/readings/ReadingCrudPage').then((module) => ({ default: module.ReadingCrudPage })))
const ArticleDetailPage = lazy(() => import('./pages/readings/ArticleDetailPage').then((module) => ({ default: module.ArticleDetailPage })))
const VideoManagement = lazy(() => import('./pages/videos/VideoManagement').then((module) => ({ default: module.VideoManagement })))
const VideoCrudPage = lazy(() => import('./pages/videos/VideoCrudPage').then((module) => ({ default: module.VideoCrudPage })))
const VideoDetailPage = lazy(() => import('./pages/videos/VideoDetailPage').then((module) => ({ default: module.VideoDetailPage })))
const VideoChannelDetailPage = lazy(() => import('./pages/videos/VideoChannelDetailPage').then((module) => ({ default: module.VideoChannelDetailPage })))
const UserManagement = lazy(() => import('./pages/users/UserManagement').then((module) => ({ default: module.UserManagement })))
const UserDetailPage = lazy(() => import('./pages/users/UserDetailPage').then((module) => ({ default: module.UserDetailPage })))
const UserCrudPage = lazy(() => import('./pages/users/UserCrudPage').then((module) => ({ default: module.UserCrudPage })))
const RevenueManagement = lazy(() => import('./pages/revenue/RevenueManagement').then((module) => ({ default: module.RevenueManagement })))
const PremiumManagement = lazy(() => import('./pages/premium/PremiumManagement').then((module) => ({ default: module.PremiumManagement })))
const PremiumPlanCrud = lazy(() => import('./pages/premium/PremiumPlanCrud').then((module) => ({ default: module.PremiumPlanCrud })))
const PremiumGrantPage = lazy(() => import('./pages/premium/PremiumGrantPage').then((module) => ({ default: module.PremiumGrantPage })))
const PremiumExtendPage = lazy(() => import('./pages/premium/PremiumExtendPage').then((module) => ({ default: module.PremiumExtendPage })))
const LearningManagement = lazy(() => import('./pages/spaced-repetition/LearningManagement').then((module) => ({ default: module.LearningManagement })))
const TopicCrudPage = lazy(() => import('./pages/topics/TopicCrudPage').then((module) => ({ default: module.TopicCrudPage })))
const TopicDetailPage = lazy(() => import('./pages/topics/TopicDetailPage').then((module) => ({ default: module.TopicDetailPage })))
const ReadingTopicCrudPage = lazy(() => import('./pages/readings/ReadingTopicCrudPage').then((module) => ({ default: module.ReadingTopicCrudPage })))
const ReadingTopicDetailPage = lazy(() => import('./pages/readings/ReadingTopicDetailPage').then((module) => ({ default: module.ReadingTopicDetailPage })))
const VideoChannelCrudPage = lazy(() => import('./pages/videos/VideoChannelCrudPage').then((module) => ({ default: module.VideoChannelCrudPage })))
const RecycleBin = lazy(() => import('./pages/RecycleBin'))

function isAdminAllowed() {
  // Check if user has admin session
  return isAdminLoggedIn()
}

function AdminRouteGuard({ children }) {
  const location = useLocation()

  if (!isAdminAllowed()) {
    const returnTo = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/admin/login?next=${returnTo}`} replace />
  }

  return children
}

export function AdminApp() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = window.localStorage.getItem('admin-sidebar-collapsed')
    return saved === '1'
  })

  const [isDarkMode, setIsDarkMode] = useState(() =>
    window.localStorage.getItem('admin-dark-mode') === '1'
  )

  useEffect(() => {
    window.localStorage.setItem('admin-sidebar-collapsed', isCollapsed ? '1' : '0')
    document.body.setAttribute('data-sidebar-size', isCollapsed ? 'collapsed' : 'default')
  }, [isCollapsed])

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode)
    window.localStorage.setItem('admin-dark-mode', isDarkMode ? '1' : '0')
    return () => {
      document.body.classList.remove('dark-mode')
    }
  }, [isDarkMode])

  useEffect(() => {
    const loadAdminUiRuntime = async () => {
      await import('./assets/libs/bootstrap/js/bootstrap.bundle.min.js')
      await import('./assets/libs/simplebar/simplebar.min.js')
      await import('./assets/js/app.js')
    }

    loadAdminUiRuntime()

    // Verify admin session
    const verifyAdmin = async () => {
      const session = JSON.parse(window.localStorage.getItem('adminSession'))
      if (!session || !session.token) return

      try {
        const response = await fetch('/api/auth/verify', {
          headers: { Authorization: `Bearer ${session.token}` }
        })
        if (response.status === 401) {
          window.localStorage.removeItem('adminSession')
          window.location.href = '/admin/login'
        }
      } catch (err) {
        console.error('Admin verify failed:', err)
      }
    }
    verifyAdmin()
  }, [])

  return (
    <AdminRouteGuard>
      <div className={`admin-shell${isCollapsed ? ' is-collapsed' : ''}`}>
        <Slidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        />
        <div className="page-wrapper">
          <div className="page-content-tab">
            <Header
              isDarkMode={isDarkMode}
              onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
            />
            <Suspense fallback={null}>
              <Routes>
                <Route index element={<LearningManagement />} />
                <Route path="topics" element={<TopicManagement />} />
                <Route path="topics/new" element={<TopicCrudPage mode="create" />} />
                <Route path="topics/:id" element={<TopicDetailPage />} />
                <Route path="topics/:id/edit" element={<TopicCrudPage mode="edit" />} />
                <Route path="topics/:id/delete" element={<TopicCrudPage mode="delete" />} />
                <Route path="lessons" element={<LessonManagement />} />
                <Route path="lessons/new" element={<LessonCrudPage mode="create" />} />
                <Route path="lessons/:id" element={<LessonDetailPage />} />
                <Route path="lessons/:id/edit" element={<LessonCrudPage mode="edit" />} />
                <Route path="lessons/:id/delete" element={<LessonCrudPage mode="delete" />} />
                <Route path="vocabulary" element={<VocabularyManagement />} />
                <Route path="vocabulary/new" element={<VocabularyCrudPage mode="create" />} />
                <Route path="vocabulary/:id" element={<VocabularyDetailPage />} />
                <Route path="vocabulary/:id/edit" element={<VocabularyCrudPage mode="edit" />} />
                <Route path="vocabulary/:id/delete" element={<VocabularyCrudPage mode="delete" />} />
                <Route path="readings" element={<ReadingManagement />} />
                <Route path="readings/new" element={<ReadingCrudPage mode="create" />} />
                <Route path="readings/:id" element={<ArticleDetailPage />} />
                <Route path="readings/:id/edit" element={<ReadingCrudPage mode="edit" />} />
                <Route path="readings/:id/delete" element={<ReadingCrudPage mode="delete" />} />
                <Route path="reading-topics/new" element={<ReadingTopicCrudPage mode="create" />} />
                <Route path="reading-topics/:id" element={<ReadingTopicDetailPage />} />
                <Route path="reading-topics/:id/edit" element={<ReadingTopicCrudPage mode="edit" />} />
                <Route path="reading-topics/:id/delete" element={<ReadingTopicCrudPage mode="delete" />} />
                <Route path="videos" element={<VideoManagement />} />
                <Route path="videos/new" element={<VideoCrudPage mode="create" />} />
                <Route path="videos/:id" element={<VideoDetailPage />} />
                <Route path="videos/:id/edit" element={<VideoCrudPage mode="edit" />} />
                <Route path="videos/:id/delete" element={<VideoCrudPage mode="delete" />} />
                <Route path="video-channels/new" element={<VideoChannelCrudPage mode="create" />} />
                <Route path="video-channels/:id" element={<VideoChannelDetailPage />} />
                <Route path="video-channels/:id/edit" element={<VideoChannelCrudPage mode="edit" />} />
                <Route path="video-channels/:id/delete" element={<VideoChannelCrudPage mode="delete" />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="users/:id" element={<UserDetailPage />} />
                <Route path="users/:id/edit" element={<UserCrudPage mode="edit" />} />
                <Route path="users/:id/delete" element={<UserCrudPage mode="delete" />} />
                <Route path="premium" element={<PremiumManagement />} />
                <Route path="premium/new" element={<PremiumPlanCrud />} />
                <Route path="premium/:id/edit" element={<PremiumPlanCrud />} />
                <Route path="premium/grant" element={<PremiumGrantPage />} />
                <Route path="premium/members/:userId/extend" element={<PremiumExtendPage />} />
                <Route path="revenue" element={<RevenueManagement />} />
                <Route path="spaced-repetition" element={<LearningManagement />} />
                <Route path="recycle-bin" element={<RecycleBin />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </div>
    </AdminRouteGuard>
  )
}