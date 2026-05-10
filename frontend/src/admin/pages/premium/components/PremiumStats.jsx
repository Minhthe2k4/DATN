import React from 'react'
import { StatGrid } from '../../../components/console/AdminUi'
import { Clock, Star, Calendar, Package, Users, ClipboardList } from 'lucide-react'

export function PremiumStats({ requestRows, memberRows, planRows }) {
  const stats = [
    {
      label: 'Yêu cầu chờ duyệt',
      value: requestRows.filter(r => r.status === 'Chờ duyệt').length.toString(),
      meta: 'Yêu cầu nâng cấp đang chờ xử lý',
      icon: <Clock size={24} />,
    },
    {
      label: 'Thành viên Premium',
      value: memberRows.length.toString(),
      meta: 'Đang có quyền truy cập nội dung trả phí',
      icon: <Star size={24} />,
    },
    {
      label: 'Sắp hết hạn',
      value: memberRows.filter((member) => member.action === 'Gia hạn').length.toString(),
      meta: 'Cần theo dõi để nhắc gia hạn hoặc hủy quyền',
      icon: <Calendar size={24} />,
    },
    {
      label: 'Gói đang lưu hành',
      value: planRows.length.toString(),
      meta: 'Số lượng các gói cước đang được hệ thống hỗ trợ',
      icon: <Package size={24} />,
    },
  ]

  return (
    <>
      <StatGrid items={stats} />
      <div className="premium-insight-strip">
        <span className="d-flex align-items-center gap-1">
          <ClipboardList size={14} /> Yêu cầu: <strong>{requestRows.length}</strong>
        </span>
        <span className="d-flex align-items-center gap-1">
          <Users size={14} /> Thành viên: <strong>{memberRows.length}</strong>
        </span>
        <span className="d-flex align-items-center gap-1">
          <Package size={14} /> Gói: <strong>{planRows.length}</strong>
        </span>
      </div>
    </>
  )
}
