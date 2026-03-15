import { DeleteOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import {
  Avatar,
  Button,
  Drawer,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  App,
  Spin,
} from 'antd'
import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import DOMPurify from 'dompurify'
import type { Comment } from '../types'
import { commentService } from '../services'

const CommentsPage: React.FC = () => {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [loading, setLoading] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [keyword, setKeyword] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [authorId, setAuthorId] = useState('')
  const [postId, setPostId] = useState('')
  const [detail, setDetail] = useState<Comment | null>(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true)
      const response = await commentService.getComments({
        page,
        limit: pageSize,
        keyword: searchKeyword || undefined,
        authorId: authorId || undefined,
        postId: postId || undefined,
      })
      setComments(response.data)
      setTotal(response.meta.total)
    } catch (error: any) {
      message.error(error.response?.data?.message || '获取评论列表失败')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchKeyword, authorId, postId, message])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  useEffect(() => {
    const pid = searchParams.get('postId')
    if (pid) {
      setPostId(pid)
      setPage(1)
    }
    const aid = searchParams.get('authorId')
    if (aid) {
      setAuthorId(aid)
      setPage(1)
    }
  }, [searchParams])

  const handleSearch = () => {
    setPage(1)
    setSearchKeyword(keyword)
  }

  const handleResetFilters = () => {
    setKeyword('')
    setSearchKeyword('')
    setAuthorId('')
    setPostId('')
    setPage(1)
  }

  const handleDelete = (commentId: string) => {
    Modal.confirm({
      title: '确认删除该评论？',
      content: '删除后将从数据库物理删除，此操作不可恢复。',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await commentService.deleteComment(commentId)
          message.success('评论已删除')
          fetchComments()
        } catch (error: any) {
          message.error(error.response?.data?.message || '删除失败')
        }
      },
    })
  }

  const handleBulkDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的评论')
      return
    }

    Modal.confirm({
      title: `确认删除选中的 ${selectedRowKeys.length} 条评论？`,
      content: '批量删除后将从数据库物理删除，此操作不可恢复。',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await commentService.bulkDelete(selectedRowKeys)
          message.success(`已删除 ${selectedRowKeys.length} 条评论`)
          setSelectedRowKeys([])
          fetchComments()
        } catch (error: any) {
          message.error(error.response?.data?.message || '批量删除失败')
        }
      },
    })
  }

  const columns: ColumnsType<Comment> = [
    {
      title: '评论内容',
      dataIndex: 'content',
      width: 400,
      render: (content: string, record) => (
        <div>
          {/* 🛡️ 使用 DOMPurify 净化 HTML，防止 XSS 攻击 */}
          <div
            className="text-slate-900 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
          />
          <div className="text-xs text-slate-500 mt-1">
            发表于 {new Date(record.createdAt).toLocaleString('zh-CN')}
          </div>
        </div>
      ),
    },
    {
      title: '作者',
      dataIndex: 'author',
      render: (author: Comment['author']) => (
        <Space align="center">
          <Avatar size={32} src={author.avatar} />
          <div>
            <div className="font-medium text-slate-900">{author.nickname || author.username}</div>
            <div className="text-xs text-slate-500">@{author.username}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '所属帖子',
      dataIndex: 'postTitle',
      render: (_: string, record) => {
        const title = record.postTitle || record.post?.title || record.postId || '未知帖子'
        return (
          <Button
            type="link"
            className="px-0"
            onClick={() => {
              if (record.postId) {
                navigate(`/posts?postId=${record.postId}`)
              }
            }}
          >
            {title}
          </Button>
        )
      },
    },
    {
      title: '点赞',
      dataIndex: 'likeCount',
      sorter: (a, b) => a.likeCount - b.likeCount,
      render: (count: number) => (
        <Tag color="blue" bordered={false}>
          {count}
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
            评论管理
          </Typography.Title>
          <Typography.Paragraph className="mb-0! text-slate-600">
            支持按帖子、作者筛选，单条或批量删除（物理删除）。
          </Typography.Paragraph>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchComments}>
            刷新
          </Button>
          {selectedRowKeys.length > 0 && (
            <Button danger icon={<DeleteOutlined />} onClick={handleBulkDelete}>
              批量删除 ({selectedRowKeys.length})
            </Button>
          )}
        </Space>
      </div>

      <div className="flex gap-3">
        <Input.Search
          allowClear
          placeholder="搜索内容 / 作者 / 帖子"
          value={keyword}
          onSearch={handleSearch}
          onChange={(e) => {
            setKeyword(e.target.value)
            if (!e.target.value) {
              setSearchKeyword('')
              setPage(1)
            }
          }}
          className="flex-1"
        />
        <Input
          allowClear
          placeholder="作者ID"
          value={authorId}
          onChange={(e) => {
            setAuthorId(e.target.value)
            setPage(1)
          }}
          style={{ width: 160 }}
        />
        <Input
          allowClear
          placeholder="帖子ID"
          value={postId}
          onChange={(e) => {
            setPostId(e.target.value)
            setPage(1)
          }}
          style={{ width: 160 }}
        />
        <Button onClick={handleResetFilters}>清空筛选</Button>
      </div>

      <Spin spinning={loading}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={comments}
          bordered={false}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys as string[]),
          }}
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

      <Drawer
        open={!!detail}
        width={520}
        title="评论详情"
        onClose={() => setDetail(null)}
      >
        {detail && (
          <Space direction="vertical" size={16} className="w-full">
            <div>
              <div className="text-sm text-slate-500 mb-1">评论内容</div>
              <div
                className="text-slate-900"
                dangerouslySetInnerHTML={{ __html: detail.content }}
              />
            </div>
            <div>
              <div className="text-sm text-slate-500 mb-1">作者</div>
              <Space align="center">
                <Avatar src={detail.author.avatar} />
                <div>
                  <div className="font-medium">{detail.author.nickname || detail.author.username}</div>
                  <div className="text-xs text-slate-500">@{detail.author.username}</div>
                </div>
              </Space>
            </div>
            <div>
              <div className="text-sm text-slate-500 mb-1">所属帖子</div>
              <div className="text-blue-700">{detail.postTitle || '未知帖子'}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500 mb-1">发表时间</div>
              <div>{new Date(detail.createdAt).toLocaleString('zh-CN')}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500 mb-1">点赞数</div>
              <Tag color="blue" bordered={false}>{detail.likeCount}</Tag>
            </div>
            <div>
              <div className="text-sm text-slate-500 mb-1">评论ID</div>
              <div className="text-xs font-mono text-slate-600">{detail.id}</div>
            </div>
          </Space>
        )}
      </Drawer>
    </div>
  )
}

export default CommentsPage
