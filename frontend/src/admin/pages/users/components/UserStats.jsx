import { StatGrid } from '../../components/console/AdminUi'
import { Users, CheckCircle, Lock, Star } from 'lucide-react'

export function UserStats({ rows }) {
  const stats = [
    { 
      label: 'Tổng số tài khoản', 
      value: rows.length.toString(), 
      meta: 'Toàn bộ hệ thống', 
      icon: <Users className="text-primary" /> 
    },
    { 
      label: 'Đang hoạt động', 
      value: rows.filter((user) => user.isActive).length.toString(), 
      meta: 'Có thể đăng nhập', 
      icon: <CheckCircle className="text-success" /> 
    },
    { 
      label: 'Bị khóa', 
      value: rows.filter((user) => !user.isActive).length.toString(), 
      meta: 'Tài khoản tạm ngừng', 
      icon: <Lock className="text-danger" /> 
    },
    { 
      label: 'Premium', 
      value: rows.filter((user) => user.premium === 'Premium').length.toString(), 
      meta: 'Gói nâng cao', 
      icon: <Star className="text-warning" /> 
    },
  ]

  return <StatGrid items={stats} />
}
