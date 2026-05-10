import { Sparkles } from 'lucide-react'

export function PaymentHistory({ profile, onUpgradeClick, isLoading }) {
	return (
		<section className="payment-history">
			<div className="history-header">
				<h2>Lịch sử nâng cấp</h2>
				{!profile.isPremium && (
					<button className={`upgrade-btn ${isLoading ? 'skeleton' : ''}`} onClick={onUpgradeClick}>
						<Sparkles size={18} /> Nâng cấp Plus
					</button>
				)}
			</div>
			<div className="table-responsive">
				<table className="history-table">
					<thead>
						<tr>
							<th>THỜI GIAN</th>
							<th>GÓI DỊCH VỤ</th>
							<th>SỐ TIỀN</th>
							<th>TRẠNG THÁI</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							[1, 2].map((i) => (
								<tr key={i}>
									<td><div className="skeleton skeleton-text" style={{width: '100px'}}></div></td>
									<td><div className="skeleton skeleton-text" style={{width: '80px'}}></div></td>
									<td><div className="skeleton skeleton-text" style={{width: '60px'}}></div></td>
									<td><div className="skeleton skeleton-text" style={{width: '90px'}}></div></td>
								</tr>
							))
						) : profile?.isPremium ? (
							<tr>
								<td>{new Date(profile.premiumUntil).toLocaleDateString('vi-VN')} (Hết hạn)</td>
								<td>Gói Premium</td>
								<td>---</td>
								<td><span className="status-badge status-badge--active">ĐANG HOẠT ĐỘNG</span></td>
							</tr>
						) : (
							<tr>
								<td colSpan="4" className="empty-history">
									Chưa có lịch sử giao dịch
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</section>
	)
}
