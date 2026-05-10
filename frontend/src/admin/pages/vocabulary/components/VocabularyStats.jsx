import { StatGrid } from '../../../components/console/AdminUi'
import { Book, CheckCircle, AlertCircle, Search } from 'lucide-react'

export function VocabularyStats({ statsData, entries, normalizeStatus }) {
  const stats = [
    {
      label: 'Tổng số từ vựng',
      value: statsData?.total?.toString() ?? entries.length.toString(),
      meta: 'Dữ liệu từ vựng tập trung trong hệ thống',
      icon: <Book className="text-primary" />,
    },
    {
      label: 'Đã duyệt',
      value: statsData?.approved?.toString() ?? entries.filter((entry) => normalizeStatus(entry.status) === 'Đã duyệt').length.toString(),
      meta: 'Sẵn sàng đưa vào bài học và bài đọc',
      icon: <CheckCircle className="text-success" />,
    },
    {
      label: 'Chờ duyệt',
      value: statsData?.pending?.toString() ?? entries.filter((entry) => normalizeStatus(entry.status) === 'Chờ duyệt').length.toString(),
      meta: 'Cần kiểm tra nghĩa, ví dụ và bài học',
      icon: <AlertCircle className="text-warning" />,
    },
  ]

  return <StatGrid items={stats} />
}
