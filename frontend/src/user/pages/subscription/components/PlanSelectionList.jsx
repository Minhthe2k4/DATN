import React from 'react'
import { Check, Zap, ShieldCheck, Star, Sparkles } from 'lucide-react'

export function PlanSelectionList({ 
	plans, 
	selectedPlanId, 
	setSelectedPlanId, 
	loading, 
	isPremium, 
	isLifetime, 
	onUpgrade 
}) {
	if (loading) {
		return (
			<div className="subscription-plans">
				<div className="subscription-loading">
					<div className="spinner"></div>
					<p>Đang tải các gói học...</p>
				</div>
			</div>
		)
	}

	if (plans.length === 0) {
		return (
			<div className="subscription-plans">
				<div className="subscription-error">Không có gói học nào khả dụng lúc này.</div>
			</div>
		)
	}

	return (
		<div className="subscription-plans">
			<div className="subscription-plans__header">
				<span className="subscription-column__tag">
					<Zap size={12} style={{ marginRight: '6px' }} />
					Thanh toán
				</span>
				<h2>Gói Premium của bạn</h2>
				<p>Chọn thời hạn phù hợp với lộ trình học tập của bạn.</p>
			</div>

			<div className="subscription-plans__list">
				{plans.map((plan) => {
					const isSelected = plan.id === selectedPlanId
					const notes = plan.note 
						? plan.note.split(/\n|•|\*/).map(line => line.trim()).filter(line => line.length > 0) 
						: []

					return (
						<button
							key={plan.id}
							type="button"
							onClick={() => setSelectedPlanId(plan.id)}
							className={`subscription-plan${isSelected ? ' is-selected' : ''}${plan.highlight ? ' is-highlight' : ''}`}
						>
							<div className="subscription-plan__header">
								<div className="subscription-plan__content">
									<div className="subscription-plan__label-row">
										<span className="subscription-plan__label">{plan.label}</span>
										{plan.badge && <span className="subscription-plan__badge">{plan.badge}</span>}
									</div>
									
									<div className="subscription-plan__price-row">
										<strong>{plan.price}</strong>
										{plan.oldPrice && <span className="subscription-plan__old-price">{plan.oldPrice}</span>}
										{plan.discount && <span className="subscription-plan__discount">{plan.discount}</span>}
									</div>

									<ul className="plan-description-list--card">
										{notes.map((d, i) => (
											<li key={i}>
												<Check size={14} className="check-icon" />
												<span>{d}</span>
											</li>
										))}
									</ul>
								</div>
								<span className={`subscription-plan__radio${isSelected ? ' is-selected' : ''}`} aria-hidden="true" />
							</div>
						</button>
					)
				})}

				{!isLifetime && (
					<div className="subscription-cta-container">
						<button 
							type="button" 
							className="subscription-cta"
							onClick={onUpgrade}
						>
							{isPremium ? 'Gia hạn thêm' : `Nâng cấp ngay`}
						</button>
						<p className="subscription-cta__note">
							<ShieldCheck size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
							Thanh toán an toàn qua ZaloPay
						</p>
					</div>
				)}
				
				{isLifetime && (
					<div className="subscription-lifetime-message">
						<Star size={18} fill="#fbbf24" color="#fbbf24" style={{ marginRight: '8px' }} />
						Bạn đang sở hữu đặc quyền Vĩnh viễn <Sparkles size={16} color="#fbbf24" style={{ marginLeft: '6px', verticalAlign: 'middle' }} />
					</div>
				) || null}
			</div>
		</div>
	)
}
