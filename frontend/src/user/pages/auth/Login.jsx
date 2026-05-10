import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { setUserSession } from '../../utils/authSession'
import { toast } from '@/utils/toastUtils'
import './auth.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

async function extractErrorMessage(response, fallbackMessage) {
	const contentType = response.headers.get('content-type') || ''

	if (contentType.includes('application/json')) {
		const payload = await response.json().catch(() => null)
		if (payload?.message) {
			return payload.message
		}
		if (payload?.error) {
			return payload.error
		}
		return fallbackMessage
	}

	const rawText = await response.text().catch(() => '')
	if (!rawText) {
		return fallbackMessage
	}

	try {
		const payload = JSON.parse(rawText)
		if (payload?.message) {
			return payload.message
		}
		if (payload?.error) {
			return payload.error
		}
	} catch {
		if (rawText.length <= 180) {
			return rawText
		}
	}

	return fallbackMessage
}

export function Login() {
	const navigate = useNavigate()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [submitError, setSubmitError] = useState('')

	const handleSubmit = async (event) => {
		event.preventDefault()

		try {
			setIsSubmitting(true)
			setSubmitError('')

			const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: email.trim(),
					password,
				}),
			})

			if (!response.ok) {
				const message = await extractErrorMessage(response, 'Đăng nhập thất bại.')
				throw new Error(message || 'Đăng nhập thất bại.')
			}

			const payload = await response.json()

			// Store JWT token for backend auth
			localStorage.setItem('token', payload.token)

			setUserSession({
				userId: payload.userId,
				username: payload.username,
				fullName: payload.fullName,
				avatar: payload.avatar,
				email: payload.email,
				role: payload.role,
				token: payload.token,
				loggedInAt: new Date().toISOString(),
			})

			toast.success('Đăng nhập thành công!')
			navigate('/')
		} catch (error) {
			const msg = error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
			setSubmitError(msg)
			toast.error(msg)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<section className="auth-page" aria-labelledby="login-title">
			<div className="auth-shell auth-shell--login">
				<aside className="auth-hero" aria-label="Điểm nổi bật học ngôn ngữ">
					<h2>Xây dựng thói quen học tiếng Anh mỗi ngày.</h2>
					<p>Luyện đọc, từ vựng và phát âm trong một lộ trình học cá nhân hóa.</p>
					<div className="auth-hero__chips">
						<span>Luyện đọc hằng ngày</span>
						<span>Ôn từ vựng</span>
						<span>Luyện phát âm</span>
					</div>
					<div className="auth-hero__stats">
						<div>
							<strong>12k+</strong>
							<span>Từ đã theo dõi</span>
						</div>
						<div>
							<strong>96%</strong>
							<span>Người dùng giữ streak tuần</span>
						</div>
					</div>
				</aside>

				<div className="auth-card">
					<h1 id="login-title">Đăng nhập</h1>
					<p className="auth-subtitle">Đăng nhập để tiếp tục hành trình học tiếng Anh của bạn.</p>

					<form className="auth-form" onSubmit={handleSubmit}>
						<label className="auth-field">
							<span>Email</span>
							<input
								type="email"
								placeholder="you@example.com"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								required
							/>
						</label>

						<label className="auth-field">
							<span>Mật khẩu</span>
							<input
								type="password"
								placeholder="Nhập mật khẩu"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								required
							/>
							<div className="auth-field-footer">
								<Link to="/forgot-password">Quên mật khẩu?</Link>
							</div>
						</label>

						<button type="submit" className="auth-submit" disabled={isSubmitting}>
							{isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
						</button>
						{submitError ? <p className="text-danger small mb-0">{submitError}</p> : null}
					</form>

					<p className="auth-switch">
						Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
					</p>
				</div>
			</div>
		</section>
	)
}
