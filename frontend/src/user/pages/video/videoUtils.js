export const makeChannelThumbnail = (label) => {
	const colors = [
		{ bg1: '#111827', bg2: '#374151' },
		{ bg1: '#18181b', bg2: '#ef4444' },
		{ bg1: '#06b6d4', bg2: '#3b82f6' },
		{ bg1: '#020617', bg2: '#0ea5e9' },
	]
	const color = colors[Math.floor(Math.random() * colors.length)]
	return `data:image/svg+xml,${encodeURIComponent(
		`<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360' viewBox='0 0 640 360'>
			<defs>
				<linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
					<stop offset='0%' stop-color='${color.bg1}' />
					<stop offset='100%' stop-color='${color.bg2}' />
				</linearGradient>
			</defs>
			<rect width='640' height='360' fill='url(#g)' />
			<circle cx='120' cy='86' r='70' fill='rgba(255,255,255,0.16)' />
			<circle cx='580' cy='294' r='105' fill='rgba(255,255,255,0.1)' />
			<text x='26' y='54' font-size='24' fill='rgba(255,255,255,0.9)' font-family='Manrope, sans-serif'>Kênh</text>
			<text x='26' y='116' font-size='58' font-weight='800' fill='#ffffff' font-family='Manrope, sans-serif'>${label.substring(0, 10)}</text>
		</svg>`
	)}`
}

export const makeChannelAvatar = (label) => {
	const colors = ['#0ea5e9', '#ef4444', '#16a34a', '#f59e0b']
	const color = colors[Math.floor(Math.random() * colors.length)]
	const initials = label.substring(0, 2).toUpperCase()
	return `data:image/svg+xml,${encodeURIComponent(
		`<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'>
			<circle cx='40' cy='40' r='40' fill='${color}' />
			<text x='40' y='48' text-anchor='middle' font-size='28' font-weight='800' fill='white' font-family='Manrope, sans-serif'>${initials}</text>
		</svg>`
	)}`
}

export const makeVideoThumbnail = (label) => {
	const colors = [
		{ bg1: '#111827', bg2: '#2563eb' },
		{ bg1: '#2563eb', bg2: '#0ea5e9' },
		{ bg1: '#0f766e', bg2: '#22c55e' },
		{ bg1: '#7c3aed', bg2: '#ec4899' },
	]
	const color = colors[Math.floor(Math.random() * colors.length)]
	const title = label.substring(0, 12).toUpperCase()
	return `data:image/svg+xml,${encodeURIComponent(
		`<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360' viewBox='0 0 640 360'>
			<defs>
				<linearGradient id='vg' x1='0' y1='0' x2='1' y2='1'>
					<stop offset='0%' stop-color='${color.bg1}' />
					<stop offset='100%' stop-color='${color.bg2}' />
				</linearGradient>
			</defs>
			<rect width='640' height='360' fill='url(#vg)' />
			<path d='M0 300 C112 248 190 322 304 272 C410 232 548 290 640 250 L640 360 L0 360 Z' fill='rgba(255,255,255,0.14)' />
			<text x='20' y='44' font-size='20' fill='rgba(255,255,255,0.88)' font-family='Manrope, sans-serif'>Xem ngay</text>
			<text x='20' y='104' font-size='42' font-weight='800' fill='white' font-family='Manrope, sans-serif'>${title}</text>
		</svg>`
	)}`
}

export const getDifficultyColor = (difficulty) => {
	switch (difficulty?.toLowerCase()) {
		case 'cơ bản':
		case 'dễ':
		case 'a1':
		case 'a2':
			return '#22c55e'
		case 'trung bình':
		case 'b1':
		case 'b2':
			return '#f59e0b'
		case 'nâng cao':
		case 'khó':
		case 'c1':
		case 'c2':
			return '#ef4444'
		default:
			return '#64748b'
	}
}

export function formatTime(seconds) {
	if (!seconds || isNaN(seconds)) return '0:00'
	const m = Math.floor(seconds / 60)
	const s = Math.floor(seconds % 60)
	return `${m}:${String(s).padStart(2, '0')}`
}

export function speakWord(text, lang = 'en-US') {
	if (!('speechSynthesis' in window)) return
	window.speechSynthesis.cancel()
	const utterance = new SpeechSynthesisUtterance(text)
	utterance.lang = lang
	window.speechSynthesis.speak(utterance)
}
