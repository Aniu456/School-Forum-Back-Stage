import {
  DeleteOutlined,
  EyeOutlined,
  MailOutlined,
  SafetyOutlined,
  StopOutlined,
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
  message,
} from 'antd'
import { useMemo, useState } from 'react'
import type { User } from '../types'

interface UsersPageProps {
  users: User[]
  onToggleBan: (userId: string) => void
  onDelete: (userId: string) => void
}

const { Option } = Select

const UsersPage: React.FC<UsersPageProps> = ({ users, onToggleBan, onDelete }) => {
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'banned'>('all')
  const [detailUser, setDetailUser] = useState<User | null>(null)

  const filtered = useMemo(
    () =>
      users.filter((user) => {
        const matchKeyword =
          user.name.toLowerCase().includes(keyword.toLowerCase()) ||
          user.email.toLowerCase().includes(keyword.toLowerCase()) ||
          user.tags.some((t) => t.includes(keyword))
        const matchStatus = status === 'all' ? true : user.status === status
        return matchKeyword && matchStatus
      }),
    [keyword, status, users],
  )

  const handleDelete = (userId: string) => {
    Modal.confirm({
      title: '确认删除该用户？',
      content: '删除后该用户的帖子与评论也会一并隐藏/删除。',
      okButtonProps: { danger: true },
      onOk: () => {
        onDelete(userId)
        message.success('用户已删除')
      },
    })
  }

  const columns: ColumnsType<User> = [
    {
      title: '用户',
      dataIndex: 'name',
      render: (_, record) => (
        <Space align="center">
          <Avatar src={record.avatar} />
          <div>
            <div className="font-semibold text-slate-900">{record.name}</div>
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
        <Tag color={role === 'admin' ? 'gold' : 'blue'} bordered={false}>
          {role}
        </Tag>
      ),
    },
    {
      title: '内容',
      render: (_, record) => (
        <Space size={8} className="text-slate-700">
          <Tag color="blue" bordered={false}>
            帖子 {record.posts}
          </Tag>
          <Tag color="geekblue" bordered={false}>
            评论 {record.comments}
          </Tag>
          <Tag color="cyan" bordered={false}>
            粉丝 {record.followers}
          </Tag>
        </Space>
      ),
    },
    {
      title: '加入时间',
      dataIndex: 'joinedAt',
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (state: User['status']) => (
        <Tag color={state === 'active' ? 'green' : 'red'} bordered={false}>
          {state === 'active' ? '正常' : '封禁'}
        </Tag>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      render: (tags: string[]) => (
        <Space wrap>
          {tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </Space>
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
            icon={record.status === 'banned' ? <SafetyOutlined /> : <StopOutlined />}
            type="link"
            onClick={() => {
              onToggleBan(record.id)
              message.success(record.status === 'banned' ? '已解封' : '已封禁')
            }}
          >
            {record.status === 'banned' ? '解封' : '封禁'}
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
          <Typography.Title level={3} className="!mb-1 text-slate-900">
            用户管理
          </Typography.Title>
          <Typography.Paragraph className="!mb-0 text-slate-600">
            支持搜索、封禁/解封、物理删除，满足设计文档的后台管理要求。
          </Typography.Paragraph>
        </div>
        <Space>
          <Input.Search
            allowClear
            placeholder="按姓名 / 邮箱 / 标签搜索"
            onSearch={setKeyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="min-w-[260px]"
          />
          <Select value={status} onChange={(v) => setStatus(v)} style={{ width: 140 }}>
            <Option value="all">全部状态</Option>
            <Option value="active">正常</Option>
            <Option value="banned">封禁</Option>
          </Select>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        bordered={false}
        pagination={{ pageSize: 6 }}
        className="bg-white/80 rounded-2xl shadow-soft"
      />

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
                <div className="font-semibold text-slate-900">{detailUser.name}</div>
                <div className="text-sm text-slate-500">{detailUser.email}</div>
              </div>
            </Space>
            <div>角色：{detailUser.role}</div>
            <div>加入：{detailUser.joinedAt}</div>
            <div>最后活跃：{detailUser.lastActive}</div>
            <div>简介：{detailUser.bio}</div>
            <div>
              标签：
              <Space wrap>
                {detailUser.tags.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </Space>
            </div>
          </Space>
        )}
      </Modal>
    </div>
  )
}

export default UsersPage
