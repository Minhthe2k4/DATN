import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './auth.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Email không tồn tại trong hệ thống')
      }
      setStep(2)
      setMessage('Mã OTP đã được gửi đến email của bạn.')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const combinedOtp = otp.join('')
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: combinedOtp })
      })
      const isValid = await response.json()
      if (!isValid) throw new Error('Mã OTP không chính xác.')
      setStep(3)
      setMessage('')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }
    setIsLoading(true)
    setError('')
    try {
      const combinedOtp = otp.join('')
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: combinedOtp, newPassword })
      })
      if (!response.ok) throw new Error('Đã có lỗi xảy ra khi đặt lại mật khẩu.')
      setMessage('Mật khẩu đã được thay đổi thành công!')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false

    const newOtp = [...otp]
    newOtp[index] = element.value
    setOtp(newOtp)

    // Focus next input
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

    // Focus last filled input or the next empty one
    const inputs = e.target.parentElement.querySelectorAll('input')
    const nextIndex = Math.min(data.length, 5)
    inputs[nextIndex].focus()
  }

  return (
    <section className="auth-page">
      <div className="auth-shell auth-shell--forgot">
        <div className="auth-card">
          <h1>Quên mật khẩu</h1>
          <p className="auth-subtitle">
            {step === 1 && 'Nhập email của bạn để nhận mã OTP khôi phục.'}
            {step === 2 && 'Nhập mã OTP gồm 6 chữ số đã được gửi tới email của bạn.'}
            {step === 3 && 'Tạo mật khẩu mới cho tài khoản của bạn.'}
          </p>

          {error && <div className="auth-alert auth-alert--error">{error}</div>}
          {message && <div className="auth-alert auth-alert--success">{message}</div>}

          {step === 1 && (
            <form className="auth-form" onSubmit={handleSendOtp}>
              <label className="auth-field">
                <span>Email</span>
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <button type="submit" className="auth-submit" disabled={isLoading}>
                {isLoading ? 'Đang gửi...' : 'Gửi mã OTP'}
              </button>
            </form>
          )}

          {step === 2 && (
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
              <button type="submit" className="auth-submit" disabled={isLoading}>
                {isLoading ? 'Đang xác thực...' : 'Xác nhận OTP'}
              </button>
              <button type="button" className="auth-link-btn" onClick={() => setStep(1)}>
                Quay lại nhập email
              </button>
            </form>
          )}

          {step === 3 && (
            <form className="auth-form" onSubmit={handleResetPassword}>
              <label className="auth-field">
                <span>Mật khẩu mới</span>
                <input
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength="6"
                />
              </label>
              <label className="auth-field">
                <span>Xác nhận mật khẩu</span>
                <input
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </label>
              <button type="submit" className="auth-submit" disabled={isLoading}>
                {isLoading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
              </button>
            </form>
          )}

          <p className="auth-switch">
            Nhớ mật khẩu? <Link to="/login">Đăng nhập ngay</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
