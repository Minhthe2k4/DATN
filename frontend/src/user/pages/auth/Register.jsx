import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
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

export function Register() {
	const navigate = useNavigate()
	const [fullName, setFullName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [submitError, setSubmitError] = useState('')

	const handleSubmit = async (event) => {
		event.preventDefault()

		if (password !== confirmPassword) {
			setSubmitError('Mật khẩu xác nhận không khớp.')
			return
		}

		try {
			setIsSubmitting(true)
			setSubmitError('')

			const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					fullName: fullName.trim(),
					email: email.trim(),
					password,
				}),
			})

			if (!response.ok) {
				const message = await extractErrorMessage(response, 'Đăng ký thất bại.')
				throw new Error(message || 'Đăng ký thất bại.')
			}

			const payload = await response.json()
			if (!payload?.userId) {
				throw new Error('Đăng ký thất bại.')
			}

			navigate('/login')
		} catch (error) {
			setSubmitError(error?.message || 'Đăng ký thất bại. Vui lòng thử lại.')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<section className="auth-page" aria-labelledby="register-title">
			<div className="auth-shell auth-shell--register">
				<aside className="auth-hero" aria-label="Lợi ích khi đăng ký">
					<h2>Bắt đầu hành trình ngôn ngữ với cách học thông minh.</h2>
					<p>Tạo tài khoản để lưu tiến độ, ôn lại từ vựng và duy trì chuỗi học hằng ngày.</p>
					<div className="auth-hero__chips">
						<span>Theo dõi cấp độ</span>
						<span>Lưu từ mới</span>
						<span>Bài kiểm tra cá nhân hóa</span>
					</div>
					<div className="auth-hero__stats">
						<div>
							<strong>24/7</strong>
							<span>Học mọi lúc</span>
						</div>
						<div>
							<strong>7 levels</strong>
							<span>Từ A1 đến C2</span>
						</div>
					</div>
				</aside>

				<div className="auth-card">
					<h1 id="register-title">Đăng ký tài khoản</h1>
					<p className="auth-subtitle">Tạo tài khoản mới để lưu tiến độ học và từ vựng cá nhân.</p>

					<form className="auth-form" onSubmit={handleSubmit}>
						<label className="auth-field">
							<span>Họ và tên</span>
							<input
								type="text"
								placeholder="Nguyễn Văn A"
								value={fullName}
								onChange={(event) => setFullName(event.target.value)}
								required
							/>
						</label>

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
								placeholder="Tạo mật khẩu"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								required
							/>
						</label>

						<label className="auth-field">
							<span>Xác nhận mật khẩu</span>
							<input
								type="password"
								placeholder="Nhập lại mật khẩu"
								value={confirmPassword}
								onChange={(event) => setConfirmPassword(event.target.value)}
								required
							/>
						</label>

						<button type="submit" className="auth-submit" disabled={isSubmitting}>
							{isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
						</button>
						{submitError ? <p className="text-danger small mb-0">{submitError}</p> : null}
					</form>

					<p className="auth-switch">
						Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
					</p>
				</div>
			</div>
		</section>
	)
}
