import React from 'react'
import { RotateCcw, PlusSquare, Zap, CheckCircle } from 'lucide-react'

export function TodayFocus({ isLoggedIn, dashboard, onReview, onLearnNew, onManualAdd, onRegister, onDictionary }) {
	return (
		<section className="today-focus">
			<div className="today-focus__left">
				<p className="today-focus__eyebrow">{isLoggedIn ? 'HỌC HÔM NAY' : 'CHÀO MỪNG BẠN'}</p>
				<h1 className="today-focus__title">
					{isLoggedIn ? 'Học tập đều đặn mỗi ngày' : 'Bắt đầu hành trình chinh phục tiếng Anh'}
				</h1>
				<p className="today-focus__description">
					{isLoggedIn
						? 'Hãy bắt đầu với ôn tập để giữ nhịp học đều, sau đó học thêm từ mới để mở rộng vốn từ.'
						: 'Khám phá hàng ngàn từ vựng, bài đọc và video sinh động. Đăng ký ngay để theo dõi tiến độ của riêng bạn.'}
				</p>
				<div className="today-focus__actions">
					{isLoggedIn ? (
						<>
							<button className="btn btn--primary" type="button" onClick={onReview} disabled={dashboard.reviewCount === 0}>Ôn ngay</button>
							<button className="btn btn--secondary" type="button" onClick={onLearnNew}>Học từ mới</button>
							<button className="btn btn--secondary" type="button" onClick={onManualAdd}>Thêm từ thủ công</button>
						</>
					) : (
						<>
							<button className="btn btn--primary" type="button" onClick={onRegister}>Đăng ký miễn phí</button>
							<button className="btn btn--secondary" type="button" onClick={onDictionary}>Tra từ điển</button>
						</>
					)}
				</div>
			</div>
			<div className="today-focus__right" aria-label={isLoggedIn ? "Thống kê của bạn" : "Tính năng nổi bật"}>
				{isLoggedIn ? (
					<>
						<div className="today-metric">
							<div className="today-metric__head">
								<span className="metric-icon metric-icon--review" aria-hidden="true">
									<RotateCcw size={18} />
								</span>
							</div>
							<span className="today-metric__label">Cần ôn tập</span>
							<strong className="today-metric__value">{dashboard.reviewCount ?? 0}</strong>
						</div>
						<div className="today-metric">
							<div className="today-metric__head">
								<span className="metric-icon metric-icon--new" aria-hidden="true">
									<PlusSquare size={18} />
								</span>
							</div>
							<span className="today-metric__label">Từ mới</span>
							<strong className="today-metric__value">{dashboard.newWordCount ?? 0}</strong>
						</div>
					</>
				) : (
					<>
						<div className="today-metric">
							<div className="today-metric__head">
								<span className="metric-icon metric-icon--streak" aria-hidden="true">
									<Zap size={20} fill="currentColor" />
								</span>
							</div>
							<span className="today-metric__label">Kho từ vựng</span>
							<strong className="today-metric__value">5000+</strong>
						</div>
						<div className="today-metric">
							<div className="today-metric__head">
								<span className="metric-icon metric-icon--learned" aria-hidden="true">
									<CheckCircle size={20} fill="currentColor" />
								</span>
							</div>
							<span className="today-metric__label">Bài học</span>
							<strong className="today-metric__value">Đa dạng</strong>
						</div>
					</>
				)}
			</div>
		</section>
	)
}
