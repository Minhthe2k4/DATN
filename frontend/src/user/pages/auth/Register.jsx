import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { toast } from '@/utils/toastUtils'
import './auth.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

/**
 * Hàm hỗ trợ trích xuất thông báo lỗi từ phản hồi của Backend.
 */
async function extractErrorMessage(response, fallbackMessage) {
	// Lấy kiểu dữ liệu trả về (JSON hoặc Text)
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
	const [phoneNumber, setPhoneNumber] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [otp, setOtp] = useState(['', '', '', '', '', ''])
	const [isVerifying, setIsVerifying] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [submitError, setSubmitError] = useState('')

	const handleOtpChange = (element, index) => {
		if (isNaN(element.value)) return false

		const newOtp = [...otp]
		newOtp[index] = element.value
		setOtp(newOtp)

		if (element.nextSibling && element.value !== '') {
			element.nextSibling.focus()
		}
	}

	const handleKeyDown = (e, index) => {
		if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
			e.target.previousSibling.focus()
		}
	}

	const handlePaste = (e) => {
		const data = e.clipboardData.getData('text').slice(0, 6)
		if (!/^\d+$/.test(data)) return

		const newOtp = [...otp]
		data.split('').forEach((char, index) => {
			newOtp[index] = char
		})
		setOtp(newOtp)

		const inputs = e.target.parentElement.querySelectorAll('input')
		const nextIndex = Math.min(data.length, 5)
		inputs[nextIndex].focus()
	}

	const handleSubmit = async (event) => {
		event.preventDefault()

		if (password !== confirmPassword) {
			setSubmitError('Mật khẩu xác nhận không khớp.')
			toast.error('Mật khẩu xác nhận không khớp.')
			return
		}

		try {
			setIsSubmitting(true)
			setSubmitError('')

			// LUỒNG ĐĂNG KÝ - GIAI ĐOẠN 1: Gửi thông tin cơ bản

			/**
			 * BƯỚC 1: ĐĂNG KÝ THÔNG TIN CƠ BẢN.
			 * Gửi yêu cầu POST /api/auth/register tới AuthController.
			 * AuthService sẽ lưu User vào DB ở trạng thái chưa kích hoạt (isActive=false) 
			 * và gửi OTP qua Email.
			 */
			const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					fullName: fullName.trim(),
					email: email.trim(),
					phoneNumber: phoneNumber.trim(),
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

			// Chuyển sang bước xác thực OTP
			toast.success('Đăng ký thành công! Vui lòng nhập mã OTP đã được gửi về email của bạn.')
			setIsVerifying(true)
			setSubmitError('')
		} catch (error) {
			const msg = error?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
			setSubmitError(msg)
			toast.error(msg)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleVerifyOtp = async (event) => {
		event.preventDefault()
		try {
			setIsSubmitting(true)
			setSubmitError('')

			const combinedOtp = otp.join('')
			// LUỒNG ĐĂNG KÝ - GIAI ĐOẠN 2: Xác thực mã OTP để kích hoạt tài khoản
			/**
			 * BƯỚC 2: KÍCH HOẠT TÀI KHOẢN QUA OTP.
			 * Gửi yêu cầu POST /api/auth/activate tới AuthController.
			 * AuthService sẽ đối soát OTP từ bộ nhớ tạm/DB và cập nhật isActive=true trong UserRepository.
			 */
			const response = await fetch(`${API_BASE_URL}/api/auth/activate`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: email.trim(),
					otp: combinedOtp.trim(),
				}),
			})

			if (!response.ok) {
				const message = await extractErrorMessage(response, 'Xác thực thất bại.')
				throw new Error(message || 'Mã OTP không chính xác hoặc đã hết hạn.')
			}

			toast.success('Đăng ký và kích hoạt tài khoản thành công!')
			navigate('/login')
		} catch (error) {
			const msg = error?.message || 'Xác thực thất bại. Vui lòng thử lại.'
			setSubmitError(msg)
			toast.error(msg)
		} finally {
			setIsSubmitting(false)
		}
	}

	if (isVerifying) {
		return (
			<section className="auth-page">
				<div className="auth-shell auth-shell--register">
					<div className="auth-card">
						<h1>Xác thực tài khoản</h1>
						<p className="auth-subtitle">Chúng tôi đã gửi mã OTP đến email <strong>{email}</strong>. Vui lòng nhập mã để hoàn tất đăng ký.</p>

						<form className="auth-form" onSubmit={handleVerifyOtp}>
							<div className="auth-field">
								<span>Mã OTP</span>
								<div className="otp-container">
									{otp.map((data, index) => (
										<input
											key={index}
											type="text"
											className="otp-input"
											maxLength="1"
											value={data}
											onChange={(e) => handleOtpChange(e.target, index)}
											onKeyDown={(e) => handleKeyDown(e, index)}
											onPaste={handlePaste}
											onFocus={(e) => e.target.select()}
											required
										/>
									))}
								</div>
							</div>

							<button type="submit" className="auth-submit" disabled={isSubmitting}>
								{isSubmitting ? 'Đang xác thực...' : 'Xác nhận kích hoạt'}
							</button>
							{submitError ? <p className="text-danger small mb-0">{submitError}</p> : null}
						</form>
						<p className="auth-switch">
							Chưa nhận được mã? <button type="button" onClick={() => setIsVerifying(false)} className="btn-link">Quay lại đăng ký</button>
						</p>
					</div>
				</div>
			</section>
		)
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
							<span>Số điện thoại</span>
							<input
								type="tel"
								placeholder="0123456789"
								value={phoneNumber}
								onChange={(event) => setPhoneNumber(event.target.value)}
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
