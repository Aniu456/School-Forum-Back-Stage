import { DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import {
  Button,
  Drawer,
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
import type { Comment } from '../types'

interface CommentsPageProps {
  comments: Comment[]
  onDelete: (ids: string[]) => void
}

const { Option } = Select

const CommentsPage: React.FC<CommentsPageProps> = ({ comments, onDelete }) => {
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<'all' | Comment['status']>('all')
  const [detail, setDetail] = useState<Comment | null>(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  const filtered = useMemo(
    () =>
      comments.filter((comment) => {
        const matchKeyword =
          comment.content.toLowerCase().includes(keyword.toLowerCase()) ||
          comment.author.toLowerCase().includes(keyword.toLowerCase()) ||
          comment.postTitle.toLowerCase().includes(keyword.toLowerCase())
        const matchStatus = status === 'all' ? true : comment.status === status
        return matchKeyword && matchStatus
      }),
    [comments, keyword, status],
  )

  const handleDelete = (ids: string[]) => {
    if (!ids.length) return
    Modal.confirm({
      title: `确认删除选中的 ${ids.length} 条评论？`,
      content: '删除后不会再出现在前台任何位置。',
      okButtonProps: { danger: true },
      onOk: () => {
        onDelete(ids)
        setSelectedRowKeys([])
        message.success('评论已删除')
      },
    })
  }

  const columns: ColumnsType<Comment> = [
    {
      title: '评论内容',
      dataIndex: 'content',
      render: (_, record) => (
        <div>
          <div className="font-semibold text-slate-900">{record.content}</div>
          <div className="text-xs text-slate-500 mt-1">发表于 {record.createdAt}</div>
        </div>
      ),
    },
    {
      title: '作者',
      dataIndex: 'author',
    },
    {
      title: '所属帖子',
      dataIndex: 'postTitle',
      render: (title: string) => <span className="text-blue-700">{title}</span>,
    },
    {
      title: '点赞',
      dataIndex: 'likes',
      sorter: (a, b) => a.likes - b.likes,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (state: Comment['status']) => (
        <Tag color={state === 'removed' ? 'red' : 'green'} bordered={false}>
          {state === 'removed' ? '已删除' : '正常'}
        </Tag>
      ),
    },
    {
      title: '操作',
      dataIndex: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => setDetail(record)}>
            详情
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete([record.id])}
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
            评论管理
          </Typography.Title>
          <Typography.Paragraph className="!mb-0 text-slate-600">
            支持按帖子、作者筛选，单条或批量删除（物理删除）。
          </Typography.Paragraph>
        </div>
        <Space>
          <Input.Search
            allowClear
            placeholder="搜索内容 / 作者 / 帖子"
            onSearch={setKeyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="min-w-[260px]"
          />
          <Select value={status} onChange={(v) => setStatus(v)} style={{ width: 140 }}>
            <Option value="all">全部状态</Option>
            <Option value="visible">正常</Option>
            <Option value="removed">已删除</Option>
          </Select>
        </Space>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-slate-500 text-sm">
          已选择 {selectedRowKeys.length} 条，可批量删除。
        </div>
        <Button danger type="primary" onClick={() => handleDelete(selectedRowKeys as string[])}>
          批量删除
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filtered}
        pagination={{ pageSize: 6 }}
        className="bg-white/80 rounded-2xl shadow-soft"
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
      />

      <Drawer
        open={!!detail}
        width={480}
        title="评论详情"
        onClose={() => setDetail(null)}
      >
        {detail && (
          <Space direction="vertical" size={12} className="text-slate-700">
            <div className="font-semibold text-slate-900">{detail.content}</div>
            <div>作者：{detail.author}</div>
            <div>帖子：{detail.postTitle}</div>
            <div>时间：{detail.createdAt}</div>
            <div>点赞：{detail.likes}</div>
            <div>
              状态：
              <Tag color={detail.status === 'removed' ? 'red' : 'green'} bordered={false}>
                {detail.status === 'removed' ? '已删除' : '正常'}
              </Tag>
            </div>
          </Space>
        )}
      </Drawer>
    </div>
  )
}

export default CommentsPage
