import React from 'react'
import { AdminSectionCard, PieDistribution } from '../../../components/console/AdminUi'

export function ReadingDifficultyChart({ difficultyData }) {
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6']

  return (
    <AdminSectionCard title="Phân bổ độ khó">
      <div style={{ height: '200px' }}>
        <PieDistribution data={difficultyData} colors={colors} />
      </div>
      <div className="mt-3">
        {difficultyData.map((item, idx) => (
          <div key={item.name} className="d-flex justify-content-between align-items-center mb-1 small">
            <span className="text-muted">
              <span 
                className="d-inline-block rounded-circle me-2" 
                style={{ width: '8px', height: '8px', backgroundColor: colors[idx % colors.length] }}
              ></span>
              {item.name}
            </span>
            <span className="fw-bold">{item.count} bài</span>
          </div>
        ))}
      </div>
    </AdminSectionCard>
  )
}
