import { StatGrid } from '../../../components/console/AdminUi'
import { Youtube, PlayCircle, CheckCircle, Edit3 } from 'lucide-react'

export function VideoStats({ statsData, channels, videos }) {
  const stats = [
    {
      label: 'Kênh YouTube',
      value: statsData?.totalChannels?.toString() ?? channels.length.toString(),
      meta: 'Kênh đang được quản lý',
      icon: <Youtube className="text-danger" />
    },
    {
      label: 'Tổng video',
      value: statsData?.totalVideos?.toString() ?? videos.length.toString(),
      meta: 'Trong toàn bộ kênh',
      icon: <PlayCircle className="text-primary" />
    },
    {
      label: 'Đã xuất bản',
      value: statsData?.published?.toString() ?? videos.filter((v) => v.status === 'Đã xuất bản').length.toString(),
      meta: 'Đang hiển thị cho người học',
      icon: <CheckCircle className="text-success" />
    },
    {
      label: 'Chờ biên tập',
      value: statsData?.waiting?.toString() ?? videos.filter((v) => v.status === 'Chờ biên tập').length.toString(),
      meta: 'Cần rà soát trước khi xuất bản',
      icon: <Edit3 className="text-warning" />
    },
  ]

  return <StatGrid items={stats} />
}
