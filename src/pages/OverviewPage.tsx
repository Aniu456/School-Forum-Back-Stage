import { ArrowRightOutlined, WarningOutlined } from '@ant-design/icons'
import { Card, List, Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import * as echarts from 'echarts'
import { useEffect, useRef } from 'react'
import StatCard from '../components/StatCard'
import type { Announcement, Comment, Post, User } from '../types'

interface OverviewPageProps {
  users: User[]
  posts: Post[]
  comments: Comment[]
  announcements: Announcement[]
}

const OverviewPage: React.FC<OverviewPageProps> = ({ users, posts, comments, announcements }) => {
  const totalUsers = users.length
  const bannedUsers = users.filter((u) => u.status === 'banned').length
  const pinnedPosts = posts.filter((p) => p.status === 'pinned').length
  const hiddenPosts = posts.filter((p) => p.status === 'hidden').length
  const removedComments = comments.filter((c) => c.status === 'removed').length
  const hiddenAnnouncements = announcements.filter((a) => a.hidden).length
  const totalViews = posts.reduce((sum, p) => sum + p.views, 0)

  const topPosts = [...posts]
    .sort((a, b) => b.heat - a.heat)
    .slice(0, 4)
    .map((post) => ({
      key: post.id,
      title: post.title,
      author: post.author,
      views: post.views,
      comments: post.comments,
      status: post.status,
      tags: post.tags,
    }))

  const backlog = [
    { title: '待处理封禁/解封', value: bannedUsers, tag: '用户' },
    { title: '隐藏帖子核查', value: hiddenPosts, tag: '帖子' },
    { title: '已删除评论复核', value: removedComments, tag: '评论' },
    { title: '隐藏公告', value: hiddenAnnouncements, tag: '公告' },
  ]

  const postColumns: ColumnsType<(typeof topPosts)[number]> = [
    {
      title: '帖子',
      dataIndex: 'title',
      render: (_, record) => (
        <div>
          <div className="font-semibold text-slate-900">{record.title}</div>
          <div className="text-sm text-slate-500">{record.author}</div>
        </div>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      render: (tags: string[]) => (
        <Space wrap>
          {tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '浏览',
      dataIndex: 'views',
      sorter: (a, b) => a.views - b.views,
    },
    {
      title: '评论',
      dataIndex: 'comments',
      sorter: (a, b) => a.comments - b.comments,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: string) => {
        const color =
          status === 'pinned' ? 'gold' : status === 'hidden' ? 'red' : 'blue'
        const label =
          status === 'pinned' ? '置顶' : status === 'hidden' ? '隐藏' : '正常'
        return (
          <Tag color={color} bordered={false}>
            {label}
          </Tag>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      <div>
        <Typography.Title level={3} className="!mb-1 !mt-0 text-slate-900">
          数据总览
        </Typography.Title>
        <Typography.Paragraph className="!mb-0 text-slate-600">
          按设计文档梳理后台管理端关键指标，方便快速处理封禁、置顶、隐藏与公告维护。
        </Typography.Paragraph>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="注册用户" value={totalUsers} delta="+12 本周" color="#2563eb" />
        <StatCard
          title="封禁用户"
          value={bannedUsers}
          color="#ef4444"
          footer="封禁即时生效，解封后恢复全部浏览与发帖权限。"
        />
        <StatCard
          title="帖子总浏览"
          value={totalViews.toLocaleString()}
          delta="较上周 +8%"
          color="#0ea5e9"
          footer="含置顶、隐藏帖子，实时汇总。"
        />
        <StatCard
          title="公告数量"
          value={announcements.length}
          color="#10b981"
          footer={`隐藏公告 ${hiddenAnnouncements} 条，草稿 ${announcements.filter((a) => a.status === 'draft').length} 条`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-0 shadow-soft rounded-2xl">
          <Typography.Title level={4} className="!mb-4">
            浏览趋势
          </Typography.Title>
          <TrendChart posts={posts} />
        </Card>
        <Card className="border-0 shadow-soft rounded-2xl">
          <Typography.Title level={4} className="!mb-4">
            帖子分类占比
          </Typography.Title>
          <CategoryPieChart posts={posts} />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-0 shadow-soft rounded-2xl lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <Typography.Title level={4} className="!mb-0">
              热门帖子（按互动热度）
            </Typography.Title>
            <Tag color="blue" bordered={false}>
              置顶 {pinnedPosts} | 隐藏 {hiddenPosts}
            </Tag>
          </div>
          <Table
            columns={postColumns}
            dataSource={topPosts}
            pagination={false}
            bordered={false}
            size="middle"
          />
        </Card>

        <Card className="border-0 shadow-soft rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <WarningOutlined className="text-orange-500" />
            <Typography.Title level={5} className="!mb-0">
              待处理清单
            </Typography.Title>
          </div>
          <List
            dataSource={backlog}
            renderItem={(item) => (
              <List.Item className="!border-none px-0">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="font-semibold text-slate-900">{item.title}</div>
                    <div className="text-sm text-slate-500 uppercase">{item.tag}</div>
                  </div>
                  <Tag color="blue" bordered={false} className="text-base px-3 py-1 rounded-full">
                    {item.value}
                  </Tag>
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
const TrendChart: React.FC<{ posts: Post[] }> = ({ posts }) => {
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
  }, [posts])

  return <div ref={chartRef} style={{ width: '100%', height: '300px' }} />
}

// 帖子分类占比饼图组件
const CategoryPieChart: React.FC<{ posts: Post[] }> = ({ posts }) => {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const chart = echarts.init(chartRef.current)

    // 统计各分类帖子数量
    const categoryMap: Record<string, number> = {}
    posts.forEach((post) => {
      categoryMap[post.category] = (categoryMap[post.category] || 0) + 1
    })

    const data = Object.entries(categoryMap).map(([name, value]) => ({ name, value }))

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
          color: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
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
  }, [posts])

  return <div ref={chartRef} style={{ width: '100%', height: '300px' }} />
}

export default OverviewPage
