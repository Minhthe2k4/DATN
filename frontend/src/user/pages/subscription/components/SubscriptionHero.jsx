import React from 'react'
import { Crown, Gem, CheckCircle2, Star, Sparkles, Flame, ShieldCheck } from 'lucide-react'

export function SubscriptionHero({ premiumStatus, selectedPlan }) {
	const isPremium = premiumStatus.isPremium
	const status = premiumStatus.status

	const planNotes = selectedPlan?.note 
		? selectedPlan.note.split(/\n|•|\*/).map(line => line.trim()).filter(line => line.length > 0) 
		: []

	return (
		<header className="subscription-hero">
			<div className="subscription-hero__content">
				<div className="subscription-hero__brand">
					<div className="subscription-hero__brand-mark" aria-hidden="true" />
					<div>
						<span className="subscription-hero__eyebrow">
							<Crown size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
							VocaSmart Premium
						</span>
						<strong>Học tiếng Anh gọn hơn, sâu hơn, không bị ngắt quãng</strong>
					</div>
				</div>
				<h1>Mở khóa toàn bộ trải nghiệm học tập đồng bộ với nhận diện VocaSmart</h1>
				<p>
					Một gói học tập gọn, sáng, rõ ràng: từ từ vựng, đọc hiểu đến video, lưu từ và tra cứu nâng cao.
				</p>
				<div className="subscription-hero__highlights">
					<span><Sparkles size={14} style={{ marginRight: '6px' }} /> Học không quảng cáo</span>
					<span><Gem size={14} style={{ marginRight: '6px' }} /> Tra cứu AI không giới hạn</span>
					<span><Star size={14} style={{ marginRight: '6px' }} /> Lộ trình cá nhân hóa</span>
				</div>
			</div>

			<div className="subscription-hero__summary">
				{isPremium ? (
					<>
						<span className="subscription-hero__summary-label">
							{status === 'LIFETIME' ? (
								<><Star size={12} fill="#fbbf24" color="#fbbf24" style={{ marginRight: '6px' }} /> Gói trọn đời</>
							) : (
								<><Gem size={12} style={{ marginRight: '6px' }} /> Đang hoạt động</>
							)}
						</span>
						<strong>
							{status === 'LIFETIME' ? 'VocaSmart Lifetime' : 
							 status === 'YEARLY' ? 'VocaSmart 1 năm' : 
							 status === 'QUARTERLY' ? 'VocaSmart 3 tháng' : 'VocaSmart Premium'}
						</strong>
						<div className="subscription-hero__summary-price">
							{status === 'LIFETIME' ? (
								<><Flame size={24} fill="#f97316" color="#f97316" style={{ marginRight: '8px' }} /> Vĩnh viễn</>
							) : (
								<><Crown size={24} fill="#fbbf24" color="#fbbf24" style={{ marginRight: '8px' }} /> Pro user</>
							)}
						</div>
						<p>
							{premiumStatus.premiumUntil ? (
								<>Hết hạn: <strong>{new Date(premiumStatus.premiumUntil).toLocaleDateString('vi-VN')}</strong></>
							) : (
								'Quyền lợi Premium không giới hạn'
							)}
						</p>
						<div className="subscription-status-badge">
							<CheckCircle2 size={16} style={{ marginRight: '6px' }} />
							Đã kích hoạt
						</div>
					</>
				) : (
					<>
						<span className="subscription-hero__summary-label">Gói đang chọn</span>
						<strong>{selectedPlan?.label ?? 'Premium'}</strong>
						<div className="subscription-hero__summary-price">{selectedPlan?.price ?? '...'}</div>
						
						<ul className="plan-description-list--hero">
							{planNotes.map((d, i) => (
								<li key={i}>
									<CheckCircle2 size={14} className="check-icon" />
									<span>{d}</span>
								</li>
							))}
						</ul>

						{selectedPlan?.oldPrice && (
							<div className="subscription-hero__summary-meta">
								<span>{selectedPlan.oldPrice}</span>
								{selectedPlan.discount && <em>{selectedPlan.discount}</em>}
							</div>
						)}
					</>
				)}
			</div>
		</header>
	)
}
