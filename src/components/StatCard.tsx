import { ArrowUpOutlined } from '@ant-design/icons'
import { Card, Tag } from 'antd'
import type { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  delta?: string
  icon?: ReactNode
  color?: string
  footer?: ReactNode
}

const StatCard: React.FC<StatCardProps> = ({ title, value, delta, icon, color, footer }) => (
  <Card className="h-full border-0 shadow-soft bg-white/80 backdrop-blur rounded-2xl">
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-sm uppercase tracking-wide text-slate-500">{title}</div>
        <div className="text-3xl font-bold text-slate-900 mt-1">{value}</div>
        {delta && (
          <Tag color="blue" className="mt-2 flex items-center gap-1" bordered={false}>
            <ArrowUpOutlined /> {delta}
          </Tag>
        )}
      </div>
      <div
        className="h-12 w-12 rounded-xl flex items-center justify-center text-white text-xl shadow-lg"
        style={{ backgroundColor: color ?? '#2563eb' }}
      >
        {icon}
      </div>
    </div>
    {footer && <div className="mt-3 text-sm text-slate-500 leading-6">{footer}</div>}
  </Card>
)

export default StatCard
