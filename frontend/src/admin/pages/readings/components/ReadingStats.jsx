import { StatGrid } from '../../../components/console/AdminUi'
import { FileText, CheckCircle, Edit3, FileSearch } from 'lucide-react'

export function ReadingStats({ statsData, articles }) {
  const stats = [
    { 
      label: 'Bài đọc hiện có', 
      value: statsData?.total?.toString() ?? articles.length.toString(), 
      meta: 'Phục vụ tính năng học từ qua đọc báo', 
      icon: <FileText className="text-primary" /> 
    },
    { 
      label: 'Đã xuất bản', 
      value: statsData?.published?.toString() ?? articles.filter((a) => a.status === 'Đã xuất bản').length.toString(), 
      meta: 'Đang xuất hiện ngoài frontend', 
      icon: <CheckCircle className="text-success" /> 
    },
    { 
      label: 'Chờ biên tập', 
      value: statsData?.waiting?.toString() ?? articles.filter((a) => a.status === 'Chờ biên tập').length.toString(), 
      meta: 'Cần rà soát chủ đề và độ khó', 
      icon: <Edit3 className="text-warning" /> 
    },
    { 
      label: 'Bản nháp', 
      value: statsData?.draft?.toString() ?? articles.filter((a) => a.status === 'Nháp').length.toString(), 
      meta: 'Nội dung chưa sẵn sàng công bố', 
      icon: <FileSearch className="text-info" /> 
    },
  ]

  return <StatGrid items={stats} />
}
