import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './subscription.css'
import { fetchSubscriptionPlans } from '@/lib/api/premium-api'
import { getUserSession } from '../../utils/authSession'
import { usePremiumStatus } from '@/hooks/usePremiumStatus'

function CheckIcon({ muted = false }) {
	return (
		<span className={`subscription-check${muted ? ' is-muted' : ''}`} aria-hidden="true">
			✓
		</span>
	)
}

export function Subscription() {
	const navigate = useNavigate()
	const session = getUserSession()
	const userId = session?.userId ? Number(session.userId) : null
	const premiumStatus = usePremiumStatus(userId)

	const [plans, setPlans] = useState([])
	const [selectedPlanId, setSelectedPlanId] = useState('')
	const [loading, setLoading] = useState(true)

	// Load subscription plans from API on mount
	useEffect(() => {
		const loadPlans = async () => {
			setLoading(true)
			try {
				const response = await fetch('/api/payment/plans')
				const fetchedPlans = await response.json()
				if (fetchedPlans && fetchedPlans.length > 0) {
					// Map backend fields to frontend expectations
					const mappedPlans = fetchedPlans.map(p => ({
						id: p.id,
						label: p.name,
						price: p.price.toLocaleString('vi-VN') + ' ₫',
						note: p.description,
						duration: p.duration,
						priceVal: p.price
					})).filter(p => p.priceVal > 0); // Bỏ qua gói Free
					
					setPlans(mappedPlans)
					if (mappedPlans.length > 0) {
						setSelectedPlanId(mappedPlans[0].id)
					}
				}
			} catch (error) {
				console.warn('Failed to load subscription plans:', error)
			} finally {
				setLoading(false)
			}
		}

		loadPlans()
	}, [])

	const handleUpgradeClick = () => {
		navigate('/premium-checkout')
	}

	const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? plans[0]

	return (
		<section className="subscription-page">
			<div className="subscription-page__container">
				<header className="subscription-hero">
					<div className="subscription-hero__content">
						<div className="subscription-hero__brand">
							<span className="subscription-hero__brand-mark" aria-hidden="true" />
							<div>
								<span className="subscription-hero__eyebrow">VocaSmart Premium</span>
								<strong>Học tiếng Anh gọn hơn, sâu hơn, không bị ngắt quãng</strong>
							</div>
						</div>
						<h1>Mở khóa toàn bộ trải nghiệm học tập đồng bộ với nhận diện VocaSmart</h1>
						<p>
							Một gói học tập gọn, sáng, rõ ràng: từ từ vựng, đọc hiểu đến video, lưu từ và tra cứu nâng cao.
						</p>
					</div>
					<div className="subscription-hero__summary">
						{premiumStatus.isPremium ? (
							<>
								<span className="subscription-hero__summary-label">
									{premiumStatus.status === 'LIFETIME' ? '⭐ Gói trọn đời' : '💎 Đang hoạt động'}
								</span>
								<strong>
									{premiumStatus.status === 'LIFETIME' ? 'VocaSmart Lifetime' : 
									 premiumStatus.status === 'YEARLY' ? 'VocaSmart 1 năm' : 
									 premiumStatus.status === 'QUARTERLY' ? 'VocaSmart 3 tháng' : 'VocaSmart Premium'}
								</strong>
								<div className="subscription-hero__summary-price">
									{premiumStatus.status === 'LIFETIME' ? '🔥 Vĩnh viễn' : '👑 Pro user'}
								</div>
								<p>
									{premiumStatus.premiumUntil ? (
										<>Hết hạn: <strong>{new Date(premiumStatus.premiumUntil).toLocaleDateString('vi-VN')}</strong></>
									) : (
										'Quyền lợi Premium không giới hạn'
									)}
								</p>
								<div className="subscription-status-badge">
									Đã kích hoạt
								</div>
							</>
						) : (
							<>
								<span className="subscription-hero__summary-label">Gói đang chọn</span>
								<strong>{selectedPlan?.label ?? 'Premium'}</strong>
								<div className="subscription-hero__summary-price">{selectedPlan?.price ?? '...'}</div>
								<p>{selectedPlan?.note}</p>
								{selectedPlan?.oldPrice ? (
									<div className="subscription-hero__summary-meta">
										<span>{selectedPlan.oldPrice}</span>
										{selectedPlan.discount ? <em>{selectedPlan.discount}</em> : null}
									</div>
								) : null}
							</>
						)}
					</div>
				</header>

				<section className="subscription-card">
					<div className="subscription-card__centered">
						<div className="subscription-plans">
							<div className="subscription-plans__header">
								<span className="subscription-column__tag">Thanh toán</span>
								<h2>Gói Premium của bạn</h2>
								<p>Chọn thời hạn phù hợp với lộ trình học tập của bạn.</p>
							</div>
							
							{loading ? (
								<div className="subscription-loading">Đang tải các gói học...</div>
							) : (
								<div className="subscription-plans__list">
									{plans.length > 0 ? (
										<>
											{plans.map((plan) => {
												const isSelected = plan.id === selectedPlanId
												return (
													<button
														key={plan.id}
														type="button"
														onClick={() => setSelectedPlanId(plan.id)}
														className={`subscription-plan${isSelected ? ' is-selected' : ''}${plan.highlight ? ' is-highlight' : ''}`}
													>
														<div className="subscription-plan__header">
															<div>
																<div className="subscription-plan__label-row">
																	<span className="subscription-plan__label">{plan.label}</span>
																	{plan.badge ? <span className="subscription-plan__badge">{plan.badge}</span> : null}
																</div>
																{plan.pricePerMonth ? <strong className="subscription-plan__monthly">{plan.pricePerMonth}</strong> : null}
																<div className="subscription-plan__price-row">
																	<strong>{plan.price}</strong>
																	{plan.oldPrice ? <span className="subscription-plan__old-price">{plan.oldPrice}</span> : null}
																	{plan.discount ? <span className="subscription-plan__discount">{plan.discount}</span> : null}
																</div>
																<p>{plan.note}</p>
															</div>
															<span className={`subscription-plan__radio${isSelected ? ' is-selected' : ''}`} aria-hidden="true" />
														</div>
													</button>
												)
											})}

											{premiumStatus.status !== 'LIFETIME' && (
												<div className="subscription-cta-container">
													<button 
														type="button" 
														className="subscription-cta"
														onClick={handleUpgradeClick}
													>
														{premiumStatus.isPremium ? 'Gia hạn thêm' : `Nâng cấp ngay`}
													</button>
													<p className="subscription-cta__note">Thanh toán an toàn qua ZaloPay.</p>
												</div>
											)}
											
											{premiumStatus.status === 'LIFETIME' && (
												<div className="subscription-lifetime-message">
													Bạn đang sở hữu đặc quyền Vĩnh viễn ✨
												</div>
											)}
										</>
									) : (
										<div className="subscription-error">Không có gói học nào khả dụng lúc này.</div>
									)}
								</div>
							)}
						</div>
					</div>
				</section>
			</div>
		</section>
	)
}
