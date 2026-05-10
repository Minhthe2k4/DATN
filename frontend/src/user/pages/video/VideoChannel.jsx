import { Link, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { fetchChannelWithVideos, fetchAllVideoChannels } from '../../utils/videoApi'
import { getUserSession, getAuthHeader } from '../../utils/authSession'
import { makeChannelAvatar, makeVideoThumbnail } from './videoUtils'

import { ChannelHeader } from './components/ChannelHeader'
import { VideoItemCard } from './components/VideoItemCard'
import './videoChannel.css'

export function VideoChannel() {
	const { channelSlug } = useParams()
	const [channel, setChannel] = useState(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)
    const [interactionStats, setInteractionStats] = useState({})
    const userId = getUserSession()?.userId

	useEffect(() => {
		loadChannel()
	}, [channelSlug])

	const loadChannel = async () => {
		try {
			setIsLoading(true)
			const allChannels = await fetchAllVideoChannels()
			const matchedChannel = allChannels.find(ch => {
				const chSlug = ch.handle?.replace('@', '')?.toLowerCase() || `channel-${ch.id}`
				return chSlug === channelSlug?.toLowerCase()
			})
			
			if (!matchedChannel) {
				setError('Kênh không tìm thấy')
				setIsLoading(false)
				return
			}

			const data = await fetchChannelWithVideos(matchedChannel.id)
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
            .catch(err => console.error('Failed to fetch bulk stats', err))
        }
    }, [channel, userId])

    const handleToggleFavorite = async (e, videoId) => {
        e.preventDefault()
        e.stopPropagation()
        if (!userId) {
            alert('Vui lòng đăng nhập!')
            return
        }
        try {
            const res = await axios.post('/api/user/interaction/favorite/toggle', null, {
                params: { targetId: videoId, targetType: 'VIDEO' },
                headers: getAuthHeader()
            })
            setInteractionStats(prev => ({
                ...prev,
                [videoId]: { ...prev[videoId], isFavorite: res.data.isFavorite }
            }))
        } catch (err) {
            console.error('Failed to toggle favorite', err)
        }
    }

	if (isLoading) {
		return (
			<section className="video-channel-page">
				<div className="video-channel-page__container">
					<div className="video-loading">
						<div className="spinner"></div>
						<p>Đang tải thông tin kênh...</p>
					</div>
				</div>
			</section>
		)
	}

	if (!channel) {
		return (
			<section className="video-channel-page">
				<div className="video-channel-page__container">
					<div className="video-error-container">
						<h1>Không tìm thấy kênh</h1>
						<p>{error || 'Vui lòng chọn một kênh hợp lệ từ danh sách video.'}</p>
						<Link to="/video" className="video-channel__back">Quay lại Video</Link>
					</div>
				</div>
			</section>
		)
	}

	return (
		<section className="video-channel-page">
			<div className="video-channel-page__container">
				<ChannelHeader channel={channel} />

				{error && <div className="video-error-msg">Lưu ý: {error}</div>}

				<div className="channel-video-grid">
					{channel.videoList && channel.videoList.map((item) => (
						<VideoItemCard 
							key={item.id} 
							item={item} 
							channelSlug={channel.slug} 
							userId={userId} 
							stats={interactionStats[item.id]} 
							onToggleFavorite={handleToggleFavorite} 
						/>
					))}
				</div>
			</div>
		</section>
	)
}
