/**
 * DEPRECATED: Admin Data Module
 * 
 * This file is now migrated to use API calls via admin-api.js
 * All hardcoded data has been replaced with API functions.
 * 
 * Components should migrate to import directly from @/lib/api/admin-api
 * 
 * Example Migration:
 *   OLD: import { adminSummary, lessons } from '@/admin/data/adminData'
 *   NEW: import { fetchAdminSummary, fetchLessons } from '@/lib/api/admin-api'
 *        const summary = await fetchAdminSummary()
 */

// Re-export API functions for backward compatibility during migration
export {
  fetchAdminSummary,
  fetchTrendSeries,
  fetchUserActivityLeaders,
  fetchTopics,
  fetchVocabularyEntries,
  fetchLessons,
  fetchReadingArticles,
  fetchVideoLessons,
  fetchUsers,
  fetchPremiumRequests,
  fetchSupportTickets,
  fetchRevenueData,
  fetchRoles,
} from '@/lib/api/admin-api'

/**
 * Static/Reference Data
 * These are kept as constants because they're reference data, not changing data
 */

/** Role definitions - reference data */
export const roleDefinitions = [
  {
    id: 'USER',
    name: 'Người dùng',
    permissions: ['view_content', 'learn', 'bookmark', 'practice'],
  },
  {
    id: 'ADMIN',
    name: 'Quản trị viên',
    permissions: [
      'view_analytics',
      'manage_content',
      'manage_users',
      'manage_premium',
      'view_reports',
    ],
  },
]

/** Governance checklist - reference data */
export const governanceChecklist = [
  { task: 'Duyệt Premium (yêu cầu chờ)', completed: false },
  { task: 'Kiểm tra báo cáo lỗi từ người dùng', completed: false },
  { task: 'Cập nhật đạo tục hành chính', completed: false },
  { task: 'Sao lưu dữ liệu hàng ngày', completed: false },
]

/**
 * DEPRECATED EXPORTS BELOW
 * These are kept for reference only - do not use in new code
 * All data should now come from API endpoints
 */

export const adminSummary = {
  totalUsers: 18420,
  activeUsers: 12784,
  newUsersToday: 164,
  dailyLogins: 5932,
  totalWords: 12680,
  totalLessons: 384,
  totalReadings: 142,
  totalVideos: 96,
  dailyStudySessions: 4210,
  dailyWordsLearned: 18354,
  lessonCompletionRate: 78,
  averageAccuracyRate: 84,
  dailyReviews: 6920,
  wordsInReview: 9824,
  scheduledReviews: 4281,
  masteredWords: 3650,
  premiumUsers: 2315,
  pendingPremiumRequests: 48,
}

export const trendSeries = [
  { label: 'T2', users: 28, words: 46, lessons: 11, reviews: 35 },
  { label: 'T3', users: 34, words: 52, lessons: 13, reviews: 38 },
  { label: 'T4', users: 31, words: 48, lessons: 15, reviews: 44 },
  { label: 'T5', users: 43, words: 60, lessons: 18, reviews: 51 },
  { label: 'T6', users: 47, words: 72, lessons: 17, reviews: 58 },
  { label: 'T7', users: 39, words: 55, lessons: 14, reviews: 49 },
  { label: 'CN', users: 36, words: 50, lessons: 12, reviews: 46 },
]

export const userActivityLeaders = [
  { name: 'Nguyen Linh', streak: 112, learnedWords: 820, completion: 94 },
  { name: 'Tran Nam', streak: 89, learnedWords: 760, completion: 91 },
  { name: 'Le Minh Thu', streak: 76, learnedWords: 704, completion: 88 },
  { name: 'Phan Bao', streak: 63, learnedWords: 655, completion: 86 },
]

export const topics = [
  {
    id: 'TOP-01',
    name: 'Business English',
    description: 'Từ vựng dùng trong email, họp và thuyết trình công việc.',
    defaultDifficulty: 'Trung bình',
    lessons: 28,
    words: 1240,
    status: 'Hoạt động',
  },
  {
    id: 'TOP-02',
    name: 'Travel & Tourism',
    description: 'Giao tiếp du lịch, sân bay, khách sạn và di chuyển.',
    defaultDifficulty: 'Cơ bản',
    lessons: 19,
    words: 760,
    status: 'Hoạt động',
  },
  {
    id: 'TOP-03',
    name: 'Academic Reading',
    description: 'Nội dung đọc học thuật để luyện đoán nghĩa theo ngữ cảnh.',
    defaultDifficulty: 'Nâng cao',
    lessons: 16,
    words: 910,
    status: 'Tạm dừng',
  },
  {
    id: 'TOP-04',
    name: 'Technology',
    description: 'Các khái niệm công nghệ, AI và phần mềm phổ biến.',
    defaultDifficulty: 'Trung bình',
    lessons: 22,
    words: 1045,
    status: 'Hoạt động',
  },
]

