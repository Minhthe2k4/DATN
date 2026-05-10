import React from 'react'
import { AdminSectionCard, PieDistribution } from '../../../components/console/AdminUi'
import { Info } from 'lucide-react'

export function TopicCharts({ distributionData, topicRows }) {
  const averageLessons = (topicRows.reduce((sum, t) => sum + (t.lessons || 0), 0) / (topicRows.length || 1)).toFixed(1)

  return (
    <div className="row g-3 mt-1">
      <div className="col-12 col-xl-6">
        <AdminSectionCard
          title="Phân bổ bài học theo chủ đề"
          description="Tỷ lệ đóng góp nội dung của từng chủ đề vào hệ thống bài học."
        >
          <PieDistribution data={distributionData} />
        </AdminSectionCard>
      </div>
      <div className="col-12 col-xl-6">
        <AdminSectionCard
          title="Phân tích dữ liệu"
          description="Ghi chú nhanh về tình trạng phủ nội dung của các chủ đề."
        >
          <div className="d-flex flex-column gap-3">
            <div className="p-3 border rounded-3 bg-light">
              <div className="fw-bold text-primary mb-1">Chủ đề phong phú nhất</div>
              <div className="h4 mb-0">{distributionData[0]?.name || 'N/A'}</div>
              <div className="small text-muted">{distributionData[0]?.value || 0} bài học</div>
            </div>
            <div className="p-3 border rounded-3 bg-light">
              <div className="fw-bold text-success mb-1">Trung bình bài học/chủ đề</div>
              <div className="h4 mb-0">{averageLessons}</div>
              <div className="small text-muted">Mức độ bao phủ nội dung trung bình</div>
            </div>
            <div className="alert alert-soft-info border-0 mb-0 py-2 px-3 small">
              <Info size={16} className="me-1" />
              Mẹo: Các chủ đề có dưới 3 bài học nên được ưu tiên bổ sung nội dung mới.
            </div>
          </div>
        </AdminSectionCard>
      </div>
    </div>
  )
}
