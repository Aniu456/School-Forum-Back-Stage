import {
  DeleteOutlined,
  EyeOutlined,
  HighlightOutlined,
  PushpinOutlined,
  StopOutlined,
} from '@ant-design/icons'
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
import type { Post } from '../types'

interface PostsPageProps {
  posts: Post[]
  onTogglePin: (postId: string) => void
  onToggleHidden: (postId: string) => void
  onDelete: (postId: string) => void
}

const { Option } = Select

const PostsPage: React.FC<PostsPageProps> = ({
  posts,
  onTogglePin,
  onToggleHidden,
  onDelete,
}) => {
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<'all' | Post['status']>('all')
  const [detailPost, setDetailPost] = useState<Post | null>(null)

  const filtered = useMemo(
    () =>
      posts.filter((post) => {
        const matchKeyword =
          post.title.toLowerCase().includes(keyword.toLowerCase()) ||
          post.tags.some((t) => t.includes(keyword)) ||
          post.author.toLowerCase().includes(keyword.toLowerCase())
        const matchStatus = status === 'all' ? true : post.status === status
        return matchKeyword && matchStatus
      }),
    [keyword, posts, status],
  )

  const handleDelete = (postId: string) => {
    Modal.confirm({
      title: '确认删除该帖子？',
      content: '删除后将从数据库物理删除，并同步隐藏其评论。',
      okButtonProps: { danger: true },
      onOk: () => {
        onDelete(postId)
        message.success('帖子已删除')
      },
    })
  }

  const renderStatus = (state: Post['status']) => {
    if (state === 'pinned') return <Tag color="gold">置顶</Tag>
    if (state === 'hidden') return <Tag color="red">隐藏</Tag>
    return <Tag color="blue">正常</Tag>
  }

  const columns: ColumnsType<Post> = [
    {
      title: '帖子',
      dataIndex: 'title',
      render: (_, record) => (
        <div>
          <div className="font-semibold text-slate-900">{record.title}</div>
          <Space wrap className="mt-1">
            {record.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </Space>
        </div>
      ),
    },
    {
      title: '作者',
      dataIndex: 'author',
    },
    {
      title: '分类',
      dataIndex: 'category',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
    },
    {
      title: '浏览/评论',
      render: (_, record) => (
        <Space>
          <Tag color="blue" bordered={false}>
            浏览 {record.views}
          </Tag>
          <Tag color="geekblue" bordered={false}>
            评论 {record.comments}
          </Tag>
        </Space>
      ),
    },
    {
      title: '热度',
      dataIndex: 'heat',
      sorter: (a, b) => a.heat - b.heat,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: renderStatus,
    },
    {
      title: '操作',
      dataIndex: 'actions',
      width: 260,
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} type="link" onClick={() => setDetailPost(record)}>
            详情
          </Button>
          <Button
            icon={<PushpinOutlined />}
            type="link"
            onClick={() => {
              onTogglePin(record.id)
              message.success(record.status === 'pinned' ? '已取消置顶' : '已置顶')
            }}
          >
            {record.status === 'pinned' ? '取消置顶' : '置顶'}
          </Button>
          <Button
            icon={record.status === 'hidden' ? <HighlightOutlined /> : <StopOutlined />}
            type="link"
            onClick={() => {
              onToggleHidden(record.id)
              message.success(record.status === 'hidden' ? '已取消隐藏' : '已隐藏')
            }}
          >
            {record.status === 'hidden' ? '取消隐藏' : '隐藏'}
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            type="link"
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
            帖子管理
          </Typography.Title>
          <Typography.Paragraph className="!mb-0 text-slate-600">
            可按作者、标签、状态筛选，支持置顶、隐藏、物理删除。
          </Typography.Paragraph>
        </div>
        <Space>
          <Input.Search
            allowClear
            placeholder="搜索标题 / 作者 / 标签"
            onSearch={setKeyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="min-w-[260px]"
          />
          <Select value={status} onChange={(v) => setStatus(v)} style={{ width: 140 }}>
            <Option value="all">全部状态</Option>
            <Option value="normal">正常</Option>
            <Option value="pinned">置顶</Option>
            <Option value="hidden">隐藏</Option>
          </Select>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        pagination={{ pageSize: 6 }}
        className="bg-white/80 rounded-2xl shadow-soft"
      />

      <Drawer
        open={!!detailPost}
        width={520}
        title={detailPost?.title}
        onClose={() => setDetailPost(null)}
      >
        {detailPost && (
          <Space direction="vertical" size={12} className="text-slate-700">
            <div>作者：{detailPost.author}</div>
            <div>分类：{detailPost.category}</div>
            <div>创建时间：{detailPost.createdAt}</div>
            <div>状态：{renderStatus(detailPost.status)}</div>
            <div>标签：{detailPost.tags.join('，')}</div>
            <div>摘要：{detailPost.summary}</div>
            <Space>
              <Tag color="blue" bordered={false}>
                浏览 {detailPost.views}
              </Tag>
              <Tag color="geekblue" bordered={false}>
                评论 {detailPost.comments}
              </Tag>
            </Space>
          </Space>
        )}
      </Drawer>
    </div>
  )
}

export default PostsPage
