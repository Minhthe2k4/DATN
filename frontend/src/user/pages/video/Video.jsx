import './video.css'
import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { fetchAllVideoChannels } from '../../utils/videoApi'
import { getUserSession, getAuthHeader } from '../../utils/authSession'
import { makeChannelThumbnail, makeChannelAvatar } from './videoUtils'
import { VideoPageHeader } from './components/VideoPageHeader'
import { ChannelCard } from './components/ChannelCard'
import { FavoriteVideoCard } from './components/FavoriteVideoCard'

export function Video() {
    const session = getUserSession()
    const userId = session?.userId ? Number(session.userId) : null

	const [channels, setChannels] = useState([])
    const [favoriteVideos, setFavoriteVideos] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)
    const [viewMode, setViewMode] = useState('channels')
    const [searchTerm, setSearchTerm] = useState('')
    const [interactionStats, setInteractionStats] = useState({})

	useEffect(() => {
		loadChannels()
	}, [])

	const loadChannels = async () => {
		try {
			setIsLoading(true)
			const data = await fetchAllVideoChannels()
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
            const res = await axios.get('/api/user/interaction/favorites/VIDEO', { headers: getAuthHeader() })
            const favIds = res.data.map(f => f.targetId)
            const allVideosRes = await axios.get('/api/videos') 
            const favVideos = allVideosRes.data.filter(v => favIds.includes(v.id))
            setFavoriteVideos(favVideos)
        } catch (err) {
            console.error('Failed to load favorite videos:', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (viewMode === 'favorites') loadFavorites()
        else loadChannels()
    }, [viewMode])

    useEffect(() => {
        if (favoriteVideos.length > 0 && userId) {
            axios.post('/api/user/interaction/bulk-stats', {
                targetIds: favoriteVideos.map(v => v.id),
                targetType: 'VIDEO'
            }, { headers: getAuthHeader() })
            .then(res => setInteractionStats(res.data))
            .catch(err => console.error('Failed to fetch bulk stats', err))
        }
    }, [favoriteVideos, userId])

    const handleToggleFavorite = async (e, videoId) => {
        e.preventDefault()
        e.stopPropagation()
        try {
            const res = await axios.post('/api/user/interaction/favorite/toggle', null, {
                params: { targetId: videoId, targetType: 'VIDEO' },
                headers: getAuthHeader()
            })
            if (!res.data.isFavorite) {
                setFavoriteVideos(prev => prev.filter(v => v.id !== videoId))
            }
            setInteractionStats(prev => ({
                ...prev,
                [videoId]: { ...prev[videoId], isFavorite: res.data.isFavorite }
            }))
        } catch (err) {
            console.error('Failed to toggle favorite', err)
        }
    }

    const filteredChannels = useMemo(() => {
        return channels.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.handle.toLowerCase().includes(searchTerm.toLowerCase()))
    }, [channels, searchTerm])

    const filteredFavorites = useMemo(() => {
        return favoriteVideos.filter(v => v.title.toLowerCase().includes(searchTerm.toLowerCase()))
    }, [favoriteVideos, searchTerm])

	if (isLoading) {
		return (
			<section className="video-page">
				<div className="video-page__container">
					<div className="video-loading">
						<div className="spinner"></div>
						<p>Đang tải dữ liệu video...</p>
					</div>
				</div>
			</section>
		)
	}

	return (
		<section className="video-page">
			<div className="video-page__container">
				<VideoPageHeader 
					viewMode={viewMode} 
					setViewMode={setViewMode} 
					searchTerm={searchTerm} 
					setSearchTerm={setSearchTerm} 
				/>

				{error && <div className="video-error-msg">Lưu ý: {error}</div>}

				<div className="video-grid">
					{viewMode === 'channels' ? (
                        filteredChannels.map((channel) => (
                            <ChannelCard key={channel.id} channel={channel} />
                        ))
                    ) : (
                        filteredFavorites.map((video) => (
                            <FavoriteVideoCard 
								key={video.id} 
								video={video} 
								stats={interactionStats[video.id]} 
								onToggleFavorite={handleToggleFavorite} 
							/>
                        ))
                    )}
				</div>
				
                {!isLoading && viewMode === 'channels' && filteredChannels.length === 0 && <p className="empty-msg">Không tìm thấy kênh nào.</p>}
                {!isLoading && viewMode === 'favorites' && filteredFavorites.length === 0 && <p className="empty-msg">{userId ? 'Bạn chưa lưu video nào.' : 'Vui lòng đăng nhập để xem video đã lưu.'}</p>}
			</div>
		</section>
	)
}