export const vocabularyEntries = [
  {
    id: 'VOC-1001',
    word: 'resilient',
    pronunciation: '/rɪˈzɪliənt/',
    part_of_speech: 'adjective',
    meaning_en: 'Able to recover quickly from difficulties.',
    meaning_vi: 'Kiên cường, bền bỉ, dẻo dai',
    example: 'The startup remained resilient during the downturn.',
    level: 'Trung bình',
    status: 'Đã duyệt',
    topic_id: 'TOP-01',
  },
  {
    id: 'VOC-1002',
    word: 'itinerary',
    pronunciation: '/aɪˈtɪnəˌreri/',
    part_of_speech: 'noun',
    meaning_en: 'A planned route or journey schedule.',
    meaning_vi: 'Lịch trình, kế hoạch chuyến đi',
    example: 'Please review your itinerary before check-in.',
    level: 'Cơ bản',
    status: 'Chờ rà soát',
    topic_id: 'TOP-02',
  },
  {
    id: 'VOC-1003',
    word: 'hypothesis',
    pronunciation: '/haɪˈpɑːθəsɪs/',
    part_of_speech: 'noun',
    meaning_en: 'A proposed explanation based on limited evidence.',
    meaning_vi: 'Giả thuyết, giả định',
    example: 'Students tested the hypothesis with new data.',
    level: 'Nâng cao',
    status: 'Đã duyệt',
    topic_id: 'TOP-03',
  },
  {
    id: 'VOC-1004',
    word: 'deploy',
    pronunciation: '/dɪˈplɔɪ/',
    part_of_speech: 'verb',
    meaning_en: 'To position or activate something for use.',
    meaning_vi: 'Triển khai, bố trí',
    example: 'The team will deploy the update tonight.',
    level: 'Trung bình',
    status: 'Đã duyệt',
    topic_id: 'TOP-04',
  },
  {
    id: 'VOC-1005',
    word: 'negotiate',
    pronunciation: '/nɪˈɡoʊʃieɪt/',
    part_of_speech: 'verb',
    meaning_en: 'To discuss terms and reach an agreement.',
    meaning_vi: 'Đàm phán, thương lượng',
    example: 'They will negotiate the contract terms.',
    level: 'Trung bình',
    status: 'Đã duyệt',
    topic_id: 'TOP-01',
  },
]

export const lessons = [
  {
    id: 'LES-201',
    name: 'Email Negotiation Basics',
    topic_id: 'TOP-01',
    description: 'Học cách viết email chuyên nghiệp, đàm phán và thuyết trình trong công việc.',
    difficulty: 'Trung bình',
    status: 'Đang mở',
  },
  {
    id: 'LES-202',
    name: 'Airport Survival Phrases',
    topic_id: 'TOP-02',
    description: 'Các cụm từ cần thiết khi đi máy bay, ra sân bay và xin hỗ trợ từ nhân viên.',
    difficulty: 'Cơ bản',
    status: 'Đang mở',
  },
  {
    id: 'LES-203',
    name: 'Reading Scientific Claims',
    topic_id: 'TOP-03',
    description: 'Phân tích và hiểu các tuyên bố khoa học, đoán nghĩa từ ngữ cảnh.',
    difficulty: 'Nâng cao',
    status: 'Nháp',
  },
  {
    id: 'LES-204',
    name: 'AI Product Vocabulary',
    topic_id: 'TOP-04',
    description: 'Thuật ngữ liên quan đến AI, máy học, và công nghệ sản phẩm hiện đại.',
    difficulty: 'Trung bình',
    status: 'Đang mở',
  },
  {
    id: 'LES-205',
    name: 'Hotel & Accommodation',
    topic_id: 'TOP-02',
    description: 'Từ vựng khi đặt phòng, check-in, check-out và yêu cầu dịch vụ tại khách sạn.',
    difficulty: 'Cơ bản',
    status: 'Đang mở',
  },
]

