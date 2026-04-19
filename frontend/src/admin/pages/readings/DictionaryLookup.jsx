import { useState } from 'react'
import { AdminPageHeader, AdminSectionCard } from '../../components/console/AdminUi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export function DictionaryLookup() {
  const [word, setWord] = useState('')
  const [contextSentence, setContextSentence] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleLookup = async (e) => {
    e.preventDefault()
    if (!word.trim()) {
      setError('Please enter a word')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/videos/lookup-word`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: word.trim(),
          contextSentence: contextSentence.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error: ${response.statusText}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err.message || 'Failed to lookup word')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Tra Từ Điển"
        subtitle="Tra cứu định nghĩa từ vựng từ Oxford Dictionary API"
        icon="📚"
      />

      <AdminSectionCard title="Nhập từ để tra cứu">
        <form onSubmit={handleLookup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Từ cần tra cứu
            </label>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Nhập từ tiếng Anh..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Câu hoặc ngữ cảnh (không bắt buộc)
            </label>
            <textarea
              value={contextSentence}
              onChange={(e) => setContextSentence(e.target.value)}
              placeholder="Nhập câu hoặc ngữ cảnh để giúp chọn nghĩa phù hợp..."
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Đang tra cứu...' : 'Tra cứu'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
      </AdminSectionCard>

      {result && (
        <AdminSectionCard title={`Kết quả: ${result.word}`}>
          <div className="space-y-6">
            {/* Header info */}
            <div className="border-b pb-4">
              <h3 className="text-2xl font-bold text-gray-900">{result.word}</h3>
              {result.normalizedWord && result.normalizedWord !== result.word && (
                <p className="text-sm text-gray-500">Dạng chuẩn: {result.normalizedWord}</p>
              )}
              {result.pronunciations && result.pronunciations.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  🔊 Phát âm: {result.pronunciations.join(', ')}
                </p>
              )}
              {result.level && (
                <p className="text-sm text-blue-600 mt-1">
                  📊 Cấp độ: {result.level}
                </p>
              )}
            </div>

            {/* Meanings */}
            {result.meanings && result.meanings.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Định nghĩa</h4>
                <div className="space-y-4">
                  {result.meanings.map((meaning, idx) => (
                    <div key={idx} className={`p-3 rounded-lg ${meaning.selected ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'}`}>
                      <div className="flex items-start gap-3">
                        <span className="inline-block bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          {meaning.partOfSpeech && (
                            <p className="font-semibold text-gray-700 italic">{meaning.partOfSpeech}</p>
                          )}
                          <p className="text-gray-900 mt-1">{meaning.meaningEn}</p>
                          {meaning.meaningVi && (
                            <p className="text-green-700 mt-2">🇻🇳 {meaning.meaningVi}</p>
                          )}
                          {meaning.example && (
                            <p className="text-gray-600 mt-2 italic">Ví dụ: "{meaning.example}"</p>
                          )}
                        </div>
                        {meaning.selected && (
                          <span className="text-blue-600 text-xl">✓</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Context info */}
            {result.contextSentence && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Ngữ cảnh:</span> {result.contextSentence}
                </p>
              </div>
            )}

            {/* Footer info */}
            <div className="pt-4 border-t text-xs text-gray-500 space-y-1">
              {result.source && <p>📖 Nguồn: {result.source}</p>}
              {result.aiUsed !== undefined && (
                <p>🤖 {result.aiUsed ? 'AI được sử dụng để chọn nghĩa phù hợp' : 'Sử dụng logic cơ bản'}</p>
              )}
            </div>
          </div>
        </AdminSectionCard>
      )}
    </div>
  )
}
