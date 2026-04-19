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

const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard').then((module) => ({ default: module.AdminDashboard })))
const SystemReports = lazy(() => import('./pages/reports/SystemReports').then((module) => ({ default: module.SystemReports })))
const TopicManagement = lazy(() => import('./pages/topics/TopicManagement').then((module) => ({ default: module.TopicManagement })))
const LessonManagement = lazy(() => import('./pages/lessons/LessonManagement').then((module) => ({ default: module.LessonManagement })))
const LessonCrudPage = lazy(() => import('./pages/lessons/LessonCrudPage').then((module) => ({ default: module.LessonCrudPage })))
const VocabularyManagement = lazy(() => import('./pages/vocabulary/VocabularyManagement').then((module) => ({ default: module.VocabularyManagement })))
const VocabularyCrudPage = lazy(() => import('./pages/vocabulary/VocabularyCrudPage').then((module) => ({ default: module.VocabularyCrudPage })))
const ReadingManagement = lazy(() => import('./pages/readings/ReadingManagement').then((module) => ({ default: module.ReadingManagement })))
const VideoManagement = lazy(() => import('./pages/videos/VideoManagement').then((module) => ({ default: module.VideoManagement })))
const UserManagement = lazy(() => import('./pages/users/UserManagement').then((module) => ({ default: module.UserManagement })))
const PremiumManagement = lazy(() => import('./pages/premium/PremiumManagement').then((module) => ({ default: module.PremiumManagement })))
const RevenueManagement = lazy(() => import('./pages/revenue/RevenueManagement').then((module) => ({ default: module.RevenueManagement })))
const SpacedRepetitionManagement = lazy(() => import('./pages/spaced-repetition/SpacedRepetitionManagement').then((module) => ({ default: module.SpacedRepetitionManagement })))
const RoleManagement = lazy(() => import('./pages/roles/RoleManagement').then((module) => ({ default: module.RoleManagement })))
const SupportManagement = lazy(() => import('./pages/support/SupportManagement').then((module) => ({ default: module.SupportManagement })))
const AdminCrudPage = lazy(() => import('./pages/crud/AdminCrudPage').then((module) => ({ default: module.AdminCrudPage })))

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
                <Route index element={<AdminDashboard />} />
                <Route path="reports" element={<SystemReports />} />
                <Route path="topics" element={<TopicManagement />} />
                <Route path="topics/new" element={<AdminCrudPage entity="topics" mode="create" />} />
                <Route path="topics/:id/edit" element={<AdminCrudPage entity="topics" mode="edit" />} />
                <Route path="topics/:id/delete" element={<AdminCrudPage entity="topics" mode="delete" />} />
                <Route path="lessons" element={<LessonManagement />} />
                <Route path="lessons/new" element={<LessonCrudPage mode="create" />} />
                <Route path="lessons/:id/edit" element={<LessonCrudPage mode="edit" />} />
                <Route path="lessons/:id/delete" element={<LessonCrudPage mode="delete" />} />
                <Route path="vocabulary" element={<VocabularyManagement />} />
                <Route path="vocabulary/new" element={<VocabularyCrudPage mode="create" />} />
                <Route path="vocabulary/:id/edit" element={<VocabularyCrudPage mode="edit" />} />
                <Route path="vocabulary/:id/delete" element={<VocabularyCrudPage mode="delete" />} />
                <Route path="readings" element={<ReadingManagement />} />
                <Route path="videos" element={<VideoManagement />} />
                <Route path="videos/new" element={<AdminCrudPage entity="videos" mode="create" />} />
                <Route path="videos/:id/edit" element={<AdminCrudPage entity="videos" mode="edit" />} />
                <Route path="videos/:id/delete" element={<AdminCrudPage entity="videos" mode="delete" />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="premium" element={<PremiumManagement />} />
                <Route path="revenue" element={<RevenueManagement />} />
                <Route path="spaced-repetition" element={<SpacedRepetitionManagement />} />
                <Route path="roles" element={<RoleManagement />} />
                <Route path="support" element={<SupportManagement />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </div>
    </AdminRouteGuard>
  )
}