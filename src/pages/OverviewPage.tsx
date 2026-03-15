import { ArrowRightOutlined, WarningOutlined } from '@ant-design/icons'
import { Card, List, Spin, Typography, App } from 'antd'
import * as echarts from 'echarts'
import { useEffect, useRef, useState } from 'react'
import StatCard from '../components/StatCard'
import type { SystemStatistics } from '../types'
import { statisticsService } from '../services'

const OverviewPage: React.FC = () => {
  const { message } = App.useApp()
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState<SystemStatistics | null>(null)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      const data = await statisticsService.getStatistics()
      setStatistics(data)
    } catch (error: any) {
      message.error(error.response?.data?.message || '获取统计数据失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading || !statistics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    )
  }

  const backlog = [
    { title: '待处理封禁/解封', value: statistics.users.banned, tag: '用户' },
    { title: '正常用户', value: statistics.users.active, tag: '用户' },
    { title: '帖子总数', value: statistics.posts.total, tag: '帖子' },
    { title: '评论总数', value: statistics.comments.total, tag: '评论' },
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
          color="#2563eb"
        />
        <StatCard
          title="封禁用户"
          value={statistics.users.banned}
          color="#ef4444"
          footer="封禁即时生效，解封后恢复全部浏览与发帖权限。"
        />
        <StatCard
          title="帖子总数"
          value={statistics.posts.total}
          delta="全部帖子"
          color="#0ea5e9"
          footer="含置顶、隐藏帖子，实时汇总。"
        />
        <StatCard
          title="评论总数"
          value={statistics.comments.total}
          color="#10b981"
          footer="全部评论数据"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-0 shadow-soft rounded-2xl">
          <Typography.Title level={4} className="mb-4!">
            浏览趋势
          </Typography.Title>
          <TrendChart />
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
            dataSource={backlog}
            renderItem={(item) => (
              <List.Item className="border-none! px-0">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="font-semibold text-slate-900">{item.title}</div>
                    <div className="text-sm text-slate-500 uppercase">{item.tag}</div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {item.value}
                  </div>
                </div>
              </List.Item>
            )}
          />
          <div className="mt-4 inline-flex items-center gap-2 text-blue-600 font-medium cursor-pointer">
            查看详情 <ArrowRightOutlined />
          </div>
        </Card>
      </div>
    </div>
  )
}

// 浏览趋势折线图组件
const TrendChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const chart = echarts.init(chartRef.current)

    // 模拟最近7天的数据
    const dates = ['11-15', '11-16', '11-17', '11-18', '11-19', '11-20', '11-21']
    const views = [3200, 3800, 4200, 3900, 4500, 5100, 5538]
    const comments = [420, 510, 580, 540, 620, 710, 812]

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: {
          lineStyle: {
            color: '#cbd5e1',
          },
        },
        axisLabel: {
          color: '#64748b',
        },
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#cbd5e1',
          },
        },
        axisLabel: {
          color: '#64748b',
        },
        splitLine: {
          lineStyle: {
            color: '#f1f5f9',
          },
        },
      },
      series: [
        {
          name: '浏览量',
          type: 'line',
          smooth: true,
          data: views,
          itemStyle: {
            color: '#3b82f6',
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
            ]),
          },
        },
        {
          name: '评论数',
          type: 'line',
          smooth: true,
          data: comments,
          itemStyle: {
            color: '#10b981',
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.05)' },
            ]),
          },
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
  }, [])

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
