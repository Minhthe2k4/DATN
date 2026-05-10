import { StatGrid } from '../../../components/console/AdminUi'
import { Folder, CheckCircle, PauseCircle, BookOpen } from 'lucide-react'

export function TopicStats({ statsData, topicRows }) {
  const stats = [
    {
      label: 'Tổng số chủ đề',
      value: statsData?.total?.toString() ?? topicRows.length.toString(),
      meta: 'Có thể mở rộng linh hoạt theo nội dung mới',
      icon: <Folder className="text-primary" />,
    },
    {
      label: 'Đang hoạt động',
      value: statsData?.active?.toString() ?? topicRows.filter((topic) => topic.status === 'Hoạt động').length.toString(),
      meta: 'Sẵn sàng gán cho bài học và bài đọc',
      icon: <CheckCircle className="text-success" />,
    },
    {
      label: 'Tạm dừng',
      value: statsData?.paused?.toString() ?? topicRows.filter((topic) => topic.status !== 'Hoạt động').length.toString(),
      meta: 'Cần rà soát trước khi kích hoạt lại',
      icon: <PauseCircle className="text-warning" />,
    },
    {
      label: 'Số bài học',
      value: statsData?.lessonsAssigned?.toLocaleString() ?? topicRows.reduce((sum, topic) => sum + (topic.lessons || 0), 0).toLocaleString('en-US'),
      meta: 'Tổng số bài học đã gán cho tất cả chủ đề',
      icon: <BookOpen className="text-info" />,
    },
  ]

  return <StatGrid items={stats} />
}
