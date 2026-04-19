/**
 * SegmentsEditor - Reusable component for editing video segments
 * Following the DictationTrainer pattern from dictation folder
 * 
 * Props:
 * - segments: array of segment objects { segmentOrder, startSec, endSec, text }
 * - onSegmentsChange: callback when segments are modified
 * - isLoading: boolean - show loading state
 */

import { useState, useMemo } from 'react'

export function SegmentsEditor({ segments = [], onSegmentsChange, isLoading = false }) {
  const [editingIndex, setEditingIndex] = useState(null)
  const [editText, setEditText] = useState('')
  const [editStart, setEditStart] = useState('')
  const [editEnd, setEditEnd] = useState('')

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = String(Math.floor(seconds % 60)).padStart(2, '0')
    return `${mins}:${secs}`
  }

  // Start editing a segment
  const handleEditSegment = (index) => {
    const segment = segments[index]
    setEditingIndex(index)
    setEditText(segment.text)
    setEditStart(segment.startSec.toString())
    setEditEnd(segment.endSec.toString())
  }

  // Save segment changes
  const handleSaveSegment = () => {
    const start = parseFloat(editStart)
    const end = parseFloat(editEnd)

    if (!editText.trim() || isNaN(start) || isNaN(end) || end <= start) {
      alert('⚠️ Vui lòng nhập dữ liệu hợp lệ (text, start < end)')
      return
    }

    const newSegments = [...segments]
    newSegments[editingIndex] = {
      ...newSegments[editingIndex],
      text: editText.trim(),
      startSec: start,
      endSec: end
    }

    onSegmentsChange(newSegments)
    setEditingIndex(null)
  }

  // Delete segment
  const handleDeleteSegment = (index) => {
    if (window.confirm('Xóa segment này?')) {
      const newSegments = segments.filter((_, i) => i !== index)
      onSegmentsChange(newSegments)
    }
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditText('')
    setEditStart('')
    setEditEnd('')
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
        ⏳ Đang tải phụ đề...
      </div>
    )
  }

  if (segments.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
        📝 Không có phụ đề
        <br />
        <small>Kiểm tra video có bật phụ đề tiếng Anh không</small>
      </div>
    )
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '2px solid #e9ecef'
      }}>
        <label className="form-label fw-semibold mb-0">
          PHỤ ĐỀ SEGMENTS ({segments.length})
        </label>
      </div>

      <div style={{
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        padding: '12px',
        maxHeight: '400px',
        overflowY: 'auto',
        border: '1px solid #dee2e6'
      }}>
        {editingIndex !== null ? (
          // EDIT MODE
          <div style={{
            backgroundColor: '#fff',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '12px',
            border: '2px solid #0066cc'
          }}>
            <label className="form-label fw-semibold" style={{ fontSize: '12px' }}>
              Chỉnh sửa segment #{editingIndex + 1}
            </label>

            <textarea
              className="form-control"
              rows="3"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              style={{ fontSize: '12px', fontFamily: 'inherit', marginBottom: '8px' }}
            />

            <div className="row g-2 mb-2">
              <div className="col-6">
                <label className="form-label fw-semibold" style={{ fontSize: '11px' }}>
                  Start (giây)
                </label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={editStart}
                  onChange={(e) => setEditStart(e.target.value)}
                  step="0.1"
                  style={{ fontSize: '12px' }}
                />
              </div>
              <div className="col-6">
                <label className="form-label fw-semibold" style={{ fontSize: '11px' }}>
                  End (giây)
                </label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={editEnd}
                  onChange={(e) => setEditEnd(e.target.value)}
                  step="0.1"
                  style={{ fontSize: '12px' }}
                />
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-primary"
                onClick={handleSaveSegment}
              >
                ✓ Lưu
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={handleCancelEdit}
              >
                Hủy
              </button>
            </div>
          </div>
        ) : null}

        {/* SEGMENT LIST */}
        {segments.map((segment, idx) => (
          <div key={idx} style={{
            display: 'flex',
            alignItems: 'flex-start',
            marginBottom: '10px',
            padding: '8px',
            backgroundColor: '#fff',
            borderRadius: '4px',
            border: '1px solid #e9ecef'
          }}>
            {/* Time badge */}
            <div style={{
              minWidth: '80px',
              padding: '6px 8px',
              backgroundColor: '#e7f3ff',
              color: '#0066cc',
              borderRadius: '3px',
              fontSize: '11px',
              fontWeight: 'bold',
              marginRight: '10px',
              flexShrink: 0,
              textAlign: 'center',
              fontFamily: 'monospace'
            }}>
              {formatTime(segment.startSec)} - {formatTime(segment.endSec)}
            </div>

            {/* Segment text */}
            <div style={{
              flex: 1,
              fontSize: '13px',
              color: '#333',
              lineHeight: 1.4,
              marginRight: '8px',
              wordBreak: 'break-word'
            }}>
              {segment.text}
            </div>

            {/* Action buttons */}
            <div className="d-flex gap-1" style={{ flexShrink: 0 }}>
              <button
                className="btn btn-sm btn-outline-primary"
                title="Chỉnh sửa"
                onClick={() => handleEditSegment(idx)}
                style={{ padding: '4px 8px', fontSize: '12px' }}
              >
                ✏️
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                title="Xoá"
                onClick={() => handleDeleteSegment(idx)}
                style={{ padding: '4px 8px', fontSize: '12px' }}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      <small className="form-text text-muted d-block mt-2">
        💡 {segments.length} segment có thể chỉnh sửa hoặc xóa trước khi lưu
      </small>
    </div>
  )
}
