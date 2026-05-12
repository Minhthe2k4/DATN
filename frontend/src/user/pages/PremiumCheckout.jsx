import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserSession } from '../utils/authSession';

/**
 * Trang xử lý nâng cấp gói Premium (Checkout Page).
 * Cho phép người dùng chọn gói cước và thực hiện thanh toán qua ZaloPay.
 */
const PremiumCheckout = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const session = getUserSession();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/payment/plans')
      .then(res => res.json())
      .then(data => {
        // Lọc bỏ gói Free nếu có
        const paidPlans = data.filter(p => p.price > 0);
        setPlans(paidPlans);
        if (paidPlans.length > 0) setSelectedPlan(paidPlans[0]);
      })
      .catch(err => console.error("Error fetching plans:", err));
  }, []);

  // Xử lý khi người dùng nhấn nút "Thanh toán"
  const handlePayment = async () => {
    if (!session?.userId) {
      alert("Vui lòng đăng nhập để nâng cấp Premium!");
      navigate('/login');
      return;
    }

    if (!selectedPlan) {
      alert("Vui lòng chọn một gói dịch vụ!");
      return;
    }

    setLoading(true);
    try {
      // 1. Gọi API Backend để khởi tạo đơn hàng phía ZaloPay
      const response = await fetch(`/api/payment/create-order?userId=${session.userId}&planId=${selectedPlan.id}`);
      const data = await response.json();
      
      if (data.url) {
        // 2. Nếu tạo đơn hàng thành công, điều hướng người dùng sang trang thanh toán của ZaloPay
        window.location.href = data.url; // Redirect to ZaloPay sandbox
      } else {
        alert("Có lỗi xảy ra khi tạo link thanh toán!");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Không thể kết nối đến máy chủ thanh toán.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-checkout-container" style={{ 
      maxWidth: '1000px', 
      margin: '60px auto', 
      padding: '40px 30px', 
      background: 'linear-gradient(135deg, #ffffff 0%, #f9fbff 100%)',
      borderRadius: '28px',
      boxShadow: '0 25px 60px rgba(14, 116, 144, 0.08)',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      fontFamily: "'Manrope', sans-serif"
    }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.8rem', fontWeight: '800', marginBottom: '12px', color: '#0f172a', letterSpacing: '-0.04em' }}>
          Xác nhận Gói Premium
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.15rem', fontWeight: '500', maxWidth: '640px', margin: '0 auto' }}>
          Sẵn sàng nâng cao kỹ năng ngôn ngữ với quyền lợi không giới hạn.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '45px' }}>
        {plans.map(plan => {
          const isSelected = selectedPlan?.id === plan.id;
          return (
            <div 
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              style={{
                padding: '32px 24px',
                border: isSelected ? '2px solid #0ea5e9' : '1px solid #e2e8f0',
                borderRadius: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backgroundColor: isSelected ? '#f0f9ff' : 'white',
                transform: isSelected ? 'translateY(-4px)' : 'none',
                boxShadow: isSelected ? '0 16px 36px rgba(14, 165, 233, 0.12)' : '0 4px 12px rgba(0, 0, 0, 0.02)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              {isSelected && (
                <div style={{ 
                  position: 'absolute', 
                  top: '-12px', 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
                  color: 'white',
                  padding: '4px 16px',
                  borderRadius: '999px',
                  fontSize: '0.78rem',
                  fontWeight: '800',
                  letterSpacing: '0.06em',
                  boxShadow: '0 8px 16px rgba(14, 165, 233, 0.25)'
                }}>ĐANG CHỌN</div>
              )}
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.4rem', fontWeight: '800', color: '#1e293b' }}>
                  {plan.name}
                </h3>
                <div style={{ fontSize: '2.1rem', fontWeight: '800', color: '#0f172a', margin: '14px 0' }}>
                  {plan.price.toLocaleString('vi-VN')} ₫
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(plan.description ? plan.description.split(/\n|•|\*/).map(line => line.trim()).filter(line => line.length > 0) : []).map((desc, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                      <span style={{ color: '#0ea5e9', fontWeight: '800' }}>✓</span>
                      <span>{desc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: '600', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                Thời hạn sử dụng: {plan.duration} ngày
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button 
          onClick={handlePayment} 
          disabled={loading || !selectedPlan}
          style={{
            padding: '18px 56px',
            fontSize: '1.15rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            cursor: (loading || !selectedPlan) ? 'not-allowed' : 'pointer',
            transition: 'all 0.25s ease',
            boxShadow: '0 16px 32px rgba(14, 165, 233, 0.26)',
            width: '100%',
            maxWidth: '480px'
          }}
        >
          {loading ? 'Đang xử lý...' : `Thanh toán ngay`}
        </button>

        <div style={{ marginTop: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Đối tác thanh toán
          </span>
          <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay.png" alt="ZaloPay" style={{ height: '28px', objectFit: 'contain' }} />
        </div>

        <p style={{ marginTop: '16px', fontSize: '0.88rem', color: '#64748b', maxWidth: '500px', margin: '16px auto 0', lineHeight: '1.5' }}>
          Mọi giao dịch thanh toán đều được xử lý thông qua máy chủ an toàn và mã hóa của ZaloPay.
        </p>
      </div>
    </div>
  );
};

export default PremiumCheckout;
