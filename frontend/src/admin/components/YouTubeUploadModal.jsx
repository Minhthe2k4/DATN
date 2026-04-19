import { useState } from 'react'
import './YouTubeUploadModal.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export function YouTubeUploadModal({ isOpen, onClose, onSuccess }) {
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [transcriptData, setTranscriptData] = useState(null)
  const [segments, setSegments] = useState([])
  const [editingSegmentId, setEditingSegmentId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [editingStart, setEditingStart] = useState('')
  const [editingEnd, setEditingEnd] = useState('')
  
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [difficulty, setDifficulty] = useState('Trung bình')
  const [channelId, setChannelId] = useState('')
  const [topicId, setTopicId] = useState('')

  const handleFetchCaptions = async (e) => {
    e.preventDefault()
    
    if (!youtubeUrl.trim()) {
      setError('Vui lòng nhập YouTube URL')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/videos/fetch-captions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || `Failed to fetch captions (HTTP ${res.status})`)
      }

      const data = await res.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setTranscriptData(data)
      setSegments(data.segments || [])
      setTitle(data.title || `Video - ${new Date().toLocaleDateString('vi-VN')}`)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setTranscriptData(null)
      setSegments([])
    } finally {
      setLoading(false)
    }
  }

  const handleEditSegment = (segment) => {
    setEditingSegmentId(segment.segmentOrder)
    setEditingText(segment.text)
    setEditingStart(segment.startSec.toString())
    setEditingEnd(segment.endSec.toString())
  }

  const handleSaveSegmentEdit = () => {
    const start = parseFloat(editingStart)
    const end = parseFloat(editingEnd)

    if (!editingText.trim()) {
      setError('Segment text cannot be empty')
      return
    }

    if (isNaN(start) || isNaN(end) || start < 0 || end <= start) {
      setError('Invalid time values')
      return
    }

    const updatedSegments = segments.map((seg) =>
      seg.segmentOrder === editingSegmentId
        ? { ...seg, text: editingText.trim(), startSec: start, endSec: end }
        : seg
    )

    setSegments(updatedSegments)
    setEditingSegmentId(null)
    setError('')
  }

  const handleDeleteSegment = (segmentOrder) => {
    if (window.confirm('Are you sure you want to delete this segment?')) {
      const updatedSegments = segments
        .filter((seg) => seg.segmentOrder !== segmentOrder)
        .map((seg, idx) => ({ ...seg, segmentOrder: idx + 1 }))
      setSegments(updatedSegments)
    }
  }

  const handleSaveVideo = async () => {
    if (!title.trim()) {
      setError('Video title is required')
      return
    }

    if (segments.length === 0) {
      setError('At least one segment is required')
      return
    }

    setSaving(true)
    setError('')

    try {
      // Convert segments to format expected by backend
      const segmentsData = segments.map((seg) => ({
        text: seg.text,
        startSec: seg.startSec,
        endSec: seg.endSec,
        segmentOrder: seg.segmentOrder,
      }))

      const res = await fetch(`${API_BASE_URL}/api/admin/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          youtubeUrl: youtubeUrl.trim(),
          channelId: channelId ? parseInt(channelId) : null,
          topicId: topicId ? parseInt(topicId) : null,
          difficulty: difficulty,
          status: 'Chờ biên tập',
          transcript: transcriptData?.transcript || '',
          segments: segmentsData,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || `Failed to save video (HTTP ${res.status})`)
      }

      const createdVideo = await res.json()
      
      // Reset and close
      setYoutubeUrl('')
      setTranscriptData(null)
      setSegments([])
      setTitle('')
      setDifficulty('Trung bình')
      setChannelId('')
      setTopicId('')
      
      onSuccess(createdVideo)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content youtube-upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload Video from YouTube</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {!transcriptData ? (
            // Step 1: Input YouTube URL
            <form onSubmit={handleFetchCaptions} className="youtube-form">
              <div className="form-group">
                <label>YouTube URL</label>
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  disabled={loading}
                />
                <small>Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID</small>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Fetching subtitles...' : 'Fetch Subtitles'}
              </button>
            </form>
          ) : (
            // Step 2: Edit segments
            <div className="segment-editor">
              <div className="editor-header">
                <div>
                  <h3>Video Info</h3>
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Video title"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Difficulty</label>
                      <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                        <option>Cơ bản</option>
                        <option>Trung bình</option>
                        <option>Nâng cao</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Channel ID</label>
                      <input
                        type="number"
                        value={channelId}
                        onChange={(e) => setChannelId(e.target.value)}
                        placeholder="Optional"
                      />
                    </div>

                    <div className="form-group">
                      <label>Topic ID</label>
                      <input
                        type="number"
                        value={topicId}
                        onChange={(e) => setTopicId(e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <p className="info-text">
                    <strong>Language:</strong> {transcriptData.language || 'unknown'} | 
                    <strong> Segments:</strong> {segments.length}
                  </p>
                </div>

                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setTranscriptData(null)
                    setSegments([])
                    setYoutubeUrl('')
                    setError('')
                  }}
                >
                  ← Back
                </button>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="segments-list">
                <h4>Segments ({segments.length})</h4>
                {segments.length === 0 ? (
                  <p className="empty-message">No segments available</p>
                ) : (
                  segments.map((segment) => (
                    <div key={segment.segmentOrder} className="segment-item">
                      {editingSegmentId === segment.segmentOrder ? (
                        // Edit mode
                        <div className="segment-edit-form">
                          <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="segment-text-input"
                          />
                          <div className="time-inputs">
                            <input
                              type="number"
                              step="0.1"
                              value={editingStart}
                              onChange={(e) => setEditingStart(e.target.value)}
                              placeholder="Start (s)"
                              className="time-input"
                            />
                            <input
                              type="number"
                              step="0.1"
                              value={editingEnd}
                              onChange={(e) => setEditingEnd(e.target.value)}
                              placeholder="End (s)"
                              className="time-input"
                            />
                          </div>
                          <div className="segment-actions">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={handleSaveSegmentEdit}
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setEditingSegmentId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Display mode
                        <div className="segment-content">
                          <div className="segment-info">
                            <span className="segment-time">
                              {formatTime(segment.startSec)} - {formatTime(segment.endSec)}
                            </span>
                            <p className="segment-text">{segment.text}</p>
                          </div>
                          <div className="segment-actions">
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() => handleEditSegment(segment)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteSegment(segment.segmentOrder)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {transcriptData && (
          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSaveVideo}
              disabled={saving || segments.length === 0 || !title.trim()}
            >
              {saving ? 'Saving...' : 'Save Video'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function formatTime(seconds) {
  if (typeof seconds !== 'number') return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}
