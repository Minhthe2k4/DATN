/**
 * SegmentsEditor - Reusable component for editing video segments
 * Following the DictationTrainer pattern from dictation folder
 * 
 * Props:
 * - segments: array of segment objects { segmentOrder, startSec, endSec, text }
 * - onSegmentsChange: callback when segments are modified
 * - isLoading: boolean - show loading state
 * - activeId: number - the id of the currently active segment (to highlight)
 * - onSegmentClick: function - callback when a segment is clicked
 */

import { useState } from 'react'
import { Save, Edit2, Trash2, AlertTriangle, Loader2, FileText, Lightbulb } from 'lucide-react'

export function SegmentsEditor({ segments = [], onSegmentsChange, isLoading = false, activeId = null, onSegmentClick = null }) {
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
  const handleEditSegment = (index, e) => {
    e.stopPropagation(); // Don't trigger the row click (video jump)
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
  const handleDeleteSegment = (index, e) => {
    e.stopPropagation(); // Don't trigger the row click
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
      <div style={{ textAlign: 'center', padding: '20px', color: '#666' }} className="d-flex align-items-center justify-content-center gap-2">
        <Loader2 className="spinner-border spinner-border-sm" size={16} />
        Đang tải phụ đề...
      </div>
    )
  }

  if (segments.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
        <FileText size={24} className="mb-2" />
        <div>Không có phụ đề</div>
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
                className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                onClick={handleSaveSegment}
              >
                <Save size={14} /> Lưu
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
          <div 
            key={idx} 
            onClick={() => onSegmentClick && onSegmentClick(segment)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '10px',
              padding: '8px',
              backgroundColor: segment.id === activeId ? '#f0f7ff' : '#fff',
              borderRadius: '4px',
              border: segment.id === activeId ? '1px solid #0066cc' : '1px solid #e9ecef',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {/* Time badge */}
            <div style={{
              minWidth: '80px',
              padding: '6px 8px',
              backgroundColor: segment.id === activeId ? '#0066cc' : '#e7f3ff',
              color: segment.id === activeId ? '#fff' : '#0066cc',
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
                onClick={(e) => handleEditSegment(idx, e)}
                style={{ padding: '4px 8px', fontSize: '12px' }}
              >
                <Edit2 size={14} />
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                title="Xoá"
                onClick={(e) => handleDeleteSegment(idx, e)}
                style={{ padding: '4px 8px', fontSize: '12px' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <small className="form-text text-muted d-flex align-items-center gap-1 mt-2">
        <Lightbulb size={12} /> {segments.length} segment có thể chỉnh sửa hoặc xóa trước khi lưu
      </small>
    </div>
  )
}
