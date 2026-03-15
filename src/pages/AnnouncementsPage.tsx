import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  PushpinOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import {
  Button,
  Drawer,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
  App,
  Spin,
} from 'antd'
import { useEffect, useMemo, useState, useCallback } from 'react'
import type { Announcement, AnnouncementInput } from '../types'
import { announcementService } from '../services'

const { Option } = Select

const AnnouncementsPage: React.FC = () => {
  const { message } = App.useApp()

  const [loading, setLoading] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [keyword, setKeyword] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [form] = Form.useForm()

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true)
      const response = await announcementService.getAllAnnouncements({
        page,
        limit: pageSize,
      })
      setAnnouncements(response.data)
      setTotal(response.meta.total)
    } catch (error: any) {
      message.error(error.response?.data?.message || '获取公告列表失败')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, message])

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  const filtered = useMemo(() => {
    if (!keyword) return announcements
    return announcements.filter((announcement) => {
      const lowerKeyword = keyword.toLowerCase()
      return (
        announcement.title.toLowerCase().includes(lowerKeyword) ||
        announcement.content.toLowerCase().includes(lowerKeyword)
      )
    })
  }, [announcements, keyword])

  const openDrawer = (record?: Announcement) => {
    setEditing(record ?? null)
    setDrawerOpen(true)
    if (record) {
      form.setFieldsValue({
        title: record.title,
        content: record.content,
        type: record.type,
        targetRole: record.targetRole,
        isPinned: record.isPinned,
        isPublished: record.isPublished ?? false,
      })
    } else {
      form.resetFields()
    }
  }

  const handleDelete = (announcementId: string) => {
    Modal.confirm({
      title: '确认删除该公告？',
      content: '删除后将从数据库物理删除，此操作不可恢复。',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await announcementService.deleteAnnouncement(announcementId)
          message.success('公告已删除')
          fetchAnnouncements()
        } catch (error: any) {
          message.error(error.response?.data?.message || '删除失败')
        }
      },
    })
  }

  const handleBulkDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的公告')
      return
    }

    Modal.confirm({
      title: `确认删除选中的 ${selectedRowKeys.length} 条公告？`,
      content: '批量删除后将从数据库物理删除，此操作不可恢复。',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await announcementService.bulkDelete(selectedRowKeys)
          message.success(`已删除 ${selectedRowKeys.length} 条公告`)
          setSelectedRowKeys([])
          fetchAnnouncements()
        } catch (error: any) {
          message.error(error.response?.data?.message || '批量删除失败')
        }
      },
    })
  }

  const handleToggleHidden = async (announcement: Announcement) => {
    try {
      await announcementService.toggleHidden(announcement.id, !announcement.isHidden)
      message.success(announcement.isHidden ? '已取消隐藏' : '已隐藏')
      fetchAnnouncements()
    } catch (error: any) {
      message.error(error.response?.data?.message || '操作失败')
    }
  }

  const submit = async () => {
    try {
      const values = await form.validateFields()
      const data: AnnouncementInput = {
        title: values.title,
        content: values.content,
        type: values.type,
        targetRole: values.targetRole,
        isPinned: values.isPinned,
        isPublished: values.isPublished,
      }

      if (editing) {
        await announcementService.updateAnnouncement(editing.id, data)
        message.success('公告已更新')
      } else {
        await announcementService.createAnnouncement(data)
        message.success('公告已创建')
      }

      setDrawerOpen(false)
      setEditing(null)
      form.resetFields()
      fetchAnnouncements()
    } catch (error: any) {
      message.error(error.response?.data?.message || '操作失败')
    }
  }

  const columns: ColumnsType<Announcement> = [
    {
      title: '标题',
      dataIndex: 'title',
      width: 300,
      render: (text: string, record) => (
        <div>
          <div className="font-semibold text-slate-900">{text}</div>
          <div className="text-sm text-slate-500 line-clamp-2">{record.content}</div>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      render: (type: string) => {
        const colorMap: Record<string, string> = {
          INFO: 'blue',
          WARNING: 'orange',
          URGENT: 'red',
        }
        const textMap: Record<string, string> = {
          INFO: '通知',
          WARNING: '警告',
          URGENT: '紧急',
        }
        return (
          <Tag color={colorMap[type] || 'default'} bordered={false}>
            {textMap[type] || type}
          </Tag>
        )
      },
    },
    {
      title: '目标角色',
      dataIndex: 'targetRole',
      render: (role: string | null) => (
        <Tag color={role === 'ADMIN' ? 'gold' : role === 'USER' ? 'blue' : 'default'} bordered={false}>
          {role === 'ADMIN' ? '管理员' : role === 'USER' ? '用户' : '全部'}
        </Tag>
      ),
    },
    {
      title: '发布状态',
      dataIndex: 'isPublished',
      render: (isPublished: boolean | undefined) => (
        <Tooltip title={isPublished ? '已发布，用户可见' : '草稿，用户不可见'}>
          <Tag
            color={isPublished ? 'green' : 'default'}
            bordered={false}
            icon={isPublished ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
          >
            {isPublished ? '已发布' : '草稿'}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: '置顶',
      dataIndex: 'isPinned',
      render: (isPinned: boolean) => (
        <Tag color={isPinned ? 'gold' : 'default'} bordered={false}>
          {isPinned ? '已置顶' : '未置顶'}
        </Tag>
      ),
    },
    {
      title: '隐藏',
      dataIndex: 'isHidden',
      render: (isHidden: boolean | undefined, record) => (
        <Switch
          checkedChildren="隐藏"
          unCheckedChildren="显示"
          checked={isHidden}
          onChange={() => handleToggleHidden(record)}
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      dataIndex: 'actions',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openDrawer(record)}>
            编辑
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
            公告管理
          </Typography.Title>
          <Typography.Paragraph className="mb-0! text-slate-600">
            创建、编辑、删除公告，支持置顶与隐藏，满足后台设计要求。
          </Typography.Paragraph>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchAnnouncements}>
            刷新
          </Button>
          {selectedRowKeys.length > 0 && (
            <Button danger icon={<DeleteOutlined />} onClick={handleBulkDelete}>
              批量删除 ({selectedRowKeys.length})
            </Button>
          )}
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openDrawer()}>
            新建公告
          </Button>
        </Space>
      </div>

      <div className="flex gap-3">
        <Input.Search
          allowClear
          placeholder="搜索公告标题/内容"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-1"
        />
      </div>

      <Spin spinning={loading}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          bordered={false}
          scroll={{ x: 1200 }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys as string[]),
          }}
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

      <Drawer
        open={drawerOpen}
        title={editing ? '编辑公告' : '新建公告'}
        width={600}
        onClose={() => {
          setDrawerOpen(false)
          setEditing(null)
          form.resetFields()
        }}
        extra={
          <Space>
            <Button onClick={() => {
              setDrawerOpen(false)
              setEditing(null)
              form.resetFields()
            }}>
              取消
            </Button>
            <Button type="primary" onClick={submit}>
              保存
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" initialValues={{ type: 'INFO', isPinned: false, isPublished: false }}>
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入公告标题' }]}
          >
            <Input placeholder="输入标题" />
          </Form.Item>
          <Form.Item
            label="内容"
            name="content"
            rules={[{ required: true, message: '请输入公告内容' }]}
          >
            <Input.TextArea rows={6} placeholder="公告正文" />
          </Form.Item>
          <Form.Item label="类型" name="type">
            <Select>
              <Option value="INFO">通知</Option>
              <Option value="WARNING">警告</Option>
              <Option value="URGENT">紧急</Option>
            </Select>
          </Form.Item>
          <Form.Item label="目标角色" name="targetRole">
            <Select allowClear placeholder="选择目标角色（留空表示全部）">
              <Option value="USER">用户</Option>
              <Option value="ADMIN">管理员</Option>
            </Select>
          </Form.Item>
          <Form.Item label="置顶" name="isPinned" valuePropName="checked">
            <Switch checkedChildren={<PushpinOutlined />} unCheckedChildren={<PushpinOutlined />} />
          </Form.Item>
          <Form.Item
            label="立即发布"
            name="isPublished"
            valuePropName="checked"
            extra="开启后公告立即对用户可见，并推送系统通知；关闭则保存为草稿。"
          >
            <Switch
              checkedChildren={<CheckCircleOutlined />}
              unCheckedChildren={<ClockCircleOutlined />}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}

export default AnnouncementsPage
