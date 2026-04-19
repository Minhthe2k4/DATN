import './video.css'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchAllVideoChannels } from '../../utils/videoApi'


export function Video() {
	const [channels, setChannels] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		loadChannels()
	}, [])

	const loadChannels = async () => {
		try {
			setIsLoading(true)
			const data = await fetchAllVideoChannels()
			// Chuyển dữ liệu API thành định dạng mà component cần
			const transformedChannels = data.map(channel => ({
				id: channel.id,
				slug: channel.handle?.replace('@', '') || `channel-${channel.id}`,
				name: channel.name,
				handle: channel.handle,
				followers: channel.subscriberCount?.toLocaleString() || '0',
				videos: channel.videoCount,
				verified: true, // Có thể sửa sau khi có trường verified trong backend
				thumbnail: makeChannelThumbnail(channel.name),
				avatar: makeChannelAvatar(channel.name),
				coverColor: '#93c5fd',
			}))
			setChannels(transformedChannels)
			setError(null)
		} catch (err) {
			console.error('Failed to load channels:', err)
			setChannels([])
			setError('Không thể tải danh sách kênh. Vui lòng thử lại sau.')
		} finally {
			setIsLoading(false)
		}
	}

	// Hàm tạo thumbnail
	const makeChannelThumbnail = (label) => {
		const colors = [
			{ bg1: '#111827', bg2: '#374151' },
			{ bg1: '#18181b', bg2: '#ef4444' },
			{ bg1: '#06b6d4', bg2: '#3b82f6' },
			{ bg1: '#020617', bg2: '#0ea5e9' },
		]
		const color = colors[Math.floor(Math.random() * colors.length)]
		return `data:image/svg+xml,${encodeURIComponent(
			`<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360' viewBox='0 0 640 360'>
				<defs>
					<linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
						<stop offset='0%' stop-color='${color.bg1}' />
						<stop offset='100%' stop-color='${color.bg2}' />
					</linearGradient>
				</defs>
				<rect width='640' height='360' fill='url(#g)' />
				<circle cx='120' cy='86' r='70' fill='rgba(255,255,255,0.16)' />
				<circle cx='580' cy='294' r='105' fill='rgba(255,255,255,0.1)' />
				<text x='26' y='54' font-size='24' fill='rgba(255,255,255,0.9)' font-family='Manrope, sans-serif'>Channel</text>
				<text x='26' y='116' font-size='58' font-weight='800' fill='#ffffff' font-family='Manrope, sans-serif'>${label.substring(0, 10)}</text>
			</svg>`
		)}`
	}

	// Hàm tạo avatar
	const makeChannelAvatar = (label) => {
		const colors = ['#0ea5e9', '#ef4444', '#16a34a', '#f59e0b']
		const color = colors[Math.floor(Math.random() * colors.length)]
		const initials = label.substring(0, 2).toUpperCase()
		return `data:image/svg+xml,${encodeURIComponent(
			`<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'>
				<circle cx='40' cy='40' r='40' fill='${color}' />
				<text x='40' y='48' text-anchor='middle' font-size='28' font-weight='800' fill='white' font-family='Manrope, sans-serif'>${initials}</text>
			</svg>`
		)}`
	}

	if (isLoading) {
		return (
			<section className="video-page">
				<div className="video-page__container">
					<div style={{ textAlign: 'center', padding: '40px' }}>
						<p>Đang tải kênh video...</p>
					</div>
				</div>
			</section>
		)
	}

	const channelCount = channels.length
	const totalVideoCount = channels.reduce((sum, channel) => sum + channel.videos, 0)

	return (
		<section className="video-page">
			<div className="video-page__container">
				<header className="video-page__header">
					<p className="video-page__eyebrow">Luyện nghe qua video</p>
					<h1 className="video-page__title">Chọn kênh và bắt đầu học</h1>
					<p className="video-page__subtitle">Theo dõi các kênh phù hợp trình độ để luyện từ vựng, ngữ cảnh và phát âm tự nhiên.</p>
					<div className="video-page__header-bottom">
						<div className="video-page__stats" aria-label="Thống kê thư viện video">
							<span className="video-page__stat-chip">{channelCount} kênh</span>
							<span className="video-page__stat-chip">{totalVideoCount}+ videos</span>
						</div>
						<button type="button" className="video-page__view-all">Khám phá tất cả kênh</button>
					</div>
				</header>

				{error && (
					<div style={{ padding: '10px', backgroundColor: '#fef3c7', color: '#b45309', borderRadius: '4px', marginBottom: '20px' }}>
						Lưu ý: {error}
					</div>
				)}

				<div className="video-grid">
					{channels.map((channel) => (
						<Link to={`/video/${channel.slug}`} className="video-card-link" key={channel.id}>
							<article className="video-card">
								<div className="video-card__media-wrap">
									<img src={channel.thumbnail} alt={channel.name} className="video-card__media" />
									{channel.verified ? <span className="video-card__verified">Đã xác minh</span> : null}
								</div>
								<div className="video-card__body">
									<img src={channel.avatar} alt="" className="video-card__avatar" />
									<div className="video-card__content">
										<h2>{channel.name}</h2>
										<p className="video-card__handle">{channel.handle}</p>
										<p className="video-card__meta">{channel.followers} người theo dõi • {channel.videos} video</p>
									</div>
								</div>
							</article>
						</Link>
					))}
				</div>
			</div>
		</section>
	)
}

