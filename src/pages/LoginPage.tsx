import { LockOutlined, MailOutlined, SafetyOutlined, UserOutlined } from "@ant-design/icons"
import { App, Button, Card, Form, Input, List, Tabs, Typography } from "antd"
import { useState } from "react"
import { authService } from "../services"

interface LoginPageProps {
  onLogin: (user: any) => void
}

const keyHints = ["使用管理员密钥注册或登录", "登录后可管理用户 / 帖子 / 评论 / 公告", "所有删除操作为物理删除"]

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"register" | "login">("register")

  const handleRegister = async (values: {
    email: string
    username: string
    password: string
    nickname?: string
    adminKey: string
  }) => {
    setLoading(true)
    try {
      const response = await authService.registerAdmin(values)
      authService.saveAuthData(response)
      message.success("注册成功,欢迎进入后台管理端")
      onLogin(response.user)
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "注册失败,请检查管理员密钥"
      message.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true)
    try {
      const response = await authService.login(values.email, values.password)

      // Check if user is admin
      if (response.user.role !== "ADMIN") {
        message.error("只有管理员才能访问后台系统")
        return
      }

      authService.saveAuthData(response)
      message.success("登录成功,欢迎回来")
      onLogin(response.user)
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "登录失败,请检查邮箱和密码"
      message.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-white to-slate-50" />
      <div className="relative grid gap-10 w-full max-w-6xl lg:grid-cols-2 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 text-blue-700 px-4 py-2 font-medium">
            <SafetyOutlined />
            School Forum Admin
          </div>
          <div>
            <Typography.Title level={2} className="mb-2! text-slate-900!">
              后台管理端
            </Typography.Title>
            <Typography.Paragraph className="text-lg! text-slate-600!">
              使用唯一的 ADMIN_REGISTRATION_KEY 注册管理员账号,或使用已有账号登录。
              快速处理用户举报、帖子置顶/隐藏、批量删除评论与公告。
            </Typography.Paragraph>
          </div>
          <Card className="border-0 shadow-soft bg-white/80 backdrop-blur rounded-2xl">
            <List
              size="small"
              split={false}
              dataSource={keyHints}
              renderItem={(item) => (
                <List.Item className="px-0! border-none! text-slate-600 font-medium">• {item}</List.Item>
              )}
            />
          </Card>
        </div>

        <Card className="border-0 shadow-soft rounded-2xl">
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as "register" | "login")}
            items={[
              {
                key: "register",
                label: "注册管理员",
                children: (
                  <Form layout="vertical" onFinish={handleRegister}>
                    <Form.Item
                      label="邮箱"
                      name="email"
                      rules={[
                        { required: true, message: "请输入邮箱" },
                        { type: "email", message: "请输入有效的邮箱地址" },
                      ]}
                    >
                      <Input prefix={<MailOutlined />} placeholder="admin@campus.edu" size="large" />
                    </Form.Item>

                    <Form.Item
                      label="用户名"
                      name="username"
                      rules={[
                        { required: true, message: "请输入用户名" },
                        { min: 3, max: 20, message: "用户名长度为3-20个字符" },
                      ]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="admin" size="large" />
                    </Form.Item>

                    <Form.Item label="昵称" name="nickname">
                      <Input prefix={<UserOutlined />} placeholder="管理员(可选)" size="large" />
                    </Form.Item>

                    <Form.Item
                      label="密码"
                      name="password"
                      rules={[
                        { required: true, message: "请输入密码" },
                        { min: 6, max: 20, message: "密码长度为6-20个字符" },
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined />} placeholder="设置密码" size="large" />
                    </Form.Item>

                    <Form.Item
                      label="管理员密钥"
                      name="adminKey"
                      rules={[{ required: true, message: "请输入管理员密钥" }]}
                    >
                      <Input.Password prefix={<SafetyOutlined />} placeholder="ADMIN_REGISTRATION_KEY" size="large" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                      注册并进入后台
                    </Button>
                  </Form>
                ),
              },
              {
                key: "login",
                label: "登录",
                children: (
                  <Form layout="vertical" onFinish={handleLogin}>
                    <Form.Item
                      label="邮箱"
                      name="email"
                      rules={[
                        { required: true, message: "请输入邮箱" },
                        { type: "email", message: "请输入有效的邮箱地址" },
                      ]}
                    >
                      <Input prefix={<MailOutlined />} placeholder="admin@campus.edu" size="large" />
                    </Form.Item>

                    <Form.Item label="密码" name="password" rules={[{ required: true, message: "请输入密码" }]}>
                      <Input.Password prefix={<LockOutlined />} placeholder="输入密码" size="large" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                      登录
                    </Button>
                  </Form>
                ),
              },
            ]}
          />
          <div className="mt-4 text-sm text-slate-500">
            首次使用请使用管理员密钥注册账号。后续可使用邮箱密码直接登录。
          </div>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage
