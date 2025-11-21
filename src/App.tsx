import { ConfigProvider, App as AntdApp, theme } from 'antd'
import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import LoginPage from './pages/LoginPage'
import OverviewPage from './pages/OverviewPage'
import UsersPage from './pages/UsersPage'
import PostsPage from './pages/PostsPage'
import CommentsPage from './pages/CommentsPage'
import AnnouncementsPage from './pages/AnnouncementsPage'
import { mockAnnouncements, mockComments, mockPosts, mockUsers } from './mockData'
import type { Announcement, Comment, Post, User } from './types'
import './App.css'

const ADMIN_KEY = 'CAMPUS-ADMIN-2025'

const AppContent = () => {
  const { message } = AntdApp.useApp()

  const [isAuthed, setIsAuthed] = useState(
    () => window.localStorage.getItem('adminAuthed') === 'true',
  )
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [posts, setPosts] = useState<Post[]>(mockPosts)
  const [comments, setComments] = useState<Comment[]>(mockComments)
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements)

  const login = (key: string) => {
    if (key.trim() === ADMIN_KEY) {
      setIsAuthed(true)
      window.localStorage.setItem('adminAuthed', 'true')
      message.success('登录成功，欢迎进入后台管理端')
      return true
    }
    message.error('密钥不正确，请确认 ADMIN_REGISTRATION_KEY')
    return false
  }

  const logout = () => {
    setIsAuthed(false)
    window.localStorage.removeItem('adminAuthed')
    message.info('已退出登录')
  }

  const toggleUserBan = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: u.status === 'active' ? 'banned' : 'active' } : u,
      ),
    )
  }

  const deleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId))
    setPosts((prev) => prev.filter((p) => p.authorId !== userId))
    setComments((prev) => prev.filter((c) => c.authorId !== userId))
  }

  const togglePostPin = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, status: p.status === 'pinned' ? 'normal' : 'pinned' } : p)),
    )
  }

  const togglePostHidden = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, status: p.status === 'hidden' ? 'normal' : 'hidden' } : p)),
    )
  }

  const deletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId))
    setComments((prev) => prev.filter((c) => c.postId !== postId))
  }

  const deleteComments = (ids: string[]) => {
    setComments((prev) => prev.filter((c) => !ids.includes(c.id)))
  }

  const saveAnnouncement = (
    payload: Omit<Announcement, 'createdAt' | 'updatedAt'> & { id?: string },
  ) => {
    const now = new Date().toISOString().slice(0, 10)
    setAnnouncements((prev) => {
      if (payload.id) {
        return prev.map((a) =>
          a.id === payload.id ? { ...a, ...payload, updatedAt: now } : a,
        )
      }
      const newAnnouncement: Announcement = {
        ...payload,
        id: `a${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      }
      return [newAnnouncement, ...prev]
    })
  }

  const deleteAnnouncements = (ids: string[]) => {
    setAnnouncements((prev) => prev.filter((a) => !ids.includes(a.id)))
  }

  return (
    <BrowserRouter>
      {isAuthed ? (
        <Routes>
          <Route element={<AdminLayout onLogout={logout} />}>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route
              path="/overview"
              element={
                <OverviewPage
                  users={users}
                  posts={posts}
                  comments={comments}
                  announcements={announcements}
                />
              }
            />
            <Route
              path="/users"
              element={
                <UsersPage users={users} onToggleBan={toggleUserBan} onDelete={deleteUser} />
              }
            />
            <Route
              path="/posts"
              element={
                <PostsPage
                  posts={posts}
                  onTogglePin={togglePostPin}
                  onToggleHidden={togglePostHidden}
                  onDelete={deletePost}
                />
              }
            />
            <Route
              path="/comments"
              element={<CommentsPage comments={comments} onDelete={deleteComments} />}
            />
            <Route
              path="/announcements"
              element={
                <AnnouncementsPage
                  announcements={announcements}
                  onSave={saveAnnouncement}
                  onDelete={deleteAnnouncements}
                />
              }
            />
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Route>
        </Routes>
      ) : (
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={login} />} />
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