export const readingArticles = [
  {
    id: 'ART-31',
    title: 'How Teams Build Resilient Products',
    topic: 'Business English',
    difficulty: 'Trung bình',
    wordsHighlighted: 18,
    status: 'Đã xuất bản',
  },
  {
    id: 'ART-32',
    title: 'A Guide to Smart Travel Planning',
    topic: 'Travel & Tourism',
    difficulty: 'Cơ bản',
    wordsHighlighted: 14,
    status: 'Đã xuất bản',
  },
  {
    id: 'ART-33',
    title: 'Why Evidence Matters in Research',
    topic: 'Academic Reading',
    difficulty: 'Nâng cao',
    wordsHighlighted: 21,
    status: 'Chờ biên tập',
  },
  {
    id: 'ART-34',
    title: 'The Language of Product Deployment',
    topic: 'Technology',
    difficulty: 'Trung bình',
    wordsHighlighted: 16,
    status: 'Nháp',
  },
]

export const youtubeChannels = [
  {
    id: 'CH-01',
    name: 'Business English Pod',
    handle: '@BusinessEnglishPod',
    topic: 'Business English',
    videoCount: 1,
    status: 'Hoạt động',
  },
  {
    id: 'CH-02',
    name: 'English with Lucy',
    handle: '@EnglishWithLucy',
    topic: 'General',
    videoCount: 1,
    status: 'Hoạt động',
  },
  {
    id: 'CH-03',
    name: 'TED-Ed',
    handle: '@TEDEd',
    topic: 'Academic Reading',
    videoCount: 1,
    status: 'Hoạt động',
  },
  {
    id: 'CH-04',
    name: 'Fireship',
    handle: '@Fireship',
    topic: 'Technology',
    videoCount: 1,
    status: 'Tạm dừng',
  },
]

export const videoLessons = [
  {
    id: 'VID-11',
    channelId: 'CH-01',
    channelName: 'Business English Pod',
    title: 'Business Meeting Vocabulary in Context',
    topic: 'Business English',
    difficulty: 'Trung bình',
    duration: '12:30',
    youtubeUrl: '',
    wordsHighlighted: 26,
    status: 'Đã xuất bản',
  },
  {
    id: 'VID-12',
    channelId: 'CH-02',
    channelName: 'English with Lucy',
    title: 'Airport Dialogues for Travelers',
    topic: 'Travel & Tourism',
    difficulty: 'Cơ bản',
    duration: '09:45',
    youtubeUrl: '',
    wordsHighlighted: 18,
    status: 'Đã xuất bản',
  },
  {
    id: 'VID-13',
    channelId: 'CH-03',
    channelName: 'TED-Ed',
    title: 'Understanding Evidence in Academic Talks',
    topic: 'Academic Reading',
    difficulty: 'Nâng cao',
    duration: '15:05',
    youtubeUrl: '',
    wordsHighlighted: 31,
    status: 'Chờ biên tập',
  },
  {
    id: 'VID-14',
    channelId: 'CH-04',
    channelName: 'Fireship',
    title: 'AI Product Launch: Key Terms and Phrases',
    topic: 'Technology',
    difficulty: 'Trung bình',
    duration: '11:40',
    youtubeUrl: '',
    wordsHighlighted: 24,
    status: 'Nháp',
  },
]

export const users = [
  {
    id: 'USR-01',
    email: 'linh.nguyen@example.com',
    registeredAt: '14/02/2026',
    learnedWords: 1820,
    status: 'Hoạt động',
    premium: 'Premium',
    dailyLogin: '7 ngày liên tiếp',
  },
  {
    id: 'USR-02',
    email: 'nam.tran@example.com',
    registeredAt: '03/03/2026',
    learnedWords: 934,
    status: 'Bị khóa',
    premium: 'Free',
    dailyLogin: '2 ngày liên tiếp',
  },
  {
    id: 'USR-03',
    email: 'thu.le@example.com',
    registeredAt: '22/01/2026',
    learnedWords: 1458,
    status: 'Hoạt động',
    premium: 'Premium',
    dailyLogin: '15 ngày liên tiếp',
  },
  {
    id: 'USR-04',
    email: 'bao.phan@example.com',
    registeredAt: '11/03/2026',
    learnedWords: 210,
    status: 'Chờ xác minh',
    premium: 'Free',
    dailyLogin: 'Mới đăng ký',
  },
]

export const premiumRequests = [
  {
    id: 'PREQ-11',
    email: 'duy.vo@example.com',
    requestedAt: '14/03/2026 08:15',
    packageName: 'Premium 6 tháng',
    status: 'Chờ duyệt',
  },
  {
    id: 'PREQ-12',
    email: 'quyen.ha@example.com',
    requestedAt: '13/03/2026 19:20',
    packageName: 'Premium 12 tháng',
    status: 'Cần đối soát',
  },
  {
    id: 'PREQ-13',
    email: 'tuan.pham@example.com',
    requestedAt: '13/03/2026 11:05',
    packageName: 'Premium 1 tháng',
    status: 'Chờ duyệt',
  },
]

