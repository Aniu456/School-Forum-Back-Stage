import {
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  PlusOutlined,
  PushpinOutlined,
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
  Typography,
  message,
} from 'antd'
import { useMemo, useState } from 'react'
import type { Announcement, AnnouncementStatus } from '../types'

interface AnnouncementsPageProps {
  announcements: Announcement[]
  onSave: (announcement: Omit<Announcement, 'createdAt' | 'updatedAt'> & { id?: string }) => void
  onDelete: (ids: string[]) => void
}

const { Option } = Select

const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({
  announcements,
  onSave,
  onDelete,
}) => {
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<'all' | AnnouncementStatus>('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [form] = Form.useForm()

  const filtered = useMemo(
    () =>
      announcements.filter((announcement) => {
        const matchKeyword =
          announcement.title.toLowerCase().includes(keyword.toLowerCase()) ||
          announcement.content.toLowerCase().includes(keyword.toLowerCase())
        const matchStatus = status === 'all' ? true : announcement.status === status
        return matchKeyword && matchStatus
      }),
    [announcements, keyword, status],
  )

  const openDrawer = (record?: Announcement) => {
    setEditing(record ?? null)
    setDrawerOpen(true)
    form.setFieldsValue(
      record ?? {
        title: '',
        content: '',
        status: 'draft',
        pinned: false,
        hidden: false,
      },
    )
  }

  const handleDelete = (ids: string[]) => {
    if (!ids.length) return
    Modal.confirm({
      title: `确认删除选中的 ${ids.length} 条公告？`,
      content: '删除后不再出现在任何前台位置。',
      okButtonProps: { danger: true },
      onOk: () => {
        onDelete(ids)
        setSelectedRowKeys([])
        message.success('公告已删除')
      },
    })
  }

  const submit = async () => {
    const values = await form.validateFields()
    onSave({ ...values, id: editing?.id })
    message.success(editing ? '公告已更新' : '公告已创建')
    setDrawerOpen(false)
    setEditing(null)
    form.resetFields()
  }

  const columns: ColumnsType<Announcement> = [
    {
      title: '标题',
      dataIndex: 'title',
      render: (text: string, record) => (
        <div>
          <div className="font-semibold text-slate-900">{text}</div>
          <div className="text-sm text-slate-500">{record.content}</div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (state: AnnouncementStatus) => (
        <Tag color={state === 'published' ? 'blue' : 'gold'} bordered={false}>
          {state === 'published' ? '已发布' : '草稿'}
        </Tag>
      ),
    },
    {
      title: '置顶',
      dataIndex: 'pinned',
      render: (pinned: boolean, record) => (
        <Switch
          checkedChildren="置顶"
          unCheckedChildren="置顶"
          checked={pinned}
          onChange={() => {
            onSave({ ...record, pinned: !pinned, id: record.id })
            message.success(!pinned ? '已置顶' : '已取消置顶')
          }}
        />
      ),
    },
    {
      title: '隐藏',
      dataIndex: 'hidden',
      render: (hidden: boolean, record) => (
        <Switch
          checkedChildren="隐藏"
          unCheckedChildren="隐藏"
          checked={hidden}
          onChange={() => {
            onSave({ ...record, hidden: !hidden, id: record.id })
            message.success(!hidden ? '已隐藏' : '已取消隐藏')
          }}
        />
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
    },
    {
      title: '操作',
      dataIndex: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openDrawer(record)}>
            编辑
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
            公告管理
          </Typography.Title>
          <Typography.Paragraph className="!mb-0 text-slate-600">
            创建、编辑、删除公告，支持置顶与隐藏，满足后台设计要求。
          </Typography.Paragraph>
        </div>
        <Space>
          <Input.Search
            allowClear
            placeholder="搜索公告标题/内容"
            onSearch={setKeyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="min-w-[260px]"
          />
          <Select value={status} onChange={(v) => setStatus(v)} style={{ width: 140 }}>
            <Option value="all">全部状态</Option>
            <Option value="published">已发布</Option>
            <Option value="draft">草稿</Option>
          </Select>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openDrawer()}>
            新建公告
          </Button>
        </Space>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">已选 {selectedRowKeys.length} 条公告</div>
        <Space>
          <Button
            icon={<PushpinOutlined />}
            onClick={() => {
              const ids = selectedRowKeys as string[]
              ids.forEach((id) => {
                const item = announcements.find((a) => a.id === id)
                if (item && !item.pinned) {
                  onSave({ ...item, pinned: true })
                }
              })
              message.success('批量置顶完成')
            }}
          >
            批量置顶
          </Button>
          <Button danger type="primary" onClick={() => handleDelete(selectedRowKeys as string[])}>
            批量删除
          </Button>
        </Space>
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
        open={drawerOpen}
        title={editing ? '编辑公告' : '新建公告'}
        width={520}
        onClose={() => {
          setDrawerOpen(false)
          setEditing(null)
          form.resetFields()
        }}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
            <Button type="primary" onClick={submit}>
              保存
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
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
            <Input.TextArea rows={5} placeholder="公告正文" />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select>
              <Option value="published">已发布</Option>
              <Option value="draft">草稿</Option>
            </Select>
          </Form.Item>
          <Form.Item label="置顶" name="pinned" valuePropName="checked">
            <Switch checkedChildren={<PushpinOutlined />} unCheckedChildren={<PushpinOutlined />} />
          </Form.Item>
          <Form.Item label="隐藏" name="hidden" valuePropName="checked">
            <Switch checkedChildren={<EyeInvisibleOutlined />} unCheckedChildren={<EyeTwoTone />} />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}

export default AnnouncementsPage
