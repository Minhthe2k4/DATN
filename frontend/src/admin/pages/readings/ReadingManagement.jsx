import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { readingArticles, topics } from '../../data/adminData'
import { AdminPageHeader } from '../../components/console/AdminUi'
import { usePagination } from '../../hooks/usePagination'
import { modal } from '../../../utils/modalUtils'

import { 
  fetchReadingData, 
  normalizeArticleRow, 
  normalizeTopicRow 
} from './utils/readingUtils'

import { ReadingStats } from './components/ReadingStats'
import { ReadingArticleTable } from './components/ReadingArticleTable'
import { ReadingTopicTable } from './components/ReadingTopicTable'
import { ReadingTopArticles } from './components/ReadingTopArticles'
import { ReadingDifficultyChart } from './components/ReadingDifficultyChart'

export function ReadingManagement() {
  const [articles, setArticles] = useState(readingArticles)
  const [topicRows, setTopicRows] = useState(topics)
  const [isLoading, setIsLoading] = useState(true)
  const [statsData, setStatsData] = useState(null)

  // Filters for Articles
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTopicId, setFilterTopicId] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Filters for Topics
  const [searchTopicTerm, setSearchTopicTerm] = useState('')
  const [filterTopicStatus, setFilterTopicStatus] = useState('')

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesTopic = !filterTopicId || String(article.topicId) === String(filterTopicId)
      const matchesDifficulty = !filterDifficulty || article.difficulty === filterDifficulty
      const matchesStatus = !filterStatus || article.status === filterStatus
      return matchesSearch && matchesTopic && matchesDifficulty && matchesStatus
    })
  }, [articles, searchTerm, filterTopicId, filterDifficulty, filterStatus])

  const filteredTopics = useMemo(() => {
    return topicRows.filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(searchTopicTerm.toLowerCase())
      const matchesStatus = !filterTopicStatus || t.status === filterTopicStatus
      return matchesSearch && matchesStatus
    })
  }, [topicRows, searchTopicTerm, filterTopicStatus])

  const articlesPagination = usePagination(filteredArticles, 10)
  const topicsPagination = usePagination(filteredTopics, 10)

  useEffect(() => {
    let disposed = false
    async function loadData() {
      try {
        const data = await fetchReadingData()
        if (disposed) return
        
        setArticles(Array.isArray(data.articles) ? data.articles.map(normalizeArticleRow) : readingArticles)
        setTopicRows(Array.isArray(data.topics) ? data.topics.map(normalizeTopicRow) : topics)
        if (data.stats) setStatsData(data.stats)
      } catch {
        if (disposed) return
        setArticles(readingArticles)
        setTopicRows(topics)
        modal.error('Không thể tải dữ liệu bài đọc từ backend, đang hiển thị dữ liệu mẫu.')
      } finally {
        if (!disposed) setIsLoading(false)
      }
    }
    loadData()
    return () => { disposed = true }
  }, [])

  const topArticles = useMemo(() => {
    return [...articles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5)
  }, [articles])

  const difficultyData = useMemo(() => {
    const levels = ['Dễ', 'Trung bình', 'Khó']
    return levels.map(lvl => ({
      name: lvl,
      count: articles.filter(a => a.difficulty === lvl).length
    }))
  }, [articles])

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Reading Content"
          title="Quản lý bài đọc"
          description="Quản lý vòng đời bài đọc từ biên tập, phân loại đến xuất bản cho người học cuối."
          actions={
            <div className="d-flex gap-2">
              <Link to="/admin/reading-topics/new" className="btn btn-outline-primary d-flex align-items-center gap-2">
                <Plus size={18} /> Thêm chủ đề
              </Link>
              <Link to="/admin/readings/new" className="btn btn-primary d-flex align-items-center gap-2">
                <Plus size={18} /> Thêm bài báo mới
              </Link>
            </div>
          }
        />

        {isLoading ? <div className="alert alert-light border">Đang tải dữ liệu bài đọc từ backend...</div> : null}

        <ReadingStats statsData={statsData} articles={articles} />

        <div className="row g-3 mt-1">
          <div className="col-12 col-xl-9">
            <div className="d-flex flex-column gap-3">
              <ReadingArticleTable 
                articlesPagination={articlesPagination}
                filterDifficulty={filterDifficulty}
                setFilterDifficulty={setFilterDifficulty}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                filterTopicId={filterTopicId}
                setFilterTopicId={setFilterTopicId}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                topicRows={topicRows}
              />

              <ReadingTopicTable 
                topicsPagination={topicsPagination}
                filterTopicStatus={filterTopicStatus}
                setFilterTopicStatus={setFilterTopicStatus}
                searchTopicTerm={searchTopicTerm}
                setSearchTopicTerm={setSearchTopicTerm}
              />
            </div>
          </div>

          <div className="col-12 col-xl-3">
            <div className="d-flex flex-column gap-3">
              <ReadingTopArticles topArticles={topArticles} />
              <ReadingDifficultyChart difficultyData={difficultyData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