export const premiumMembers = [
  {
    id: 'PM-01',
    email: 'linh.nguyen@example.com',
    expiresAt: '14/09/2026',
    plan: 'Premium 6 tháng',
    action: 'Gia hạn',
  },
  {
    id: 'PM-02',
    email: 'thu.le@example.com',
    expiresAt: '21/12/2026',
    plan: 'Premium 12 tháng',
    action: 'Cập nhật thời hạn',
  },
  {
    id: 'PM-03',
    email: 'huy.dao@example.com',
    expiresAt: '02/04/2026',
    plan: 'Premium 1 tháng',
    action: 'Hủy quyền',
  },
]

export const spacedRepetitionConfig = [
  {
    key: 'Interval ban đầu',
    value: '1 ngày',
    note: 'Áp dụng cho thẻ mới sau lần học đầu tiên.',
  },
  {
    key: 'Hệ số tăng',
    value: 'x2.3',
    note: 'Tăng khi người học trả lời đúng liên tiếp.',
  },
  {
    key: 'Hệ số giảm',
    value: 'x0.55',
    note: 'Giảm khi người học trả lời sai hoặc bỏ qua.',
  },
  {
    key: 'Giới hạn tối đa',
    value: '120 ngày',
    note: 'Khoảng nghỉ tối đa trước khi rà soát lại.',
  },
]

export const resetCandidates = [
  {
    id: 'RST-01',
    email: 'nam.tran@example.com',
    reason: 'Dữ liệu học sai do import cũ',
    wordsTracked: 530,
  },
  {
    id: 'RST-02',
    email: 'bao.phan@example.com',
    reason: 'Yêu cầu reset để học lại từ đầu',
    wordsTracked: 210,
  },
]

export const reportGroups = [
  {
    title: 'Phân tích người dùng',
    description: 'Theo dõi tăng trưởng, đăng nhập, hoạt động và top người học.',
    metrics: [
      'Tổng số người dùng trong hệ thống',
      'Số lượng người dùng đang hoạt động',
      'Người dùng mới theo ngày, tuần, tháng',
      'Số đăng nhập mỗi ngày và top người dùng hoạt động nhất',
    ],
  },
  {
    title: 'Phân tích nội dung',
    description: 'Theo dõi độ phủ nội dung và tốc độ mở rộng dữ liệu học tập.',
    metrics: [
      'Tổng số từ, bài học, bài đọc và video học tập',
      'Số lượng từ mới được thêm theo thời gian',
      'Số bài học mới được tạo',
      'Tỷ lệ nội dung đang ở trạng thái nháp hoặc chờ duyệt',
    ],
  },
  {
    title: 'Phân tích học tập',
    description: 'Đo lường hiệu suất học và chất lượng bài học.',
    metrics: [
      'Tổng số buổi học mỗi ngày',
      'Tổng số từ được học mỗi ngày',
      'Tỷ lệ hoàn thành bài học',
      'Tỷ lệ trả lời đúng trung bình',
    ],
  },
  {
    title: 'Phân tích lặp lại có khoảng cách',
    description: 'Quan sát toàn bộ vòng lặp học - ôn - nắm vững.',
    metrics: [
      'Tổng số buổi xem lại hàng ngày',
      'Số từ đang trong quá trình học',
      'Số từ được lên lịch rà soát',
      'Số từ đã nắm vững',
    ],
  },
]

export const supportTickets = [
  {
    id: 'TKT-001',
    userName: 'Linh Nguyễn',
    email: 'linh.nguyen@example.com',
    topic: 'Tài khoản & đăng nhập',
    message: 'Tôi không thể đăng nhập bằng Google. Trang cứ báo lỗi redirect.',
    status: 'Chờ xử lý',
    createdAt: '12/03/2026',
  },
  {
    id: 'TKT-002',
    userName: 'Minh Trần',
    email: 'minh.tran@example.com',
    topic: 'Thanh toán & Premium',
    message: 'Tôi đã thanh toán gói 1 năm nhưng tài khoản vẫn chưa được nâng cấp.',
    status: 'Đang xử lý',
    createdAt: '11/03/2026',
  },
  {
    id: 'TKT-003',
    userName: 'Hoa Phạm',
    email: 'hoa.pham@example.com',
    topic: 'Nội dung học tập',
    message: 'Từ vựng trong bài Business English có một số từ bị sai nghĩa tiếng Việt.',
    status: 'Đã giải quyết',
    createdAt: '10/03/2026',
  },
  {
    id: 'TKT-004',
    userName: 'An Lê',
    email: 'an.le@example.com',
    topic: 'Tính năng ứng dụng',
    message: 'Chức năng phát âm không hoạt động trên Safari iPhone.',
    status: 'Chờ xử lý',
    createdAt: '13/03/2026',
  },
  {
    id: 'TKT-005',
    userName: 'Tú Vũ',
    email: 'tu.vu@example.com',
    topic: 'Báo lỗi ứng dụng',
    message: 'App bị crash khi tôi cố mở bài đọc từ trang chủ trên Android.',
    status: 'Đang xử lý',
    createdAt: '13/03/2026',
  },
]

