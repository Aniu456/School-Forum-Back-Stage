import { LockOutlined, SafetyOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, List, Typography } from 'antd'
import { useState } from 'react'

interface LoginPageProps {
  onLogin: (key: string) => boolean
}

const keyHints = ['使用 ADMIN 注册密钥登录', '登录后可管理用户 / 帖子 / 评论 / 公告', '所有删除操作为物理删除']

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false)

  const handleFinish = (values: { key: string }) => {
    setLoading(true)
    const ok = onLogin(values.key)
    setTimeout(() => setLoading(false), 200)
    return ok
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-slate-50" />
      <div className="relative grid gap-10 w-full max-w-6xl lg:grid-cols-2 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 text-blue-700 px-4 py-2 font-medium">
            <SafetyOutlined />
            School Forum Admin
          </div>
          <div>
            <Typography.Title level={2} className="!mb-2 !text-slate-900">
              后台管理端登录
            </Typography.Title>
            <Typography.Paragraph className="!text-lg !text-slate-600">
              使用唯一的 ADMIN_REGISTRATION_KEY 进入控制面板，快速处理用户举报、帖子置顶/隐藏、批量删除评论与公告。
            </Typography.Paragraph>
          </div>
          <Card className="border-0 shadow-soft bg-white/80 backdrop-blur rounded-2xl">
            <List
              size="small"
              split={false}
              dataSource={keyHints}
              renderItem={(item) => (
                <List.Item className="!px-0 !border-none text-slate-600 font-medium">
                  • {item}
                </List.Item>
              )}
            />
          </Card>
        </div>

        <Card className="border-0 shadow-soft rounded-2xl">
          <Typography.Title level={4} className="!mb-6 !text-slate-900">
            输入管理员密钥
          </Typography.Title>
          <Form layout="vertical" onFinish={handleFinish}>
            <Form.Item
              label="ADMIN_REGISTRATION_KEY"
              name="key"
              rules={[{ required: true, message: '请输入管理员密钥' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="例如：CAMPUS-ADMIN-2025"
                size="large"
              />
            </Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              进入后台
            </Button>
          </Form>
          <div className="mt-4 text-sm text-slate-500">
            密钥校验仅在本地模拟，实际项目可替换为服务端登录/Token 校验。
          </div>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage
