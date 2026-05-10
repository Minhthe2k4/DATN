import React from 'react'

export function StudyCalendar({ activityDates }) {
	const now = new Date()
	const currentMonth = now.getMonth()
	const currentYear = now.getFullYear()

	const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
	const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

	const monthName = new Intl.DateTimeFormat('vi-VN', { month: 'long' }).format(now)

	const calendarDays = []
	for (let i = 0; i < firstDayOfMonth; i++) {
		calendarDays.push({ day: null, fullDate: null })
	}
	for (let i = 1; i <= daysInMonth; i++) {
		const fullDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
		calendarDays.push({ day: i, fullDate })
	}

	return (
		<div className="study-calendar">
			<div className="study-calendar__header">
				<h3 className="study-calendar__title">Lịch học tập</h3>
				<span className="study-calendar__month">{monthName} {currentYear}</span>
			</div>
			<div className="study-calendar__grid">
				<span className="day-name">CN</span>
				<span className="day-name">T2</span>
				<span className="day-name">T3</span>
				<span className="day-name">T4</span>
				<span className="day-name">T5</span>
				<span className="day-name">T6</span>
				<span className="day-name">T7</span>

				{calendarDays.map((d, idx) => {
					const isActive = d.fullDate && activityDates.includes(d.fullDate)
					const isToday = d.fullDate === now.toISOString().split('T')[0]

					return (
						<div
							key={idx}
							className={`calendar-day${!d.day ? ' empty' : ''}${isActive ? ' active' : ''}${isToday ? ' today' : ''}`}
							title={d.fullDate}
						>
							{d.day}
						</div>
					)
				})}
			</div>
			<div className="study-calendar__footer">
				<div className="legend-item">
					<span className="legend-dot active"></span>
					<span>Đã học</span>
				</div>
				<div className="legend-item">
					<span className="legend-dot today"></span>
					<span>Hôm nay</span>
				</div>
			</div>
		</div>
	)
}
