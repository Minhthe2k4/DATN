import './video.css'
import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { fetchAllVideoChannels } from '../../utils/videoApi'
import { getUserSession, getAuthHeader } from '../../utils/authSession'
import ProgressBar from '../../components/interaction/ProgressBar';
import axios from 'axios'
import '../../components/interaction/interaction.css';


export function Video() {
    const session = getUserSession()
    const userId = session?.userId ? Number(session.userId) : null

	const [channels, setChannels] = useState([])
    const [favoriteVideos, setFavoriteVideos] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)
    const [viewMode, setViewMode] = useState('channels') // 'channels' or 'favorites'
    const [searchTerm, setSearchTerm] = useState('')
    const [interactionStats, setInteractionStats] = useState({}); // { videoId: { isFavorite, progressPercent } }

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
				verified: true, 
				thumbnail: makeChannelThumbnail(channel.name),
				avatar: makeChannelAvatar(channel.name),
				coverColor: '#93c5fd',
			}))
			setChannels(transformedChannels)
			setError(null)
		} catch (err) {
			console.error('Failed to load channels:', err)
			setError('Không thể tải danh sách kênh.')
		} finally {
			setIsLoading(false)
		}
	}

    const loadFavorites = async () => {
        if (!userId) return
        try {
            setIsLoading(true)
            const res = await axios.get('/api/user/interaction/favorites/VIDEO', {
                headers: getAuthHeader()
            })
            const favIds = res.data.map(f => f.targetId)
            
            // Fetch all videos and filter (again, simple but works)
            const allVideosRes = await axios.get('/api/videos') 
            // Note: I might need to add this endpoint to VideoController
            const favVideos = allVideosRes.data.filter(v => favIds.includes(v.id))
            setFavoriteVideos(favVideos)
        } catch (err) {
            console.error('Failed to load favorite videos:', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (viewMode === 'favorites') {
            loadFavorites()
        } else {
            loadChannels()
        }
    }, [viewMode])

    useEffect(() => {
        if (favoriteVideos.length > 0 && userId) {
            axios.post('/api/user/interaction/bulk-stats', {
                targetIds: favoriteVideos.map(v => v.id),
                targetType: 'VIDEO'
            }, { headers: getAuthHeader() })
            .then(res => setInteractionStats(res.data))
            .catch(err => console.error('Failed to fetch bulk stats', err));
        }
    }, [favoriteVideos, userId]);

    const handleToggleFavorite = async (e, videoId) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const res = await axios.post('/api/user/interaction/favorite/toggle', null, {
                params: { targetId: videoId, targetType: 'VIDEO' },
                headers: getAuthHeader()
            });
            // Update local state
            if (!res.data.isFavorite) {
                setFavoriteVideos(prev => prev.filter(v => v.id !== videoId));
            }
            setInteractionStats(prev => ({
                ...prev,
                [videoId]: { ...prev[videoId], isFavorite: res.data.isFavorite }
            }));
        } catch (err) {
            console.error('Failed to toggle favorite', err);
        }
    };

    const filteredChannels = useMemo(() => {
        return channels.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.handle.toLowerCase().includes(searchTerm.toLowerCase()))
    }, [channels, searchTerm])

    const filteredFavorites = useMemo(() => {
        return favoriteVideos.filter(v => v.title.toLowerCase().includes(searchTerm.toLowerCase()))
    }, [favoriteVideos, searchTerm])

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
						<div className="video-page__view-selector">
							<button 
                                className={`view-tab ${viewMode === 'channels' ? 'is-active' : ''}`}
                                onClick={() => setViewMode('channels')}
                            >
                                Kênh video
                            </button>
							<button 
                                className={`view-tab ${viewMode === 'favorites' ? 'is-active' : ''}`}
                                onClick={() => setViewMode('favorites')}
                            >
                                ❤️ Yêu thích
                            </button>
						</div>
						<div className="video-search">
                            <input 
                                type="text" 
                                placeholder={viewMode === 'channels' ? "Tìm kiếm kênh..." : "Tìm kiếm video đã lưu..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
					</div>
				</header>

				{error && (
					<div style={{ padding: '10px', backgroundColor: '#fef3c7', color: '#b45309', borderRadius: '4px', marginBottom: '20px' }}>
						Lưu ý: {error}
					</div>
				)}

				<div className="video-grid">
					{viewMode === 'channels' ? (
                        filteredChannels.map((channel) => (
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
                        ))
                    ) : (
                        filteredFavorites.map((video) => (
                            <Link to={`/video/channel/watch/${video.id}`} className="video-card-link" key={video.id}>
                                <article className="video-card video-fav-card">
                                    <div className="video-card__media-wrap">
                                        <img src={makeVideoThumbnail(video.title)} alt={video.title} className="video-card__media" />
                                        <span className="video-card__duration">{video.duration}</span>
                                    </div>
                                    <div className="video-card__body">
                                        <div className="video-card__content">
                                            <h2>{video.title}</h2>
                                            <p className="video-card__meta">{video.difficulty} • {video.channelName || 'N/A'}</p>
                                        </div>
                                        <div className="video-card__interaction">
                                            <button 
                                                className="list-favorite-btn active"
                                                onClick={(e) => handleToggleFavorite(e, video.id)}
                                            >
                                                ❤️
                                            </button>
                                            <div className="list-progress-container">
                                                <ProgressBar percent={interactionStats[video.id]?.progressPercent || 0} />
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))
                    )}
				</div>
                {!isLoading && viewMode === 'channels' && filteredChannels.length === 0 && <p className="empty-msg">Không tìm thấy kênh nào.</p>}
                {!isLoading && viewMode === 'favorites' && filteredFavorites.length === 0 && <p className="empty-msg">{userId ? 'Bạn chưa lưu video nào.' : 'Vui lòng đăng nhập để xem video đã lưu.'}</p>}
			</div>
		</section>
	)
}

