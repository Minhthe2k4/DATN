import React, { useState } from 'react';

const PremiumCheckout = () => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 500,000 VND example for 1 year premium
      const amount = 500000;
      const response = await fetch(`/api/payment/create-order?amount=${amount}&orderInfo=ThanhToanPremium1Nam`);
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url; // Redirect to VNPAY sandbox
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
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', textAlign: 'center', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
      <h1>Nâng cấp Premium</h1>
      <p>Trải nghiệm tất cả tính năng không giới hạn với Gói Premium 1 Năm.</p>
      <div style={{ margin: '30px 0', fontSize: '24px', fontWeight: 'bold', color: '#e74c3c' }}>
        500,000 VNĐ / 1 Năm
      </div>
      <button 
        onClick={handlePayment} 
        disabled={loading}
        style={{
          padding: '12px 24px',
          fontSize: '18px',
          backgroundColor: '#005fbc', // VNPAY Blue
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Đang chuyển hướng...' : 'Thanh toán qua VNPAY'}
      </button>
      <p style={{ marginTop: '20px', fontSize: '14px', color: '#7f8c8d' }}>
        Thanh toán an toàn thông qua cổng VNPAY Sandbox.
      </p>
    </div>
  );
};

export default PremiumCheckout;
