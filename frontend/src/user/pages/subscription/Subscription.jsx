import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './subscription.css'
import { getUserSession } from '../../utils/authSession'
import { usePremiumStatus } from '@/hooks/usePremiumStatus'

import { SubscriptionHero } from './components/SubscriptionHero'
import { PlanSelectionList } from './components/PlanSelectionList'

export function Subscription() {
	const navigate = useNavigate()
	const session = getUserSession()
	const userId = session?.userId ? Number(session.userId) : null
	const premiumStatus = usePremiumStatus(userId)

	const [plans, setPlans] = useState([])
	const [selectedPlanId, setSelectedPlanId] = useState('')
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const loadPlans = async () => {
			setLoading(true)
			try {
				const response = await fetch('/api/payment/plans')
				const fetchedPlans = await response.json()
				if (fetchedPlans && fetchedPlans.length > 0) {
					const mappedPlans = fetchedPlans.map(p => ({
						id: p.id,
						label: p.name,
						price: p.price.toLocaleString('vi-VN') + ' ₫',
						note: p.description,
						duration: p.duration,
						priceVal: p.price
					})).filter(p => p.priceVal > 0)
					
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
				<SubscriptionHero 
					premiumStatus={premiumStatus} 
					selectedPlan={selectedPlan} 
				/>

				<section className="subscription-card">
					<div className="subscription-card__centered">
						<PlanSelectionList 
							plans={plans}
							selectedPlanId={selectedPlanId}
							setSelectedPlanId={setSelectedPlanId}
							loading={loading}
							isPremium={premiumStatus.isPremium}
							isLifetime={premiumStatus.status === 'LIFETIME'}
							onUpgrade={handleUpgradeClick}
						/>
					</div>
				</section>
			</div>
		</section>
	)
}
