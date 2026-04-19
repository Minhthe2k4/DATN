import { useEffect, useState } from 'react'
import './supportManager.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export function SupportManager() {
	const [mode, setMode] = useState('list') // 'list', 'create', 'detail'
	const [tickets, setTickets] = useState([])
	const [selectedTicket, setSelectedTicket] = useState(null)
	const [ticketResponses, setTicketResponses] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	// Form state
	const [formTitle, setFormTitle] = useState('')
	const [formMessage, setFormMessage] = useState('')
	const [replyMessage, setReplyMessage] = useState('')

	// Fetch user's support tickets
	useEffect(() => {
		if (mode === 'list') {
			fetchTickets()
		}
	}, [mode])

	const fetchTickets = async () => {
		setIsLoading(true)
		setError('')
		try {
			const response = await fetch(`${API_BASE_URL}/api/user/support/tickets`, {
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				}
			})

			if (!response.ok) {
				throw new Error(`Failed to fetch tickets: ${response.status}`)
			}

			const data = await response.json()
			setTickets(Array.isArray(data) ? data : [])
		} catch (err) {
			console.error('Error fetching tickets:', err)
			setError('Không thể tải danh sách tickets. Vui lòng thử lại.')
			setTickets([])
		} finally {
			setIsLoading(false)
		}
	}

	const fetchTicketDetail = async (ticketId) => {
		setIsLoading(true)
		setError('')
		try {
			const [ticketRes, responsesRes] = await Promise.all([
				fetch(`${API_BASE_URL}/api/user/support/tickets/${ticketId}`, {
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' }
				}),
				fetch(`${API_BASE_URL}/api/user/support/tickets/${ticketId}/responses`, {
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' }
				})
			])

			if (!ticketRes.ok || !responsesRes.ok) {
				throw new Error('Failed to fetch ticket details')
			}

			const ticket = await ticketRes.json()
			const responses = await responsesRes.json()

			setSelectedTicket(ticket)
			setTicketResponses(Array.isArray(responses) ? responses : [])
			setMode('detail')
		} catch (err) {
			console.error('Error fetching ticket detail:', err)
			setError('Không thể tải chi tiết ticket.')
		} finally {
			setIsLoading(false)
		}
	}

	const handleCreateTicket = async (e) => {
		e.preventDefault()
		setError('')
		setSuccess('')

		if (!formTitle.trim()) {
			setError('Vui lòng nhập tiêu đề')
			return
		}

		if (!formMessage.trim()) {
			setError('Vui lòng nhập nội dung')
			return
		}

		setIsLoading(true)

		try {
			const response = await fetch(`${API_BASE_URL}/api/user/support/tickets`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: formTitle.trim(),
					message: formMessage.trim()
				})
			})

			if (!response.ok) {
				throw new Error(`Failed to create ticket: ${response.status}`)
			}

			setSuccess('Gửi yêu cầu hỗ trợ thành công!')
			setFormTitle('')
			setFormMessage('')

			// Refresh tickets list
			setTimeout(() => {
				fetchTickets()
				setMode('list')
			}, 1500)
		} catch (err) {
			console.error('Error creating ticket:', err)
			setError('Không thể gửi yêu cầu. Vui lòng thử lại.')
		} finally {
			setIsLoading(false)
		}
	}

	const handleAddReply = async (e) => {
		e.preventDefault()
		setError('')
		setSuccess('')

		if (!replyMessage.trim()) {
			setError('Vui lòng nhập nội dung')
			return
		}

		setIsLoading(true)

		try {
			const response = await fetch(`${API_BASE_URL}/api/user/support/tickets/${selectedTicket.id}/reply`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: replyMessage.trim() })
			})

			if (!response.ok) {
				throw new Error(`Failed to add reply: ${response.status}`)
			}

			setSuccess('Gửi phản hồi thành công!')
			setReplyMessage('')

			// Refresh ticket detail
			setTimeout(() => {
				fetchTicketDetail(selectedTicket.id)
			}, 1000)
		} catch (err) {
			console.error('Error adding reply:', err)
			setError('Không thể gửi phản hồi. Vui lòng thử lại.')
		} finally {
			setIsLoading(false)
		}
	}

	const handleCloseTicket = async () => {
		if (!window.confirm('Bạn chắc chắn muốn đóng ticket này?')) return

		setIsLoading(true)
		setError('')

		try {
			const response = await fetch(`${API_BASE_URL}/api/user/support/tickets/${selectedTicket.id}/close`, {
				method: 'PUT',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' }
			})

			if (!response.ok) {
				throw new Error('Failed to close ticket')
			}

			setSuccess('Ticket đã được đóng!')
			setTimeout(() => {
				fetchTickets()
				setMode('list')
			}, 1000)
		} catch (err) {
			console.error('Error closing ticket:', err)
			setError('Không thể đóng ticket. Vui lòng thử lại.')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="support-manager">
			<div className="support-container">
				{mode === 'list' && (
					<div className="support-list-view">
						<div className="support-header">
							<h2>Hỗ Trợ Khách Hàng</h2>
							<button
								type="button"
								className="support-btn support-btn--primary"
								onClick={() => setMode('create')}
							>
								➕ Gửi Yêu Cầu Hỗ Trợ
							</button>
						</div>

						{error && <div className="support-alert support-alert--error">{error}</div>}
						{success && <div className="support-alert support-alert--success">{success}</div>}

						{isLoading && <div className="support-loading">Đang tải...</div>}

						{!isLoading && tickets.length === 0 && (
							<div className="support-empty">
								<p>Bạn chưa tạo yêu cầu hỗ trợ nào.</p>
								<button
									type="button"
									className="support-btn support-btn--primary"
									onClick={() => setMode('create')}
								>
									Tạo yêu cầu mới
								</button>
							</div>
						)}

						{!isLoading && tickets.length > 0 && (
							<div className="support-tickets">
								{tickets.map((ticket) => (
									<div key={ticket.id} className={`support-ticket support-ticket--${ticket.status || 'open'}`}>
										<div className="support-ticket__header">
											<div className="support-ticket__title">{ticket.title}</div>
											<span className="support-ticket__status">{ticket.status === 'closed' ? '🔒 Đóng' : '🔵 Mở'}</span>
										</div>
										<div className="support-ticket__preview">{ticket.message.slice(0, 100)}...</div>
										<div className="support-ticket__meta">
											<span className="support-ticket__date">
												{new Date(ticket.createdAt).toLocaleDateString('vi-VN')}
											</span>
											<button
												type="button"
												className="support-ticket__view-btn"
												onClick={() => fetchTicketDetail(ticket.id)}
											>
												Xem Chi Tiết →
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{mode === 'create' && (
					<div className="support-create-view">
						<div className="support-back">
							<button type="button" className="support-btn support-btn--ghost" onClick={() => setMode('list')}>
								← Quay Lại
							</button>
							<h2>Gửi Yêu Cầu Hỗ Trợ</h2>
						</div>

						{error && <div className="support-alert support-alert--error">{error}</div>}
						{success && <div className="support-alert support-alert--success">{success}</div>}

						<form onSubmit={handleCreateTicket} className="support-form">
							<div className="support-form-group">
								<label>Tiêu Đề *</label>
								<input
									type="text"
									placeholder="Nhập tiêu đề yêu cầu..."
									value={formTitle}
									onChange={(e) => setFormTitle(e.target.value)}
									disabled={isLoading}
									required
								/>
							</div>

							<div className="support-form-group">
								<label>Nội Dung *</label>
								<textarea
									placeholder="Mô tả chi tiết về vấn đề của bạn..."
									value={formMessage}
									onChange={(e) => setFormMessage(e.target.value)}
									disabled={isLoading}
									rows="8"
									required
								/>
							</div>

							<div className="support-form-actions">
								<button
									type="button"
									className="support-btn support-btn--ghost"
									onClick={() => setMode('list')}
									disabled={isLoading}
								>
									Hủy
								</button>
								<button type="submit" className="support-btn support-btn--primary" disabled={isLoading}>
									{isLoading ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
								</button>
							</div>
						</form>
					</div>
				)}

				{mode === 'detail' && selectedTicket && (
					<div className="support-detail-view">
						<div className="support-back">
							<button type="button" className="support-btn support-btn--ghost" onClick={() => setMode('list')}>
								← Quay Lại
							</button>
							<h2>{selectedTicket.title}</h2>
						</div>

						{error && <div className="support-alert support-alert--error">{error}</div>}
						{success && <div className="support-alert support-alert--success">{success}</div>}

						<div className="support-detail-content">
							<div className="support-ticket-info">
								<div className="support-info-item">
									<span className="support-label">Trạng Thái:</span>
									<span className="support-value">{selectedTicket.status === 'closed' ? '🔒 Đóng' : '🔵 Mở'}</span>
								</div>
								<div className="support-info-item">
									<span className="support-label">Ngày Tạo:</span>
									<span className="support-value">
										{new Date(selectedTicket.createdAt).toLocaleDateString('vi-VN', {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit'
										})}
									</span>
								</div>
							</div>

							<div className="support-message-box">
								<h3>Yêu Cầu Của Bạn</h3>
								<div className="support-message-content">{selectedTicket.message}</div>
							</div>

							{ticketResponses.length > 0 && (
								<div className="support-responses">
									<h3>Phản Hồi</h3>
									<div className="support-responses-list">
										{ticketResponses.map((resp, idx) => (
											<div key={resp.id || idx} className="support-response">
												<div className="support-response-header">
													<span className="support-response-author">
														{resp.admin ? '🛠️ Admin' : '👤 Bạn'}
													</span>
													<span className="support-response-date">
														{new Date(resp.createdAt).toLocaleDateString('vi-VN', {
															year: 'numeric',
															month: 'long',
															day: 'numeric',
															hour: '2-digit',
															minute: '2-digit'
														})}
													</span>
												</div>
												<div className="support-response-content">{resp.response}</div>
											</div>
										))}
									</div>
								</div>
							)}

							{selectedTicket.status !== 'closed' && (
								<form onSubmit={handleAddReply} className="support-reply-form">
									<h3>Phản Hồi</h3>
									<textarea
										placeholder="Nhập phản hồi của bạn..."
										value={replyMessage}
										onChange={(e) => setReplyMessage(e.target.value)}
										disabled={isLoading}
										rows="4"
									/>
									<div className="support-reply-actions">
										<button
											type="submit"
											className="support-btn support-btn--primary"
											disabled={isLoading}
										>
											{isLoading ? 'Đang gửi...' : 'Gửi Phản Hồi'}
										</button>
										<button
											type="button"
											className="support-btn support-btn--danger"
											onClick={handleCloseTicket}
											disabled={isLoading}
										>
											Đóng Ticket
										</button>
									</div>
								</form>
							)}

							{selectedTicket.status === 'closed' && (
								<div className="support-closed-notice">
									<p>Ticket này đã được đóng. Bạn có thể tạo yêu cầu mới nếu cần hỗ trợ thêm.</p>
									<button
										type="button"
										className="support-btn support-btn--primary"
										onClick={() => {
											setMode('list')
											fetchTickets()
										}}
									>
										Tạo Yêu Cầu Mới
									</button>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
