import React, { useEffect, useState } from 'react'
import { getAuthHeader } from '../../../utils/authSession'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export function StudyChart({ isLoading: parentLoading }) {
	const [days, setDays] = useState([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		async function fetchWeeklyStats() {
			try {
				const response = await fetch(`${API_BASE_URL}/api/user/stats/weekly`, {
					headers: { ...getAuthHeader() }
				})
				if (response.ok) {
					const data = await response.json()
					setDays(data)
				}
			} catch (error) {
				console.error('Error fetching weekly stats:', error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchWeeklyStats()
	}, [])

	const combinedLoading = parentLoading || isLoading
	const maxMinutes = Math.max(...days.map(d => d.minutes), 10)

	return (
		<div className="charts-section">
			<div className="chart-item">
				<div className="chart-item__header">
					<h3>Tiến độ học tập</h3>
					<p>Tần suất ôn tập từ vựng hàng ngày (phút)</p>
				</div>
				<div className="chart-container">
					<div className="y-axis">
						<span>{Math.round(maxMinutes)}</span>
						<span>{Math.round(maxMinutes * 0.66)}</span>
						<span>{Math.round(maxMinutes * 0.33)}</span>
						<span>0</span>
					</div>
					<div className="chart-wrapper">
						<div className={`placeholder-chart ${combinedLoading ? 'skeleton' : ''}`}>
							{!combinedLoading && days.map((day, idx) => {
								const heightPct = day.minutes > 0 ? (day.minutes / maxMinutes) * 100 : 5
								return (
									<div key={idx} className="chart-bar-wrap">
										<div className="chart-bar" style={{ height: `${heightPct}%` }}>
											<span className="chart-bar__value">{day.minutes}m</span>
										</div>
										<span className="chart-bar__label">{day.label}</span>
									</div>
								)
							})}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
