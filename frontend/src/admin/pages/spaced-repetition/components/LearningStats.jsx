import { StatGrid } from '../../../components/console/AdminUi'
import { Brain, CheckCircle, Library, Award } from 'lucide-react'

export function LearningStats({ statsData }) {
  const stats = [
    {
      label: 'Hiệu suất học tập',
      value: `${statsData.averageAccuracyRate}%`,
      meta: 'Độ chính xác trung bình toàn hệ thống',
      icon: <Brain className="text-primary" />
    },
    {
      label: 'Tỷ lệ hoàn thành',
      value: `${statsData.lessonCompletionRate}%`,
      meta: 'Tỷ lệ hoàn thành bài học',
      icon: <CheckCircle className="text-success" />
    },
    {
      label: 'Lượng từ đang học',
      value: statsData.wordsInReview.toLocaleString(),
      meta: 'Tổng số từ người dùng đang theo dõi',
      icon: <Library className="text-info" />
    },
    {
      label: 'Từ đã nắm vững',
      value: statsData.masteredWords.toLocaleString(),
      meta: 'Đã hoàn thành chu kỳ SRS',
      icon: <Award className="text-warning" />
    },
  ]

  return <StatGrid items={stats} />
}
