import { ConfigProvider, App as AntdApp, theme } from 'antd'
import { useState, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import LoginPage from './pages/LoginPage'
import OverviewPage from './pages/OverviewPage'
import UsersPage from './pages/UsersPage'
import PostsPage from './pages/PostsPage'
import CommentsPage from './pages/CommentsPage'
import AnnouncementsPage from './pages/AnnouncementsPage'
import { authService } from './services'
import './App.css'

const AppContent = () => {
  const { message } = AntdApp.useApp()

  const [isAuthed, setIsAuthed] = useState(() => authService.isAuthenticated())
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser())

  useEffect(() => {
    // Check auth on mount
    if (authService.isAuthenticated()) {
      const user = authService.getCurrentUser()
      if (user) {
        setCurrentUser(user)
        setIsAuthed(true)
      }
    }
  }, [])

  const handleLogin = (user: any) => {
    setCurrentUser(user)
    setIsAuthed(true)
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      setIsAuthed(false)
      setCurrentUser(null)
      message.info('已退出登录')
    } catch (error) {
      message.error('退出登录失败')
    }
  }

  return (
    <BrowserRouter>
      {isAuthed ? (
        <Routes>
          <Route element={<AdminLayout onLogout={handleLogout} currentUser={currentUser} />}>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/posts" element={<PostsPage />} />
            <Route path="/comments" element={<CommentsPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Route>
        </Routes>
      ) : (
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  )
}

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#3b82f6',
          colorInfo: '#3b82f6',
          colorLink: '#2563eb',
          borderRadius: 12,
          colorBgContainer: '#ffffff',
          colorBgLayout: '#f8fafc',
          colorBorder: '#e2e8f0',
          colorText: '#1e293b',
          colorTextSecondary: '#64748b',
        },
        algorithm: theme.defaultAlgorithm,
      }}
    >
      <AntdApp>
        <AppContent />
      </AntdApp>
    </ConfigProvider>
  )
}

export default App
