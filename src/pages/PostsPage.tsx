import {
  DeleteOutlined,
  EyeOutlined,
  HighlightOutlined,
  LockOutlined,
  PushpinOutlined,
  StopOutlined,
  UnlockOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import {
  Avatar,
  Button,
  Drawer,
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
} from 'antd'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Comment, Post } from '../types'
import { postService, commentService } from '../services'

const { Option } = Select

const PostsPage: React.FC = () => {
  const { message } = App.useApp()

  const [loading, setLoading] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [keyword, setKeyword] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [authorId, setAuthorId] = useState('')
  const [tag, setTag] = useState('')
  const [sortBy, setSortBy] = useState<'default' | 'createdAt' | 'hot'>('default')
  const [filterType, setFilterType] = useState<'all' | 'pinned' | 'highlighted' | 'locked' | 'hidden'>('all')
  const [detailPost, setDetailPost] = useState<Post | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentLoading, setCommentLoading] = useState(false)
  const [commentPage, setCommentPage] = useState(1)
  const [commentPageSize, setCommentPageSize] = useState(20)
  const [commentTotal, setCommentTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const [postId, setPostId] = useState('')
  const [searchParams] = useSearchParams()

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await postService.getPosts({
        page,
        limit: pageSize,
        isPinned: filterType === 'pinned' ? true : undefined,
        isHighlighted: filterType === 'highlighted' ? true : undefined,
        isHidden: filterType === 'hidden' ? true : undefined,
        keyword: searchKeyword || undefined,
        postId: postId || undefined,
        authorId: authorId || undefined,
        tag: tag || undefined,
        sortBy: sortBy === 'default' ? undefined : sortBy,
        order: sortBy === 'default' ? undefined : 'desc',
      })
      setPosts(response.data)
      setTotal(response.meta.total)
    } catch (error: any) {
      message.error(error.response?.data?.message || '获取帖子列表失败')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, filterType, searchKeyword, postId, authorId, tag, sortBy, message])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  useEffect(() => {
    const pid = searchParams.get('postId')
    if (pid) {
      setPostId(pid)
      setPage(1)
    }
  }, [searchParams])

  const handleSearch = () => {
    setSearchKeyword(keyword)
    setPage(1)
  }

  const handleResetFilters = () => {
    setKeyword('')
    setSearchKeyword('')
    setPostId('')
    setAuthorId('')
    setTag('')
    setSortBy('default')
    setPage(1)
  }

  const handleTogglePin = async (post: Post) => {
    try {
      if (post.isPinned) {
        await postService.unpinPost(post.id)
        message.success('已取消置顶')
      } else {
        await postService.pinPost(post.id)
        message.success('已置顶')
      }
      fetchPosts()
    } catch (error: any) {
      message.error(error.response?.data?.message || '操作失败')
    }
  }

  const handleToggleHighlight = async (post: Post) => {
    try {
      if (post.isHighlighted) {
        await postService.unhighlightPost(post.id)
        message.success('已取消精华')
      } else {
        await postService.highlightPost(post.id)
        message.success('已加精')
      }
      fetchPosts()
    } catch (error: any) {
      message.error(error.response?.data?.message || '操作失败')
    }
  }

  const handleToggleLock = async (post: Post) => {
    try {
      if (post.isLocked) {
        await postService.unlockPost(post.id)
        message.success('已解锁，允许评论')
      } else {
        await postService.lockPost(post.id)
        message.success('已锁定，禁止评论')
      }
      fetchPosts()
    } catch (error: any) {
      message.error(error.response?.data?.message || '操作失败')
    }
  }

  const handleToggleHidden = async (post: Post) => {
    try {
      if (post.isHidden) {
        await postService.unhidePost(post.id)
        message.success('已取消隐藏')
      } else {
        await postService.hidePost(post.id)
        message.success('已隐藏')
      }
      fetchPosts()
      if (detailPost && detailPost.id === post.id) {
        setDetailPost({ ...detailPost, isHidden: !post.isHidden })
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '操作失败')
    }
  }

  const handleDelete = (postId: string) => {
    Modal.confirm({
      title: '确认删除该帖子？',
      content: '删除后将从数据库物理删除，此操作不可恢复。',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await postService.bulkDelete([postId])
          message.success('帖子已删除')
          fetchPosts()
        } catch (error: any) {
          message.error(error.response?.data?.message || '删除失败')
        }
      },
    })
  }

  const handleBulkDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的帖子')
      return
    }

    Modal.confirm({
      title: `确认删除选中的 ${selectedRowKeys.length} 个帖子？`,
      content: '批量删除后将从数据库物理删除，此操作不可恢复。',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await postService.bulkDelete(selectedRowKeys)
          message.success(`已删除 ${selectedRowKeys.length} 个帖子`)
          setSelectedRowKeys([])
          fetchPosts()
        } catch (error: any) {
          message.error(error.response?.data?.message || '批量删除失败')
        }
      },
    })
  }

  const handleOpenDetail = async (post: Post) => {
    setDetailPost(post)
    setCommentPage(1)
    setDetailLoading(true)
    try {
      const fullPost = await postService.getPost(post.id)
      setDetailPost({ ...post, ...fullPost })
      await fetchPostComments(post.id, 1, commentPageSize)
    } catch (error: any) {
      message.error(error.response?.data?.message || '获取帖子详情失败')
    } finally {
      setDetailLoading(false)
    }
  }

  const fetchPostComments = useCallback(
    async (postId: string, pageNum = commentPage, limit = commentPageSize) => {
      try {
        setCommentLoading(true)
        const response = await commentService.getComments({
          page: pageNum,
          limit,
          postId,
        })
        setComments(response.data)
        setCommentTotal(response.meta.total)
      } catch (error: any) {
        message.error(error.response?.data?.message || '获取评论失败')
      } finally {
        setCommentLoading(false)
      }
    },
    [commentPage, commentPageSize, message]
  )

  const handleDeleteComment = (commentId: string, postId: string) => {
    Modal.confirm({
      title: '确认删除该评论？',
      content: '删除后将从数据库物理删除，此操作不可恢复。',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await commentService.deleteComment(commentId)
          message.success('评论已删除')
          await fetchPostComments(postId, commentPage, commentPageSize)
        } catch (error: any) {
          message.error(error.response?.data?.message || '删除失败')
        }
      },
    })
  }

  const renderStatusTags = (post: Post) => {
    const tags = []
    if (post.isPinned) tags.push(<Tag key="pin" color="gold">置顶</Tag>)
    if (post.isHighlighted) tags.push(<Tag key="highlight" color="orange">精华</Tag>)
    if (post.isLocked) tags.push(<Tag key="lock" color="volcano">锁定</Tag>)
    if (post.isHidden) tags.push(<Tag key="hidden" color="red">隐藏</Tag>)
    if (tags.length === 0) tags.push(<Tag key="normal" color="blue">正常</Tag>)
    return <Space size={4}>{tags}</Space>
  }

  const columns: ColumnsType<Post> = [
    {
      title: '帖子',
      dataIndex: 'title',
      width: 300,
      render: (_, record) => (
        <div>
          <div className="font-semibold text-slate-900">{record.title}</div>
          <div className="text-xs text-slate-500 mt-1">ID: {record.id.slice(0, 8)}...</div>
        </div>
      ),
    },
    {
      title: '作者',
      dataIndex: 'author',
      render: (author: Post['author']) => (
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
      title: '数据',
      render: (_, record) => (
        <Space size={8}>
          <Tag color="blue" bordered={false}>
            浏览 {record.viewCount}
          </Tag>
          <Tag color="geekblue" bordered={false}>
            评论 {record.commentCount}
          </Tag>
          <Tag color="cyan" bordered={false}>
            点赞 {record.likeCount}
          </Tag>
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (_, record) => renderStatusTags(record),
    },
    {
      title: '操作',
      dataIndex: 'actions',
      width: 320,
      fixed: 'right',
      render: (_, record) => (
        <Space wrap>
          <Button size="small" icon={<EyeOutlined />} type="link" onClick={() => handleOpenDetail(record)}>
            详情
          </Button>
          <Button
            size="small"
            icon={<PushpinOutlined />}
            type="link"
            onClick={() => handleTogglePin(record)}
          >
            {record.isPinned ? '取消置顶' : '置顶'}
          </Button>
          <Button
            size="small"
            icon={<HighlightOutlined />}
            type="link"
            onClick={() => handleToggleHighlight(record)}
          >
            {record.isHighlighted ? '取消精华' : '加精'}
          </Button>
          <Button
            size="small"
            icon={record.isLocked ? <UnlockOutlined /> : <LockOutlined />}
            type="link"
            onClick={() => handleToggleLock(record)}
          >
            {record.isLocked ? '解锁' : '锁定'}
          </Button>
          <Button
            size="small"
            icon={<StopOutlined />}
            type="link"
            onClick={() => handleToggleHidden(record)}
          >
            {record.isHidden ? '取消隐藏' : '隐藏'}
          </Button>
          <Button
            size="small"
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
          <Typography.Title level={3} className="mb-1! text-slate-900">
            帖子管理
          </Typography.Title>
          <Typography.Paragraph className="mb-0! text-slate-600">
            可按作者、标签、状态筛选，支持置顶、加精、锁定、隐藏、物理删除。
          </Typography.Paragraph>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchPosts}>
            刷新
          </Button>
          {selectedRowKeys.length > 0 && (
            <Button danger icon={<DeleteOutlined />} onClick={handleBulkDelete}>
              批量删除 ({selectedRowKeys.length})
            </Button>
          )}
        </Space>
      </div>

      <div className="flex flex-col gap-3">
        <Input.Search
          allowClear
          placeholder="搜索标题 / 作者"
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
        <Space wrap>
          <Select value={filterType} onChange={(v) => {
            setFilterType(v)
            setPage(1)
          }} style={{ width: 140 }}>
            <Option value="all">全部状态</Option>
            <Option value="pinned">置顶</Option>
            <Option value="highlighted">精华</Option>
            <Option value="locked">锁定</Option>
            <Option value="hidden">隐藏</Option>
          </Select>
          <Input
            allowClear
            placeholder="帖子ID"
            value={postId}
            onChange={(e) => {
              setPostId(e.target.value)
              setPage(1)
            }}
            style={{ width: 180 }}
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
            placeholder="标签"
            value={tag}
            onChange={(e) => {
              setTag(e.target.value)
              setPage(1)
            }}
            style={{ width: 140 }}
          />
          <Select value={sortBy} onChange={(v) => {
            setSortBy(v)
            setPage(1)
          }} style={{ width: 160 }}>
            <Option value="default">默认排序</Option>
            <Option value="createdAt">按时间(最新)</Option>
            <Option value="hot">按热度</Option>
          </Select>
          <Button onClick={handleResetFilters}>清空筛选</Button>
        </Space>
      </div>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={posts}
          rowKey="id"
          bordered={false}
          scroll={{ x: 1200 }}
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
        open={!!detailPost}
        width={600}
        title="帖子详情"
        onClose={() => setDetailPost(null)}
      >
        {detailPost && (
          <Tabs
            items={[
              {
                key: 'basic',
                label: '基本信息',
                children: (
                  <Spin spinning={detailLoading}>
                    <Space direction="vertical" size={16} className="w-full">
                      <div>
                        <div className="text-sm text-slate-500 mb-1">标题</div>
                        <div className="font-semibold text-lg text-slate-900">{detailPost.title}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500 mb-1">作者</div>
                        <Space align="center">
                          <Avatar src={detailPost.author.avatar} />
                          <div>
                            <div className="font-medium">{detailPost.author.nickname || detailPost.author.username}</div>
                            <div className="text-xs text-slate-500">@{detailPost.author.username}</div>
                          </div>
                        </Space>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500 mb-1">状态</div>
                        {renderStatusTags(detailPost)}
                      </div>
                      <div>
                        <div className="text-sm text-slate-500 mb-1">标签</div>
                        <Space size={4} wrap>
                          {(detailPost.tags && detailPost.tags.length > 0)
                            ? detailPost.tags.map((t) => (<Tag key={t}>{t}</Tag>))
                            : <Tag>未设置</Tag>}
                        </Space>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="small"
                          onClick={() => handleTogglePin(detailPost)}
                          icon={<PushpinOutlined />}
                        >
                          {detailPost.isPinned ? '取消置顶' : '置顶'}
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleToggleHighlight(detailPost)}
                          icon={<HighlightOutlined />}
                        >
                          {detailPost.isHighlighted ? '取消精华' : '加精'}
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleToggleLock(detailPost)}
                          icon={detailPost.isLocked ? <UnlockOutlined /> : <LockOutlined />}
                        >
                          {detailPost.isLocked ? '解锁' : '锁定'}
                        </Button>
                        <Button
                          size="small"
                          danger={detailPost.isHidden}
                          onClick={() => handleToggleHidden(detailPost)}
                          icon={<StopOutlined />}
                        >
                          {detailPost.isHidden ? '取消隐藏' : '隐藏'}
                        </Button>
                        <Button
                          size="small"
                          danger
                          onClick={() => handleDelete(detailPost.id)}
                          icon={<DeleteOutlined />}
                        >
                          删除
                        </Button>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500 mb-1">数据统计</div>
                        <Space>
                          <Tag color="blue" bordered={false}>浏览 {detailPost.viewCount}</Tag>
                          <Tag color="geekblue" bordered={false}>评论 {detailPost.commentCount}</Tag>
                          <Tag color="cyan" bordered={false}>点赞 {detailPost.likeCount}</Tag>
                        </Space>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500 mb-1">正文</div>
                        <div
                          className="text-slate-800 whitespace-pre-wrap leading-7 max-h-[260px] overflow-auto"
                          dangerouslySetInnerHTML={{ __html: detailPost.content || '暂无正文' }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-sm text-slate-500 mb-1">创建时间</div>
                          <div>{new Date(detailPost.createdAt).toLocaleString('zh-CN')}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500 mb-1">更新时间</div>
                          <div>{detailPost.updatedAt ? new Date(detailPost.updatedAt).toLocaleString('zh-CN') : '暂无'}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500 mb-1">帖子ID</div>
                        <div className="text-xs font-mono text-slate-600">{detailPost.id}</div>
                      </div>
                    </Space>
                  </Spin>
                ),
              },
              {
                key: 'comments',
                label: '评论',
                children: (
                  <Spin spinning={commentLoading}>
                    <Table
                      rowKey="id"
                      dataSource={comments}
                      pagination={{
                        current: commentPage,
                        pageSize: commentPageSize,
                        total: commentTotal,
                        showSizeChanger: true,
                        showTotal: (total) => `共 ${total} 条`,
                        onChange: (p, size) => {
                          setCommentPage(p)
                          setCommentPageSize(size)
                          if (detailPost) {
                            fetchPostComments(detailPost.id, p, size)
                          }
                        },
                      }}
                      columns={[
                        {
                          title: '内容',
                          dataIndex: 'content',
                          width: 260,
                          render: (text: string) => <span className="text-slate-900">{text}</span>,
                        },
                        {
                          title: '作者',
                          dataIndex: 'author',
                          render: (author: Comment['author']) => (
                            <Space align="center">
                              <Avatar size={28} src={author.avatar} />
                              <div>
                                <div className="text-sm text-slate-900">{author.nickname || author.username}</div>
                                <div className="text-xs text-slate-500">@{author.username}</div>
                              </div>
                            </Space>
                          ),
                        },
                        {
                          title: '点赞',
                          dataIndex: 'likeCount',
                          render: (count: number) => <Tag color="blue" bordered={false}>{count}</Tag>,
                        },
                        {
                          title: '时间',
                          dataIndex: 'createdAt',
                          render: (date: string) => new Date(date).toLocaleString('zh-CN'),
                        },
                        {
                          title: '操作',
                          dataIndex: 'actions',
                          width: 120,
                          render: (_, record) => (
                            <Button
                              type="link"
                              danger
                              onClick={() => detailPost && handleDeleteComment(record.id, detailPost.id)}
                            >
                              删除
                            </Button>
                          ),
                        },
                      ]}
                    />
                  </Spin>
                ),
              },
            ]}
          />
        )}
      </Drawer>
    </div>
  )
}

export default PostsPage
