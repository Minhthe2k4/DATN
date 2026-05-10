import { Trophy, ThumbsUp, Zap, RotateCcw, Check, X, CloudUpload } from 'lucide-react'

const getGradeConfig = (pct) => {
	if (pct >= 90) return {
		text: 'Hẹn gặp lại vào "Thời điểm vàng" tiếp theo!',
		class: 'is-high',
		icon: <Trophy size={40} className="vtest-result-icon" />
	}
	if (pct >= 70) return {
		text: 'Làm tốt lắm!',
		class: 'is-mid-high',
		icon: <ThumbsUp size={40} className="vtest-result-icon" />
	}
	if (pct >= 50) return {
		text: 'Khá ổn!',
		class: 'is-mid',
		icon: <Zap size={40} className="vtest-result-icon" />
	}
	return {
		text: 'Tiếp tục cố gắng nhé!',
		class: 'is-low',
		icon: <RotateCcw size={40} className="vtest-result-icon" />
	}
}

export function ResultsScreen({ questions, answers, answerDetails, onSync, isSyncing }) {
	const score = answers.filter(Boolean).length
	const total = questions.length
	const pct = (total === 0) ? 0 : Math.round((score / total) * 100)

	const { text, class: gradeClass, icon } = getGradeConfig(pct)

	return (
		<div className="vtest-results">
			<div className={`vtest-results__circle ${gradeClass}`}>
				<div className="vtest-results__icon-wrapper">{icon}</div>
				<div className="vtest-results__pct">{pct}%</div>
				<div className="vtest-results__grade">{text}</div>
			</div>

			<div className="vtest-results__stats">
				<div className="vtest-results__stat vtest-results__stat--correct">
					<span className="vtest-results__stat-num">{score}</span>
					<span className="vtest-results__stat-label">Chính xác</span>
				</div>
				<div className="vtest-results__stat-divider" />
				<div className="vtest-results__stat vtest-results__stat--wrong">
					<span className="vtest-results__stat-num">{total - score}</span>
					<span className="vtest-results__stat-label">Chưa đúng</span>
				</div>
			</div>

			<div className="vtest-results__table-wrapper">
				<table className="vtest-results__table">
					<thead>
						<tr>
							<th style={{ width: '40px' }}>#</th>
							<th>Từ vựng</th>
							<th style={{ width: '80px' }}>Kết quả</th>
							<th style={{ width: '80px' }}>Tốc độ</th>
							<th>Bạn chọn</th>
							<th>Đáp án đúng</th>
						</tr>
					</thead>
					<tbody>
						{questions.map((q, i) => {
							const isCorrect = answers[i] === true
							const detail = answerDetails[i]
							const timeSec = detail?.responseTimeMs ? (detail.responseTimeMs / 1000).toFixed(1) + 's' : '---'
							
							return (
								<tr key={q.id} className={isCorrect ? 'row-correct' : 'row-wrong'}>
									<td>{i + 1}</td>
									<td><strong>{detail?.wordDetails?.word || '---'}</strong></td>
									<td>
										<span className={`result-badge ${isCorrect ? 'is-correct' : 'is-wrong'}`}>
											{isCorrect ? <Check size={14} /> : <X size={14} />}
										</span>
									</td>
									<td><small>{timeSec}</small></td>
									<td><span className="user-choice">{detail?.selectedAnswer || '---'}</span></td>
									<td><span className="correct-ans">{detail?.correctAnswer || '---'}</span></td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>

			<div className="vtest-results__actions">
				<button 
					type="button" 
					className="vtest-btn vtest-btn--sync" 
					onClick={onSync} 
					disabled={isSyncing}
				>
					{isSyncing ? (
						<><span className="spinner"></span> Đang đồng bộ...</>
					) : (
						<>
							<CloudUpload size={18} style={{ marginRight: '8px' }} />
							Xác nhận & Cập nhật Thời điểm vàng
						</>
					)}
				</button>
				<p className="vtest-results__hint">
					* Kết quả ôn tập sẽ được lưu vào tiến trình học tập của bạn sau khi nhấn xác nhận.
				</p>
			</div>
		</div>
	)
}
