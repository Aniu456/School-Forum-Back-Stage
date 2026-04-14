import {
  DeleteOutlined,
  EyeOutlined,
  MailOutlined,
  SafetyOutlined,
  StopOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import {
  Avatar,
  Alert,
  Button,
  Divider,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  App,
  Spin,
  Tabs,
  List,
} from 'antd'
import { useEffect, useState, useCallback } from 'react'
import type { PaginationMeta, User, UserLoginHistory } from '../types'
import { userService } from '../services'
import { getAvatarSrc } from '../utils/avatar'

const { Option } = Select

const UsersPage: React.FC = () => {
  const { message } = App.useApp()

  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [keyword, setKeyword] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'banned'>('all')
  const [role, setRole] = useState<'all' | 'USER' | 'ADMIN'>('all')
  const [detailUser, setDetailUser] = useState<User | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [historyPage, setHistoryPage] = useState(1)
  const [historyMeta, setHistoryMeta] = useState<PaginationMeta | null>(null)
  const [loginHistory, setLoginHistory] = useState<UserLoginHistory[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<'' | 'role' | 'password' | 'post' | 'comment'>('')
  const [form] = Form.useForm()

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await userService.getUsers({
        page,
        limit: pageSize,
        isBanned: status === 'all' ? undefined : status === 'banned',
        role: role === 'all' ? undefined : role,
        keyword: searchKeyword || undefined,
      })
      setUsers(response.data)
      setTotal(response.meta.total)
    } catch (error: any) {
      message.error(error.response?.data?.message || '获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, status, role, searchKeyword, message])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    if (!detailUser) return
    const latest = users.find((u) => u.id === detailUser.id)
    if (latest && latest !== detailUser) {
      setDetailUser(latest)
      form.setFieldsValue({ role: latest.role })
    }
  }, [users, detailUser, form])

  const handleSearch = () => {
    setSearchKeyword(keyword)
    setPage(1)
  }

  const handleToggleBan = async (user: User) => {
    try {
      if (user.isBanned) {
        await userService.unbanUser(user.id)
        message.success('已解封用户')
      } else {
        await userService.banUser(user.id, '违反社区规定')
        message.success('已封禁用户')
      }
      fetchUsers()
    } catch (error: any) {
      message.error(error.response?.data?.message || '操作失败')
    }
  }

  const handleDelete = (userId: string) => {
    Modal.confirm({
      title: '确认删除该用户？',
      content: '删除后该用户的帖子与评论也会一并删除，此操作不可恢复。',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await userService.deleteUser(userId)
          message.success('用户已删除')
          fetchUsers()
          setDetailUser(null)
        } catch (error: any) {
          message.error(error.response?.data?.message || '删除失败')
        }
      },
    })
  }

  const fetchLoginHistory = useCallback(
    async (userId: string, currentPage = historyPage) => {
      try {
        setHistoryLoading(true)
        const response = await userService.getLoginHistory(userId, { page: currentPage, limit: 10 })
        setLoginHistory(response.data)
        setHistoryMeta(response.meta)
      } catch (error: any) {
        message.error(error.response?.data?.message || '获取登录历史失败')
      } finally {
        setHistoryLoading(false)
      }
    },
    [historyPage, message]
  )

  useEffect(() => {
    if (detailUser) {
      fetchLoginHistory(detailUser.id, historyPage)
    } else {
      setLoginHistory([])
      setHistoryPage(1)
    }
  }, [detailUser, historyPage, fetchLoginHistory])

  const handleResetPassword = async () => {
    if (!detailUser) return
    const newPassword = form.getFieldValue('newPassword')
    if (!newPassword) {
      message.warning('请输入新密码')
      return
    }
    setActionLoading('password')
    try {
      await userService.resetPassword(detailUser.id, newPassword)
      message.success('密码已重置')
      form.resetFields(['newPassword'])
    } catch (error: any) {
      message.error(error.response?.data?.message || '重置密码失败')
    } finally {
      setActionLoading('')
    }
  }

  const handleChangeRole = async () => {
    if (!detailUser) return
    const role = form.getFieldValue('role')
    if (!role) {
      message.warning('请选择角色')
      return
    }
    setActionLoading('role')
    try {
      await userService.changeRole(detailUser.id, role)
      message.success('角色已更新')
      fetchUsers()
    } catch (error: any) {
      message.error(error.response?.data?.message || '更新角色失败')
    } finally {
      setActionLoading('')
    }
  }

  const handleTogglePostPermission = async () => {
    if (!detailUser) return
    setActionLoading('post')
    try {
      const newCanPost = !detailUser.canPost
      const currentCanComment = detailUser.canComment !== false
      await userService.togglePostPermission(detailUser.id, newCanPost, currentCanComment)
      message.success(newCanPost ? '已允许发帖' : '已禁止发帖')
      fetchUsers()
    } catch (error: any) {
      message.error(error.response?.data?.message || '操作失败')
    } finally {
      setActionLoading('')
    }
  }

  const handleToggleCommentPermission = async () => {
    if (!detailUser) return
    setActionLoading('comment')
    try {
      const newCanComment = !detailUser.canComment
      const currentCanPost = detailUser.canPost !== false
      await userService.toggleCommentPermission(detailUser.id, newCanComment, currentCanPost)
      message.success(newCanComment ? '已允许评论' : '已禁止评论')
      fetchUsers()
    } catch (error: any) {
      message.error(error.response?.data?.message || '操作失败')
    } finally {
      setActionLoading('')
    }
  }

  const columns: ColumnsType<User> = [
    {
      title: '用户',
      dataIndex: 'username',
      render: (_, record) => (
        <Space align="center">
          <Avatar src={getAvatarSrc(record.nickname || record.username, record.avatar)} />
          <div>
            <div className="font-semibold text-slate-900">{record.nickname || record.username}</div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <MailOutlined /> {record.email}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      render: (role: string) => (
        <Tag color={role === 'ADMIN' ? 'gold' : 'blue'} bordered={false}>
          {role === 'ADMIN' ? '管理员' : '用户'}
        </Tag>
      ),
    },
    {
      title: '内容',
      render: (_, record) => (
        <Space size={8} className="text-slate-700">
          <Tag color="blue" bordered={false}>
            帖子 {record.postCount}
          </Tag>
          <Tag color="geekblue" bordered={false}>
            评论 {record.commentCount}
          </Tag>
          <Tag color="cyan" bordered={false}>
            粉丝 {record.followerCount}
          </Tag>
        </Space>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '状态',
      dataIndex: 'isBanned',
      render: (isBanned: boolean) => (
        <Tag color={isBanned ? 'red' : 'green'} bordered={false}>
          {isBanned ? '封禁' : '正常'}
        </Tag>
      ),
    },
    {
      title: '操作',
      dataIndex: 'actions',
      width: 220,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            type="link"
            onClick={() => {
              setDetailUser(record)
              form.setFieldsValue({ role: record.role })
              setHistoryPage(1)
            }}
          >
            详情
          </Button>
          <Button
            icon={record.isBanned ? <SafetyOutlined /> : <StopOutlined />}
            type="link"
            onClick={() => handleToggleBan(record)}
          >
            {record.isBanned ? '解封' : '封禁'}
          </Button>
          <Button
            icon={<DeleteOutlined />}
            type="link"
            danger
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <Typography.Title level={3} className="mb-1! text-slate-900">
            用户管理
          </Typography.Title>
          <Typography.Paragraph className="mb-0! text-slate-600">
            支持搜索、封禁/解封、物理删除，满足设计文档的后台管理要求。
          </Typography.Paragraph>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchUsers}>
            刷新
          </Button>
          <Input.Search
            allowClear
            placeholder="按姓名 / 邮箱搜索"
            value={keyword}
            onSearch={handleSearch}
            onChange={(e) => {
              setKeyword(e.target.value)
              if (!e.target.value) {
                setSearchKeyword('')
                setPage(1)
              }
            }}
            className="min-w-[260px]"
          />
          <Select value={role} onChange={(v) => {
            setRole(v)
            setPage(1)
          }} style={{ width: 120 }}>
            <Option value="all">全部角色</Option>
            <Option value="USER">用户</Option>
            <Option value="ADMIN">管理员</Option>
          </Select>
          <Select value={status} onChange={(v) => {
            setStatus(v)
            setPage(1)
          }} style={{ width: 140 }}>
            <Option value="all">全部状态</Option>
            <Option value="active">正常</Option>
            <Option value="banned">封禁</Option>
          </Select>
        </Space>
      </div>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          bordered={false}
          pagination={{
            current: page,
            pageSize: pageSize,
            total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPage(page)
              setPageSize(pageSize)
            },
          }}
          className="bg-white/80 rounded-2xl shadow-soft"
        />
      </Spin>

      <Modal
        open={!!detailUser}
        title="用户详情"
        onCancel={() => setDetailUser(null)}
        footer={null}
        width={720}
      >
        {detailUser && (
          <Tabs
            items={[
              {
                key: 'profile',
                label: '基本信息',
                children: (
                  <div className="space-y-4 text-slate-700">
                    <div className="flex items-center gap-3">
                      <Avatar size={60} src={getAvatarSrc(detailUser.nickname || detailUser.username, detailUser.avatar)} />
                      <div>
                        <div className="font-semibold text-lg text-slate-900">
                          {detailUser.nickname || detailUser.username}
                        </div>
                        <div className="text-sm text-slate-500">{detailUser.email}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>用户名：{detailUser.username}</div>
                      <div>角色：{detailUser.role === 'ADMIN' ? '管理员' : '用户'}</div>
                      <div>状态：{detailUser.isBanned ? '已封禁' : '正常'}</div>
                      <div>激活：{detailUser.isActive ? '已激活' : '未激活'}</div>
                      <div>发帖权限：{detailUser.canPost === false ? '禁止' : '允许'}</div>
                      <div>评论权限：{detailUser.canComment === false ? '禁止' : '允许'}</div>
                      <div>注册时间：{new Date(detailUser.createdAt).toLocaleString('zh-CN')}</div>
                      <div>最近登录：{detailUser.lastLoginAt ? new Date(detailUser.lastLoginAt).toLocaleString('zh-CN') : '暂无'}</div>
                      <div>帖子数量：{detailUser.postCount}</div>
                      <div>评论数量：{detailUser.commentCount}</div>
                      <div>粉丝数量：{detailUser.followerCount}</div>
                      <div>关注数量：{detailUser.followingCount}</div>
                    </div>
                    <Divider />
                    <Alert
                      showIcon
                      type="info"
                      message="编辑用户"
                      description="支持重置密码、调整角色、切换发帖与评论权限。操作立即生效。"
                    />
                    <Form form={form} layout="vertical" initialValues={{ role: detailUser.role }}>
                      <Form.Item label="重置密码" name="newPassword">
                        <Input.Password placeholder="输入新密码" />
                      </Form.Item>
                      <Button
                        type="primary"
                        onClick={handleResetPassword}
                        loading={actionLoading === 'password'}
                        block
                      >
                        重置密码
                      </Button>
                      <Divider />
                      <Form.Item label="角色" name="role">
                        <Select>
                          <Option value="ADMIN">管理员</Option>
                          <Option value="USER">用户</Option>
                        </Select>
                      </Form.Item>
                      <Button
                        type="primary"
                        onClick={handleChangeRole}
                        loading={actionLoading === 'role'}
                        block
                      >
                        更新角色
                      </Button>
                      <Divider />
                      <Space wrap>
                        <Button
                          onClick={handleTogglePostPermission}
                          loading={actionLoading === 'post'}
                        >
                          {detailUser.canPost === false ? '允许发帖' : '禁止发帖'}
                        </Button>
                        <Button
                          onClick={handleToggleCommentPermission}
                          loading={actionLoading === 'comment'}
                        >
                          {detailUser.canComment === false ? '允许评论' : '禁止评论'}
                        </Button>
                        <Button
                          danger={detailUser.isBanned}
                          type="primary"
                          ghost
                          onClick={() => handleToggleBan(detailUser)}
                        >
                          {detailUser.isBanned ? '解封用户' : '封禁用户'}
                        </Button>
                      </Space>
                    </Form>
                  </div>
                ),
              },
              {
                key: 'login',
                label: '登录历史',
                children: (
                  <div className="space-y-3">
                      <List
                      loading={historyLoading}
                      dataSource={loginHistory}
                      locale={{ emptyText: '暂无登录记录' }}
                      renderItem={(item) => (
                        <List.Item>
                          <div className="w-full">
                            <div className="font-medium text-slate-900">
                              {item.loginIp || item.ipAddress || '未知 IP'}
                            </div>
                            <div className="text-sm text-slate-600">
                              {item.loginTime
                                ? new Date(item.loginTime).toLocaleString('zh-CN')
                                : item.createdAt
                                  ? new Date(item.createdAt).toLocaleString('zh-CN')
                                  : '未知时间'}
                            </div>
                            <div className="text-xs text-slate-500">
                              {item.device || item.userAgent || '未知设备'}
                            </div>
                          </div>
                        </List.Item>
                      )}
                    />
                    {historyMeta && (
                      <div className="flex justify-end">
                        <Space>
                          <Button
                            size="small"
                            disabled={historyPage <= 1}
                            onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                          >
                            上一页
                          </Button>
                          <span className="text-sm text-slate-600">
                            第 {historyPage} / {historyMeta.totalPages} 页
                          </span>
                          <Button
                            size="small"
                            disabled={historyPage >= historyMeta.totalPages}
                            onClick={() => setHistoryPage((p) => p + 1)}
                          >
                            下一页
                          </Button>
                        </Space>
                      </div>
                    )}
                  </div>
                ),
              },
            ]}
          />
        )}
      </Modal>
    </div>
  )
}

export default UsersPage
