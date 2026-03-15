import {
  ArrowRightOutlined,
  CommentOutlined,
  FileTextOutlined,
  TeamOutlined,
  UserDeleteOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { Button, Card, List, Spin, Typography, App } from 'antd'
import * as echarts from 'echarts'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StatCard from '../components/StatCard'
import type { SystemStatistics } from '../types'
import { statisticsService } from '../services'

const OverviewPage: React.FC = () => {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState<SystemStatistics | null>(null)

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true)
      const data = await statisticsService.getStatistics()
      setStatistics(data)
    } catch (error: any) {
      message.error(error.response?.data?.message || '获取统计数据失败')
    } finally {
      setLoading(false)
    }
  }, [message])

  useEffect(() => {
    fetchStatistics()
  }, [fetchStatistics])

  if (loading || !statistics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    )
  }

  const quickStats = [
    {
      title: '封禁用户',
      value: statistics.users.banned,
      tag: '用户管理',
      path: '/users',
      color: 'text-red-600',
    },
    {
      title: '正常用户',
      value: statistics.users.active,
      tag: '用户管理',
      path: '/users',
      color: 'text-green-600',
    },
    {
      title: '帖子总数',
      value: statistics.posts.total,
      tag: '帖子管理',
      path: '/posts',
      color: 'text-blue-600',
    },
    {
      title: '评论总数',
      value: statistics.comments.total,
      tag: '评论管理',
      path: '/comments',
      color: 'text-teal-600',
    },
  ]

  return (
    <div className="space-y-4">
      <div>
        <Typography.Title level={3} className="mb-1! mt-0! text-slate-900">
          数据总览
        </Typography.Title>
        <Typography.Paragraph className="mb-0! text-slate-600">
          按设计文档梳理后台管理端关键指标，方便快速处理封禁、置顶、隐藏与公告维护。
        </Typography.Paragraph>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="注册用户"
          value={statistics.users.total}
          delta={`活跃 ${statistics.users.active}`}
          icon={<TeamOutlined />}
          color="#2563eb"
        />
        <StatCard
          title="封禁用户"
          value={statistics.users.banned}
          icon={<UserDeleteOutlined />}
          color="#ef4444"
          footer="封禁即时生效，解封后恢复全部浏览与发帖权限。"
        />
        <StatCard
          title="帖子总数"
          value={statistics.posts.total}
          icon={<FileTextOutlined />}
          color="#0ea5e9"
          footer="含置顶、隐藏帖子，实时汇总。"
        />
        <StatCard
          title="评论总数"
          value={statistics.comments.total}
          icon={<CommentOutlined />}
          color="#10b981"
          footer="全部评论数据"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-0 shadow-soft rounded-2xl">
          <Typography.Title level={4} className="mb-4!">
            内容分布
          </Typography.Title>
          <ContentDistributionChart statistics={statistics} />
        </Card>
        <Card className="border-0 shadow-soft rounded-2xl">
          <Typography.Title level={4} className="mb-4!">
            用户分布
          </Typography.Title>
          <UserDistributionChart statistics={statistics} />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-1">
        <Card className="border-0 shadow-soft rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <WarningOutlined className="text-orange-500" />
            <Typography.Title level={5} className="mb-0!">
              系统统计
            </Typography.Title>
          </div>
          <List
            dataSource={quickStats}
            renderItem={(item) => (
              <List.Item className="border-none! px-0">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="font-semibold text-slate-900">{item.title}</div>
                    <div className="text-sm text-slate-500 uppercase">{item.tag}</div>
                  </div>
                  <div className={`text-2xl font-bold ${item.color}`}>
                    {item.value}
                  </div>
                </div>
              </List.Item>
            )}
          />
          <div className="mt-4 flex gap-3 flex-wrap">
            <Button
              type="link"
              className="px-0 flex items-center gap-1"
              onClick={() => navigate('/users')}
            >
              用户管理 <ArrowRightOutlined />
            </Button>
            <Button
              type="link"
              className="px-0 flex items-center gap-1"
              onClick={() => navigate('/posts')}
            >
              帖子管理 <ArrowRightOutlined />
            </Button>
            <Button
              type="link"
              className="px-0 flex items-center gap-1"
              onClick={() => navigate('/comments')}
            >
              评论管理 <ArrowRightOutlined />
            </Button>
            <Button
              type="link"
              className="px-0 flex items-center gap-1"
              onClick={() => navigate('/announcements')}
            >
              公告管理 <ArrowRightOutlined />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

// 内容分布柱状图（基于真实统计数据）
const ContentDistributionChart: React.FC<{ statistics: SystemStatistics }> = ({ statistics }) => {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const chart = echarts.init(chartRef.current)

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: ['注册用户', '活跃用户', '封禁用户', '帖子总数', '评论总数'],
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        axisLabel: { color: '#64748b' },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        axisLabel: { color: '#64748b' },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
      },
      series: [
        {
          name: '数量',
          type: 'bar',
          barMaxWidth: 48,
          data: [
            { value: statistics.users.total, itemStyle: { color: '#3b82f6' } },
            { value: statistics.users.active, itemStyle: { color: '#10b981' } },
            { value: statistics.users.banned, itemStyle: { color: '#ef4444' } },
            { value: statistics.posts.total, itemStyle: { color: '#0ea5e9' } },
            { value: statistics.comments.total, itemStyle: { color: '#8b5cf6' } },
          ],
          borderRadius: [6, 6, 0, 0],
        },
      ],
    }

    chart.setOption(option)

    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.dispose()
    }
  }, [statistics])

  return <div ref={chartRef} style={{ width: '100%', height: '300px' }} />
}

// 用户分布饼图组件
const UserDistributionChart: React.FC<{ statistics: SystemStatistics }> = ({ statistics }) => {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const chart = echarts.init(chartRef.current)

    const data = [
      { name: '活跃用户', value: statistics.users.active },
      { name: '封禁用户', value: statistics.users.banned },
    ]

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: '10%',
        top: 'center',
        textStyle: {
          color: '#64748b',
        },
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
            },
          },
          data,
          color: ['#10b981', '#ef4444'],
        },
      ],
    }

    chart.setOption(option)

    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.dispose()
    }
  }, [statistics])

  return <div ref={chartRef} style={{ width: '100%', height: '300px' }} />
}

export default OverviewPage
