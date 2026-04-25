import { Link, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { fetchChannelWithVideos, fetchAllVideoChannels } from '../../utils/videoApi'
import { getUserSession, getAuthHeader } from '../../utils/authSession'
import ProgressBar from '../../components/interaction/ProgressBar';
import '../../components/interaction/interaction.css';

import './videoChannel.css'

export function VideoChannel() {
	const { channelSlug } = useParams()
	const [channel, setChannel] = useState(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)
    const [interactionStats, setInteractionStats] = useState({}); // { videoId: { isFavorite, progressPercent } }
    const userId = getUserSession()?.userId

	useEffect(() => {
		loadChannel()
	}, [channelSlug])

	const loadChannel = async () => {
		try {
			setIsLoading(true)
			
			// Bước 1: Lấy tất cả channels từ backend để tìm ID theo slug
			const allChannels = await fetchAllVideoChannels()
			
			// Bước 2: Tìm channel có handle/slug match với URL
			const matchedChannel = allChannels.find(ch => {
				const chSlug = ch.handle?.replace('@', '')?.toLowerCase() || `channel-${ch.id}`
				return chSlug === channelSlug?.toLowerCase()
			})
			
			if (!matchedChannel) {
				setError('Kênh không tìm thấy')
				setIsLoading(false)
				return
			}

			// Bước 3: Lấy video của channel này
			const data = await fetchChannelWithVideos(matchedChannel.id)
			
			// Chuyển dữ liệu API thành định dạng component cần
			const transformedChannel = {
				id: data.channelId,
				slug: data.channelHandle?.replace('@', '')?.toLowerCase() || `channel-${data.channelId}`,
				name: data.channelName,
				handle: data.channelHandle,
				avatar: makeChannelAvatar(data.channelName),
				coverColor: '#93c5fd',
				videos: data.videos.length,
				videoList: data.videos.map(video => ({
					id: video.id,
					title: video.title,
					age: '—',
					duration: video.duration || '—',
					difficulty: video.difficulty || 'Trung bình',
					wordsHighlighted: video.wordsHighlighted || 0,
					isOutstanding: false,
					thumbnail: makeVideoThumbnail(video.title),
				}))
			}
			setChannel(transformedChannel)
			setError(null)
		} catch (err) {
			console.error('Failed to load channel:', err)
			setChannel(null)
			setError('Không thể tải kênh. Vui lòng thử lại sau.')
		} finally {
			setIsLoading(false)
		}
	}

    useEffect(() => {
        if (channel?.videoList?.length > 0 && userId) {
            axios.post('/api/user/interaction/bulk-stats', {
                targetIds: channel.videoList.map(v => v.id),
                targetType: 'VIDEO'
            }, { headers: getAuthHeader() })
            .then(res => setInteractionStats(res.data))
            .catch(err => console.error('Failed to fetch bulk stats', err));
        }
    }, [channel, userId]);

    const handleToggleFavorite = async (e, videoId) => {
        e.preventDefault();
        e.stopPropagation();
        if (!userId) {
            alert('Vui lòng đăng nhập!');
            return;
        }
        try {
            const res = await axios.post('/api/user/interaction/favorite/toggle', null, {
                params: { targetId: videoId, targetType: 'VIDEO' },
                headers: getAuthHeader()
            });
            setInteractionStats(prev => ({
                ...prev,
                [videoId]: { ...prev[videoId], isFavorite: res.data.isFavorite }
            }));
        } catch (err) {
            console.error('Failed to toggle favorite', err);
        }
    };

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

	const makeVideoThumbnail = (label) => {
		const colors = [
			{ bg1: '#111827', bg2: '#2563eb' },
			{ bg1: '#2563eb', bg2: '#0ea5e9' },
			{ bg1: '#0f766e', bg2: '#22c55e' },
			{ bg1: '#7c3aed', bg2: '#ec4899' },
		]
		const color = colors[Math.floor(Math.random() * colors.length)]
		const title = label.substring(0, 12).toUpperCase()
		return `data:image/svg+xml,${encodeURIComponent(
			`<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360' viewBox='0 0 640 360'>
				<defs>
					<linearGradient id='vg' x1='0' y1='0' x2='1' y2='1'>
						<stop offset='0%' stop-color='${color.bg1}' />
						<stop offset='100%' stop-color='${color.bg2}' />
					</linearGradient>
				</defs>
				<rect width='640' height='360' fill='url(#vg)' />
				<path d='M0 300 C112 248 190 322 304 272 C410 232 548 290 640 250 L640 360 L0 360 Z' fill='rgba(255,255,255,0.14)' />
				<text x='20' y='44' font-size='20' fill='rgba(255,255,255,0.88)' font-family='Manrope, sans-serif'>Watch now</text>
				<text x='20' y='104' font-size='42' font-weight='800' fill='white' font-family='Manrope, sans-serif'>${title}</text>
			</svg>`
		)}`
	}

	// Helper function để map difficulty sang color
	const getDifficultyColor = (difficulty) => {
		switch (difficulty?.toLowerCase()) {
			case 'cơ bản':
			case 'a1':
			case 'a2':
				return '#22c55e' // xanh lá
			case 'trung bình':
			case 'b1':
			case 'b2':
				return '#f59e0b' // vàng cam
			case 'nâng cao':
			case 'c1':
			case 'c2':
				return '#ef4444' // đỏ
			default:
				return '#6b7280' // xám
		}
	}

	if (isLoading) {
		return (
			<section className="video-channel-page">
				<div className="video-channel-page__container">
					<p>Đang tải kênh...</p>
				</div>
			</section>
		)
	}

	if (!channel) {
		return (
			<section className="video-channel-page">
				<div className="video-channel-page__container">
					<h1>Không tìm thấy kênh</h1>
					<p>{error || 'Vui lòng chọn một kênh hợp lệ từ danh sách video.'}</p>
					<Link to="/video" className="video-channel__back">Quay lại Video</Link>
				</div>
			</section>
		)
	}

	return (
		<section className="video-channel-page">
			<div className="video-channel-page__container">
				<nav className="video-channel__breadcrumb" aria-label="Điều hướng breadcrumb">
					<Link to="/">Trang chủ</Link>
					<span>/</span>
					<Link to="/video">Video</Link>
					<span>/</span>
					<strong>{channel.name}</strong>
				</nav>

				<header className="video-channel__hero">
					<div className="video-channel__cover" style={{ '--cover-color': channel.coverColor }} />
					<div className="video-channel__profile">
						<img src={channel.avatar} alt="" className="video-channel__avatar" />
						<div>
							<h1>{channel.name}</h1>
							<p>{channel.videos}+ video</p>
						</div>
					</div>
				</header>

				{error && (
					<div style={{ padding: '10px', backgroundColor: '#fef3c7', color: '#b45309', borderRadius: '4px', marginBottom: '20px' }}>
						Lưu ý: Sử dụng dữ liệu mặc định
					</div>
				)}

				<div className="channel-video-grid">
					{channel.videoList && channel.videoList.map((item) => (
						<Link key={item.id} to={`/video/${channel.slug}/watch/${item.id}`} className="channel-video-card-link">
							<article className="channel-video-card">
								<div className="channel-video-card__media-wrap">
									<img src={item.thumbnail} alt={item.title} className="channel-video-card__media" />
									{item.isOutstanding ? <span className="channel-video-card__badge">Nổi bật</span> : null}
									<span className="channel-video-card__duration">{item.duration}</span>
									
									{/* Difficulty badge */}
									<div style={{
										position: 'absolute',
										top: '8px',
										right: '8px',
										backgroundColor: getDifficultyColor(item.difficulty),
										color: 'white',
										padding: '4px 8px',
										borderRadius: '4px',
										fontSize: '12px',
										fontWeight: '600'
									}}>
										{item.difficulty}
									</div>
									
									{/* Word count badge */}
									{item.wordsHighlighted > 0 && (
										<div style={{
											position: 'absolute',
											bottom: '8px',
											right: '8px',
											backgroundColor: 'rgba(0, 0, 0, 0.7)',
											color: 'white',
											padding: '4px 8px',
											borderRadius: '4px',
											fontSize: '12px',
											fontWeight: '600'
										}}>
											{item.wordsHighlighted} từ
										</div>
									)}
								</div>
								<div className="channel-video-card__body">
									<h2>{item.title}</h2>
									{userId && (
                                        <div className="video-card__interaction">
                                            <button 
                                                className={`list-favorite-btn ${interactionStats[item.id]?.isFavorite ? 'active' : ''}`}
                                                onClick={(e) => handleToggleFavorite(e, item.id)}
                                            >
                                                {interactionStats[item.id]?.isFavorite ? '❤️' : '🤍'}
                                            </button>
                                            <div className="list-progress-container">
                                                <ProgressBar percent={interactionStats[item.id]?.progressPercent || 0} />
                                            </div>
                                        </div>
                                    )}
								</div>
							</article>
						</Link>
					))}
				</div>
			</div>
		</section>
	)
}
