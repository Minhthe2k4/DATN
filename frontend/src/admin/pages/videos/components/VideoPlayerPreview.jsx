import React from 'react'
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Maximize } from 'lucide-react'
import { SegmentsEditor } from '../SegmentsEditor'

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function VideoPlayerPreview({
  videoRef,
  videoStreamUrl,
  videoDraft,
  currentTime,
  duration,
  isPlaying,
  playbackRate,
  isMuted,
  showControls,
  activeSubtitleId,
  activeSegment,
  onTimeUpdate,
  onMetadataLoaded,
  togglePlay,
  handleSkip,
  handleProgressChange,
  toggleMute,
  toggleFullscreen,
  changeSpeed,
  setField,
  setIsPlaying
}) {
  return (
    <div className="card-body p-0">
      <div
        className="video-watch__player-container mb-3"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        style={{ width: '100%', margin: '0' }}
      >
        {videoStreamUrl ? (
          <video
            ref={videoRef}
            src={videoStreamUrl}
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={onMetadataLoaded}
            onClick={togglePlay}
            className="video-watch__video-element"
          />
        ) : (
          <div className="d-flex align-items-center justify-content-center text-muted h-100 bg-dark" style={{ minHeight: '250px' }}>
            {videoDraft.youtubeUrl ? (
              <div className="p-4 text-center">
                <p>Chưa có luồng video.</p>
                <small>Nhấn "Bắt đầu xử lý" để stream trực tiếp từ server.</small>
              </div>
            ) : 'Chưa có nguồn video'}
          </div>
        )}

        {/* Player Controls Overlay */}
        <div className={`video-watch__controls ${showControls ? 'is-visible' : 'is-hidden'}`}>
          <div className="video-watch__progress-container">
            <input 
              type="range" 
              min="0" 
              max={duration} 
              step="0.1" 
              value={currentTime} 
              onChange={handleProgressChange} 
              className="video-watch__progress-bar" 
            />
          </div>
          <div className="video-watch__controls-main">
            <div className="video-watch__controls-left">
              <button onClick={() => handleSkip(-10)} className="video-watch__skip-btn"><RotateCcw size={18} /></button>
              <button onClick={togglePlay} className="video-watch__play-btn">
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
              </button>
              <button onClick={() => handleSkip(10)} className="video-watch__skip-btn"><RotateCw size={18} /></button>
              <span className="video-watch__time-display small">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
            <div className="video-watch__controls-right">
              <button onClick={toggleMute} className="video-watch__volume-btn">
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <div className="video-watch__speed-selector ms-2">
                <button className="video-watch__speed-btn">{playbackRate}x</button>
                <div className="video-watch__speed-options">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => (
                    <button key={s} onClick={() => changeSpeed(s)} className={playbackRate === s ? 'is-active' : ''}>
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={toggleFullscreen} className="video-watch__fullscreen-btn ms-2" title="Toàn màn hình">
                <Maximize size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Subtitle Preview Box */}
      <div className="video-watch__line-preview mb-3" style={{ padding: '10px' }}>
        {activeSegment ? (
          <div className="video-watch__clickable-text-wrapper">
            <div className="video-watch__clickable-text">
              <p className="m-0 text-white text-center fw-medium" style={{ fontSize: '1.2rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {activeSegment.text}
              </p>
            </div>
          </div>
        ) : <span className="text-muted small">Phụ đề sẽ hiển thị ở đây khi video chạy...</span>}
      </div>

      <SegmentsEditor
        segments={videoDraft.segments}
        onSegmentsChange={newSegments => setField('segments', newSegments)}
        activeId={activeSubtitleId}
        onSegmentClick={(seg) => {
          if (videoRef.current) {
            videoRef.current.currentTime = seg.startSec
            videoRef.current.play()
            setIsPlaying(true)
          }
        }}
      />
    </div>
  )
}
