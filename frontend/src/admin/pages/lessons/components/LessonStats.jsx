import React from 'react'
import { StatGrid } from '../../../components/console/AdminUi'
import { BookOpen, PlayCircle, Star, BarChart } from 'lucide-react'

export function LessonStats({ statsData, lessonRows }) {
  const stats = [
    {
      label: 'Tổng số bài học',
      value: statsData?.total?.toString() ?? lessonRows.length.toString(),
      meta: 'Có thể gán vào các chủ đề cụ thể',
      icon: <BookOpen className="text-primary" />,
    },
    {
      label: 'Đang mở',
      value: statsData?.open?.toString() ?? lessonRows.filter((lesson) => lesson.status === 'Đang mở').length.toString(),
      meta: 'Đang xuất hiện trên hệ thống học',
      icon: <PlayCircle className="text-success" />,
    },
    {
      label: 'Premium',
      value: statsData?.premium?.toString() ?? lessonRows.filter((lesson) => lesson.isPremium).length.toString(),
      meta: 'Dành cho người dùng trả phí',
      icon: <Star className="text-warning" />,
    },
    {
      label: 'Độ khó trung bình',
      value: statsData?.avgDifficulty?.toFixed(1) ?? (lessonRows.filter((lesson) => lesson.difficulty === 'Trung bình').length).toString(),
      meta: 'Mức độ thử thách của kho bài học',
      icon: <BarChart className="text-info" />,
    },
  ]

  return <StatGrid items={stats} />
}