export const revenueSummary = {
  totalRevenueThisMonth: 186500000,
  totalRevenueLastMonth: 171200000,
  totalRefundThisMonth: 8200000,
  arpu: 124000,
  conversionRate: 12.8,
}

export const revenueByPlan = [
  { id: 'REV-PLAN-1', plan: 'Premium 1 tháng', subscribers: 642, gross: 64200000, refunds: 1900000 },
  { id: 'REV-PLAN-2', plan: 'Premium 6 tháng', subscribers: 318, gross: 95400000, refunds: 4100000 },
  { id: 'REV-PLAN-3', plan: 'Premium 12 tháng', subscribers: 112, gross: 26900000, refunds: 2200000 },
]

export const monthlyRevenueTrend = [
  { label: 'T10', revenue: 128000000 },
  { label: 'T11', revenue: 143000000 },
  { label: 'T12', revenue: 157000000 },
  { label: 'T1', revenue: 162000000 },
  { label: 'T2', revenue: 171200000 },
  { label: 'T3', revenue: 186500000 },
]

export const revenueTransactions = [
  {
    id: 'PAY-9012',
    email: 'linh.nguyen@example.com',
    plan: 'Premium 6 tháng',
    amount: 300000,
    gateway: 'Momo',
    status: 'Thành công',
    createdAt: '13/03/2026 09:24',
  },
  {
    id: 'PAY-9013',
    email: 'an.le@example.com',
    plan: 'Premium 1 tháng',
    amount: 100000,
    gateway: 'ZaloPay',
    status: 'Hoàn tiền',
    createdAt: '13/03/2026 11:06',
  },
  {
    id: 'PAY-9014',
    email: 'hoa.pham@example.com',
    plan: 'Premium 12 tháng',
    amount: 240000,
    gateway: 'Stripe',
    status: 'Thành công',
    createdAt: '13/03/2026 14:18',
  },
  {
    id: 'PAY-9015',
    email: 'minh.tran@example.com',
    plan: 'Premium 1 tháng',
    amount: 100000,
    gateway: 'Momo',
    status: 'Đang xử lý',
    createdAt: '14/03/2026 08:42',
  },
]

export const adminNavGroups = [
  {
    label: 'Tổng quan',
    items: [
      { to: '/admin', label: 'Tổng quan điều hành', icon: 'iconoir-report-columns' },
      { to: '/admin/reports', label: 'Phân tích & báo cáo', icon: 'iconoir-stats-report' },
    ],
  },
  {
    label: 'Nội dung học tập',
    items: [
      { to: '/admin/topics', label: 'Quản lý chủ đề', icon: 'iconoir-folder' },
      { to: '/admin/lessons', label: 'Quản lý bài học', icon: 'iconoir-page' },
      { to: '/admin/vocabulary', label: 'Quản lý từ vựng', icon: 'iconoir-book' },
      { to: '/admin/readings', label: 'Quản lý bài đọc', icon: 'iconoir-journal-page' },
      { to: '/admin/videos', label: 'Quản lý video', icon: 'iconoir-play-solid' },
    ],
  },
  {
    label: 'Vận hành hệ thống',
    items: [
      { to: '/admin/users', label: 'Quản lý người dùng', icon: 'iconoir-community' },
      { to: '/admin/premium', label: 'Tài khoản Premium', icon: 'iconoir-star' },
      { to: '/admin/revenue', label: 'Quản lý doanh thu', icon: 'iconoir-wallet-solid' },
      { to: '/admin/spaced-repetition', label: 'Cấu hình Spaced Repetition', icon: 'iconoir-refresh-double' },
      { to: '/admin/roles', label: 'Phân quyền hệ thống', icon: 'iconoir-shield-check' },
      { to: '/admin/support', label: 'Hỗ trợ người dùng', icon: 'iconoir-chat-lines' },
    ],
  },
]