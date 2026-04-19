import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { setUserSession } from '../../utils/authSession'
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
			
			// Store userId as token for simple backend auth
			localStorage.setItem('token', payload.userId)

			setUserSession({
				userId: payload.userId,
				username: payload.username,
				fullName: payload.fullName,
				email: payload.email,
				role: payload.role,
				loggedInAt: new Date().toISOString(),
			})

			navigate('/')
		} catch (error) {
			setSubmitError(error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.')
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
						</label>

						<button type="submit" className="auth-submit" disabled={isSubmitting}>
							{isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
						</button>
						{submitError ? <p className="text-danger small mb-0">{submitError}</p> : null}
					</form>

					<div className="auth-separator" role="presentation"><span>hoặc tiếp tục với</span></div>
					<div className="auth-social-row">
						<button type="button" className="auth-social-btn" aria-label="Tiếp tục với Google">
							<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
								<path d="M21.35 12.23c0-.69-.06-1.36-.18-2.01H12v3.8h5.24a4.48 4.48 0 01-1.95 2.95v2.45h3.16c1.85-1.7 2.9-4.2 2.9-7.19z" fill="#4285F4" />
								<path d="M12 21.75c2.63 0 4.84-.87 6.46-2.35l-3.16-2.45c-.88.59-2 .94-3.3.94-2.54 0-4.69-1.72-5.46-4.03H3.28v2.53A9.75 9.75 0 0012 21.75z" fill="#34A853" />
								<path d="M6.54 13.86a5.85 5.85 0 010-3.72V7.61H3.28a9.76 9.76 0 000 8.78l3.26-2.53z" fill="#FBBC05" />
								<path d="M12 6.11c1.43 0 2.71.49 3.72 1.45l2.79-2.79A9.31 9.31 0 0012 2.25 9.75 9.75 0 003.28 7.61l3.26 2.53c.77-2.31 2.92-4.03 5.46-4.03z" fill="#EA4335" />
							</svg>
							<span>Google</span>
						</button>
						<button type="button" className="auth-social-btn" aria-label="Tiếp tục với Facebook">
							<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
								<path d="M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.62.77-1.62 1.56V12h2.76l-.44 2.89h-2.32v6.99A10 10 0 0022 12z" fill="#1877F2" />
								<path d="M15.57 14.89L16 12h-2.76v-1.87c0-.79.38-1.56 1.62-1.56h1.26V6.11s-1.15-.2-2.24-.2c-2.28 0-3.77 1.38-3.77 3.89V12H7.57v2.89h2.54v6.99a10.08 10.08 0 003.12 0v-6.99h2.34z" fill="#ffffff" />
							</svg>
							<span>Facebook</span>
						</button>
					</div>

					<p className="auth-switch">
						Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
					</p>
				</div>
			</div>
		</section>
	)
}
