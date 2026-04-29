import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AdminPageHeader, AdminSectionCard } from '../components/console/AdminUi'
import { RotateCcw, Trash2, Search, Info } from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

const CATEGORIES = [
  { id: 'users', label: 'Người dùng', endpoint: 'users' },
  { id: 'topics', label: 'Chủ đề học tập', endpoint: 'topics' },
  { id: 'lessons', label: 'Bài học', endpoint: 'lessons' },
  { id: 'vocabulary', label: 'Từ vựng', endpoint: 'vocabulary' },
  { id: 'readings', label: 'Bài đọc', endpoint: 'readings' },
  { id: 'reading-topics', label: 'Chủ đề bài đọc', endpoint: 'reading-topics' },
  { id: 'videos', label: 'Video', endpoint: 'videos' },
  { id: 'video-channels', label: 'Kênh YouTube', endpoint: 'video-channels' },
]

export default function RecycleBin() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0])
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchDeletedItems()
  }, [activeCategory])

  const fetchDeletedItems = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/${activeCategory.endpoint}/deleted`)
      if (!response.ok) throw new Error('Không thể tải dữ liệu thùng rác')
      const data = await response.json()
      setItems(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestore = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn khôi phục mục này?')) return
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/${activeCategory.endpoint}/${id}/restore`, {
        method: 'PATCH'
      })
      if (!response.ok) throw new Error('Khôi phục thất bại')
      setSuccess('Đã khôi phục thành công!')
      fetchDeletedItems()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleHardDelete = async (id) => {
    if (!window.confirm('CẢNH BÁO: Hành động này sẽ xóa vĩnh viễn dữ liệu và không thể khôi phục. Bạn có chắc chắn?')) return
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/${activeCategory.endpoint}/${id}?force=true`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Xóa vĩnh viễn thất bại')
      setSuccess('Đã xóa vĩnh viễn dữ liệu.')
      fetchDeletedItems()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
    }
  }

  const filteredItems = items.filter(item => {
    const name = item.name || item.title || item.username || item.word || ''
    return name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Quản trị hệ thống"
          title="Thùng rác"
          description="Khôi phục hoặc xóa vĩnh viễn các dữ liệu đã xóa tạm thời."
        />

        <div className="row g-3">
          <div className="col-12 col-lg-3">
            <AdminSectionCard title="Danh mục">
              <div className="list-group list-group-flush mx-n3">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    className={`list-group-item list-group-item-action border-0 px-4 py-3 ${activeCategory.id === cat.id ? 'active bg-primary-subtle text-primary fw-bold' : ''}`}
                    onClick={() => {
                        setActiveCategory(cat)
                        setSearchTerm('')
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </AdminSectionCard>
          </div>

          <div className="col-12 col-lg-9">
            <AdminSectionCard title={`Danh sách ${activeCategory.label} đã xóa`}>
              <div className="mb-4">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0"><Search size={18} /></span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder={`Tìm kiếm trong ${activeCategory.label}...`}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {success && <div className="alert alert-success">{success}</div>}
              {error && <div className="alert alert-danger">{error}</div>}

              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
                </div>
              ) : filteredItems.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Tên / Tiêu đề</th>
                        <th>Ngày xóa</th>
                        <th className="text-end">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map(item => (
                        <tr key={item.id}>
                          <td><code>#{item.id}</code></td>
                          <td>
                            <div className="fw-semibold text-dark">
                                {item.name || item.title || item.username || item.word}
                            </div>
                            {item.email && <small className="text-muted">{item.email}</small>}
                          </td>
                          <td>
                            <div className="small text-muted">
                                {item.deletedAt ? new Date(item.deletedAt).toLocaleString('vi-VN') : 'N/A'}
                            </div>
                          </td>
                          <td className="text-end">
                            <div className="d-flex gap-2 justify-content-end">
                              <button
                                className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                                onClick={() => handleRestore(item.id)}
                                title="Khôi phục"
                              >
                                <RotateCcw size={14} /> Khôi phục
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                                onClick={() => handleHardDelete(item.id)}
                                title="Xóa vĩnh viễn"
                              >
                                <Trash2 size={14} /> Xóa hẳn
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5 bg-light rounded-3 border border-dashed">
                  <div className="mb-3 text-muted opacity-50"><Trash2 size={48} /></div>
                  <h5>Thùng rác trống</h5>
                  <p className="text-muted">Không có mục nào thuộc danh mục này trong thùng rác.</p>
                </div>
              )}

              <div className="mt-4 p-3 bg-light rounded-3 border border-info-subtle border-start-4">
                <div className="d-flex gap-2 text-info">
                  <Info size={20} className="flex-shrink-0" />
                  <div className="small">
                    <strong>Ghi chú:</strong> Dữ liệu trong thùng rác vẫn chiếm dung lượng hệ thống. Bạn nên xóa vĩnh viễn các mục không còn giá trị để tối ưu cơ sở dữ liệu.
                  </div>
                </div>
              </div>
            </AdminSectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}
