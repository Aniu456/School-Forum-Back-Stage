import {
  BellOutlined,
  CommentOutlined,
  DashboardOutlined,
  FileTextOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  NotificationOutlined,
  UserOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { Avatar, Badge, Breadcrumb, Button, Layout, Menu, Space, Tag, Tooltip } from 'antd'
import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

const { Header, Sider, Content } = Layout

const navItems: MenuProps['items'] = [
  {
    key: '/overview',
    icon: <DashboardOutlined />,
    label: '数据总览',
  },
  {
    key: '/users',
    icon: <UserOutlined />,
    label: '用户管理',
  },
  {
    key: '/posts',
    icon: <FileTextOutlined />,
    label: '帖子管理',
  },
  {
    key: '/comments',
    icon: <CommentOutlined />,
    label: '评论管理',
  },
  {
    key: '/announcements',
    icon: <NotificationOutlined />,
    label: '公告管理',
  },
]

interface AdminLayoutProps {
  onLogout: () => void
  currentUser: {
    id: string
    username: string
    email: string
    nickname: string
    avatar: string
    role: string
  } | null
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ onLogout, currentUser }) => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const selectedKey = location.pathname === '/' ? '/overview' : location.pathname

  const siderWidth = collapsed ? 80 : 240
  const headerHeight = 72

  // 根据路由生成面包屑
  const getBreadcrumbs = () => {
    const pathMap: Record<string, string> = {
      '/overview': '数据总览',
      '/users': '用户管理',
      '/posts': '帖子管理',
      '/comments': '评论管理',
      '/announcements': '公告管理',
    }

    const currentPath = location.pathname
    const pageName = pathMap[currentPath] || '数据总览'

    return [
      {
        title: (
          <span className="flex items-center gap-1">
            <HomeOutlined />
            <span>首页</span>
          </span>
        ),
      },
      {
        title: pageName,
      },
    ]
  }

  return (
    <Layout
      className="bg-slate-50"
      style={{ minHeight: '100vh', overflow: 'hidden' }}
    >
      <Sider
        trigger={null}
        collapsed={collapsed}
        width={240}
        className="bg-white! border-r border-slate-200/60"
        style={{ position: 'fixed', left: 0, top: 0, bottom: 0, height: '100vh', zIndex: 30 }}
      >
        <div className="flex items-center h-16 px-4 gap-3 text-slate-800 font-semibold tracking-tight border-b border-slate-200/60">
          <div className="h-10 w-10 rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-lg text-white shadow-md">
            SF
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-sm uppercase text-slate-500 tracking-[0.08em]">
                Campus Admin
              </div>
              <div className="text-lg text-blue-600">School Forum</div>
            </div>
          )}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={navItems}
          onClick={({ key }) => navigate(String(key))}
          className="bg-transparent! border-0! mt-4"
        />
        {!collapsed && (
          <div className="px-4 pt-6">
            <div className="rounded-2xl bg-blue-50/80 border border-blue-200/50 p-3">
              <div className="flex items-center justify-between mb-2 text-xs uppercase tracking-wide text-slate-600">
                系统状态
                <Tag color="blue" bordered={false} className="m-0">
                  正常
                </Tag>
              </div>
              <div className="text-sm leading-6 text-slate-700">
                今日执行 128 条内容审核，0 条失败。
              </div>
            </div>
          </div>
        )}
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed((v) => !v)}
            className="w-full"
          >
            {!collapsed && <span className="text-slate-600">收起菜单</span>}
          </Button>
        </div>
      </Sider>
      <Layout
        className="bg-transparent"
        style={{
          marginLeft: siderWidth,
          transition: 'margin 0.2s',
          height: '100vh',
          overflow: 'hidden',
          background: '#f8fafc',
        }}
      >
        <Header
          className="sticky top-0 z-20 bg-white! backdrop-blur-sm border-b border-slate-200/80 shadow-sm"
          style={{ height: headerHeight, lineHeight: `${headerHeight}px`, padding: 0 }}
        >
          <div className="w-full flex items-center justify-between gap-4 pl-4 pr-6 h-full">
            <Breadcrumb items={getBreadcrumbs()} />
            <div className="flex items-center gap-3">
              <Tooltip title="消息提醒">
                <Badge count={6} size="small" offset={[-2, 6]}>
                  <Button shape="circle" icon={<BellOutlined />} />
                </Badge>
              </Tooltip>
              <Button type="primary" ghost onClick={() => navigate('/announcements')}>
                发布公告
              </Button>
              <Space size={10} className="pl-4 border-l border-slate-200">
                <Avatar src={currentUser?.avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=admin'} />
                <div className="leading-tight">
                  <div className="font-semibold text-slate-900">{currentUser?.nickname || currentUser?.username || 'Admin'}</div>
                  <div className="text-xs text-slate-500">{currentUser?.role === 'ADMIN' ? '超级管理员' : '管理员'}</div>
                </div>
                <Tooltip title="退出登录">
                  <Button
                    type="text"
                    icon={<LogoutOutlined />}
                    onClick={onLogout}
                    className="text-red-500"
                  />
                </Tooltip>
              </Space>
            </div>
          </div>
        </Header>
        <Content
          className="p-3 md:p-4 lg:p-6"
          style={{
            height: `calc(100vh - ${headerHeight}px)`,
            overflowY: 'auto',
          }}
        >
          <div className="mx-auto max-w-[1400px] w-full space-y-3 pb-6">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
