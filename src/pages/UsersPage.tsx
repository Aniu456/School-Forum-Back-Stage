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
  Button,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  App,
  Spin,
} from 'antd'
import { useEffect, useMemo, useState } from 'react'
import type { User } from '../types'
import { userService } from '../services'

const { Option } = Select

const UsersPage: React.FC = () => {
  const { message } = App.useApp()

  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'banned'>('all')
  const [detailUser, setDetailUser] = useState<User | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchUsers()
  }, [page, pageSize, status])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await userService.getUsers({
        page,
        limit: pageSize,
        isBanned: status === 'all' ? undefined : status === 'banned',
      })
      setUsers(response.data)
      setTotal(response.meta.total)
    } catch (error: any) {
      message.error(error.response?.data?.message || '获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(
    () =>
      users.filter((user) => {
        if (!keyword) return true
        const lowerKeyword = keyword.toLowerCase()
        return (
          user.username.toLowerCase().includes(lowerKeyword) ||
          user.email.toLowerCase().includes(lowerKeyword) ||
          user.nickname.toLowerCase().includes(lowerKeyword)
        )
      }),
    [keyword, users]
  )

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
        } catch (error: any) {
          message.error(error.response?.data?.message || '删除失败')
        }
      },
    })
  }

  const columns: ColumnsType<User> = [
    {
      title: '用户',
      dataIndex: 'username',
      render: (_, record) => (
        <Space align="center">
          <Avatar src={record.avatar} />
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
          <Button icon={<EyeOutlined />} type="link" onClick={() => setDetailUser(record)}>
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
            onSearch={setKeyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="min-w-[260px]"
          />
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
          dataSource={filtered}
          rowKey="id"
          bordered={false}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: keyword ? filtered.length : total,
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
      >
        {detailUser && (
          <Space direction="vertical" size={12} className="w-full text-slate-700">
            <Space align="center" size={12}>
              <Avatar size={48} src={detailUser.avatar} />
              <div>
                <div className="font-semibold text-slate-900">
                  {detailUser.nickname || detailUser.username}
                </div>
                <div className="text-sm text-slate-500">{detailUser.email}</div>
              </div>
            </Space>
            <div>用户名：{detailUser.username}</div>
            <div>角色：{detailUser.role === 'ADMIN' ? '管理员' : '用户'}</div>
            <div>注册时间：{new Date(detailUser.createdAt).toLocaleString('zh-CN')}</div>
            <div>状态：{detailUser.isBanned ? '已封禁' : '正常'}</div>
            <div>激活状态：{detailUser.isActive ? '已激活' : '未激活'}</div>
            <div>帖子数量：{detailUser.postCount}</div>
            <div>评论数量：{detailUser.commentCount}</div>
            <div>粉丝数量：{detailUser.followerCount}</div>
            <div>关注数量：{detailUser.followingCount}</div>
          </Space>
        )}
      </Modal>
    </div>
  )
}

export default UsersPage
