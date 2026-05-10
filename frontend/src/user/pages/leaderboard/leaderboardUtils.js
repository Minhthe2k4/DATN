export const formatStudyTime = (hours) => {
	if (!hours || hours === 0) return '0 giây'
	if (hours < 1 / 60) {
		const seconds = Math.round(hours * 3600)
		return `${seconds} giây`
	} else if (hours < 1) {
		const minutes = Math.round(hours * 60)
		return `${minutes} phút`
	} else {
		return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`
	}
}

export const getPodiumData = (topThree) => {
	const podiumData = []
	if (topThree[1]) podiumData.push({ ...topThree[1], podiumRank: 2 })
	if (topThree[0]) podiumData.push({ ...topThree[0], podiumRank: 1 })
	if (topThree[2]) podiumData.push({ ...topThree[2], podiumRank: 3 })
	return podiumData
}
