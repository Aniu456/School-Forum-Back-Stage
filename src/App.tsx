import { App as AntdApp, ConfigProvider, theme } from "antd"
import { useState } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import "./App.css"
import AdminLayout from "./components/AdminLayout"
import AnnouncementsPage from "./pages/AnnouncementsPage"
import CommentsPage from "./pages/CommentsPage"
import LoginPage from "./pages/LoginPage"
import OverviewPage from "./pages/OverviewPage"
import PostsPage from "./pages/PostsPage"
import UsersPage from "./pages/UsersPage"
import { authService } from "./services"

const AppContent = () => {
  const { message } = AntdApp.useApp()

  const [isAuthed, setIsAuthed] = useState(() => authService.isAuthenticated())
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser())

  const handleLogin = (user: any) => {
    setCurrentUser(user)
    setIsAuthed(true)
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      setIsAuthed(false)
      setCurrentUser(null)
      message.info("已退出登录")
    } catch {
      message.error("退出登录失败")
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
          colorPrimary: "#3b82f6",
          colorInfo: "#3b82f6",
          colorLink: "#2563eb",
          borderRadius: 12,
          colorBgContainer: "#ffffff",
          colorBgLayout: "#f8fafc",
          colorBorder: "#e2e8f0",
          colorText: "#1e293b",
          colorTextSecondary: "#64748b",
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
