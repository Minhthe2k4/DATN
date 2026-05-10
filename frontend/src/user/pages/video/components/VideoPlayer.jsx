import React from 'react'
import { 
	Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Volume1, Maximize 
} from 'lucide-react'
import { formatTime } from '../videoUtils'

export function VideoPlayer({ 
	videoRef, 
	videoStreamUrl, 
	onTimeUpdate, 
	onMetadataLoaded, 
	togglePlay, 
	isPlaying, 
	showControls, 
	setShowControls,
	currentTime, 
	duration, 
	handleProgressChange, 
	handleSkip, 
	playbackRate, 
	changeSpeed, 
	toggleMute, 
	isMuted, 
	volume, 
	toggleFullscreen 
}) {
	return (
		<div
			className="video-watch__player-container"
			onMouseEnter={() => setShowControls(true)}
			onMouseLeave={() => isPlaying && setShowControls(false)}
		>
			<video
				ref={videoRef}
				src={videoStreamUrl}
				onTimeUpdate={onTimeUpdate}
				onLoadedMetadata={onMetadataLoaded}
				onClick={togglePlay}
				className="video-watch__video-element"
			>
				Trình duyệt không hỗ trợ video.
			</video>

			{/* Custom Controls Overlay */}
			<div className={`video-watch__controls ${showControls ? 'is-visible' : 'is-hidden'}`}>
				{/* Progress Bar */}
				<div className="video-watch__progress-container">
					<input
						type="range" min="0" max={duration} step="0.1"
						value={currentTime} onChange={handleProgressChange}
						className="video-watch__progress-bar"
					/>
				</div>

				<div className="video-watch__controls-main">
					<div className="video-watch__controls-left">
						<button onClick={() => handleSkip(-10)} className="video-watch__skip-btn" title="Lùi 10s">
							<RotateCcw size={20} />
						</button>

						<button onClick={togglePlay} className="video-watch__play-btn">
							{isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
						</button>

						<button onClick={() => handleSkip(10)} className="video-watch__skip-btn" title="Tiến 10s">
							<RotateCw size={20} />
						</button>

						<span className="video-watch__time-display">
							{formatTime(currentTime)} / {formatTime(duration)}
						</span>
					</div>

					<div className="video-watch__controls-right">
						<button onClick={toggleMute} className="video-watch__volume-btn" title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}>
							{isMuted ? <VolumeX size={20} /> : volume > 0.5 ? <Volume2 size={20} /> : <Volume1 size={20} />}
						</button>

						<div className="video-watch__speed-selector">
							<button className="video-watch__speed-btn">{playbackRate}x</button>
							<div className="video-watch__speed-options">
								{[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => (
									<button key={s} onClick={() => changeSpeed(s)} className={playbackRate === s ? 'is-active' : ''}>{s}x</button>
								))}
							</div>
						</div>

						<button onClick={toggleFullscreen} className="video-watch__fullscreen-btn" title="Toàn màn hình">
							<Maximize size={20} />
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
