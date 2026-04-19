/**
 * API Service cho Video
 * Chứa tất cả các hàm gọi API liên quan đến video từ backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

/**
 * Lấy tất cả kênh video
 * @returns {Promise<Array>} Danh sách kênh video
 */
export const fetchAllVideoChannels = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/videos/channels`);
    if (!response.ok) {
      throw new Error('Failed to fetch channels');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching channels:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết kênh và danh sách video
 * @param {number} channelId - ID kênh
 * @returns {Promise<Object>} Thông tin kênh và video
 */
export const fetchChannelWithVideos = async (channelId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/videos/channels/${channelId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch channel');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching channel:', error);
    throw error;
  }
};

/**
 * Lấy tất cả video
 * @returns {Promise<Array>} Danh sách video
 */
export const fetchAllVideos = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/videos`);
    if (!response.ok) {
      throw new Error('Failed to fetch videos');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};

/**
 * Lấy thông tin video theo ID
 * @param {number} videoId - ID video
 * @returns {Promise<Object>} Thông tin video
 */
export const fetchVideoById = async (videoId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch video');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching video:', error);
    throw error;
  }
};

/**
 * Lấy video theo topic
 * @param {number} topicId - ID chủ đề
 * @returns {Promise<Array>} Danh sách video của chủ đề
 */
export const fetchVideosByTopic = async (topicId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/videos/topic/${topicId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch videos by topic');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching videos by topic:', error);
    throw error;
  }
};
