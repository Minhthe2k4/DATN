import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserSession } from '../utils/authSession';

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
      const response = await fetch(`/api/payment/create-order?userId=${session.userId}&planId=${selectedPlan.id}`);
      const data = await response.json();
      
      if (data.url) {
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
      maxWidth: '900px', 
      margin: '60px auto', 
      padding: '40px', 
      textAlign: 'center', 
      background: '#fff',
      borderRadius: '24px',
      boxShadow: '0 20px 50px rgba(0,0,0,0.08)' 
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#1a202c' }}>Nâng cấp Premium</h1>
      <p style={{ color: '#718096', fontSize: '1.1rem', marginBottom: '40px' }}>
        Mở khóa toàn bộ tiềm năng học tiếng Anh của bạn với các tính năng độc quyền.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {plans.map(plan => (
          <div 
            key={plan.id}
            onClick={() => setSelectedPlan(plan)}
            style={{
              padding: '30px',
              border: selectedPlan?.id === plan.id ? '2px solid #3182ce' : '2px solid #e2e8f0',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backgroundColor: selectedPlan?.id === plan.id ? '#f0f9ff' : 'white',
              transform: selectedPlan?.id === plan.id ? 'translateY(-5px)' : 'none',
              position: 'relative'
            }}
          >
            {selectedPlan?.id === plan.id && (
              <div style={{ 
                position: 'absolute', 
                top: '-12px', 
                left: '50%', 
                transform: 'translateX(-50%)',
                backgroundColor: '#3182ce',
                color: 'white',
                padding: '2px 12px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>ĐANG CHỌN</div>
            )}
            <h3 style={{ margin: '0 0 10px', fontSize: '1.2rem' }}>{plan.name}</h3>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#2d3748', margin: '15px 0' }}>
              {plan.price.toLocaleString('vi-VN')} VNĐ
            </div>
            <p style={{ color: '#4a5568', fontSize: '0.9rem', minHeight: '60px' }}>{plan.description}</p>
            <div style={{ color: '#718096', fontSize: '0.8rem' }}>Thời hạn: {plan.duration} ngày</div>
          </div>
        ))}
      </div>

      <button 
        onClick={handlePayment} 
        disabled={loading || !selectedPlan}
        style={{
          padding: '16px 48px',
          fontSize: '1.1rem',
          fontWeight: '700',
          backgroundColor: '#005fbc',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: (loading || !selectedPlan) ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 10px 15px -3px rgba(0, 95, 188, 0.3)'
        }}
      >
        {loading ? 'Đang xử lý...' : `Thanh toán ${selectedPlan?.price.toLocaleString('vi-VN')} VNĐ qua ZaloPay`}
      </button>

      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <img src="https://images.careerbuilder.vn/employer_folders/lot7/126937/159495_logo.png" alt="ZaloPay" style={{ height: '30px' }} />
      </div>
      <p style={{ marginTop: '20px', fontSize: '0.9rem', color: '#a0aec0' }}>
        Mọi giao dịch đều được bảo mật và xử lý thông qua cổng thanh toán ZaloPay Sandbox.
      </p>
    </div>
  );
};

export default PremiumCheckout;
