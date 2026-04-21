import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const PaymentResult = () => {
  const [status, setStatus] = useState('verifying'); // verifying, success, failed
  const [message, setMessage] = useState('Đang xác thực giao dịch...');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Gửi kết quả giao dịch về backend để verify
        const response = await fetch(`/api/payment/verify-payment${location.search}`);
        const data = await response.json();

        if (data.status === 'SUCCESS') {
          setStatus('success');
          setMessage(data.message || 'Chúc mừng! Bạn đã nâng cấp Premium thành công.');
        } else {
          setStatus('failed');
          setMessage(data.message || 'Giao dịch không thành công hoặc đã bị hủy.');
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus('failed');
        setMessage('Không thể xác thực giao dịch. Vui lòng liên hệ hỗ trợ.');
      }
    };

    verifyPayment();
  }, [location.search]);

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '100px auto', 
      padding: '40px', 
      textAlign: 'center', 
      background: '#fff',
      borderRadius: '20px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
    }}>
      {status === 'verifying' && (
        <div className="status-verifying">
          <div className="spinner" style={{ 
            width: '50px', 
            height: '50px', 
            border: '5px solid #f3f3f3', 
            borderTop: '5px solid #3498db', 
            borderRadius: '50%', 
            margin: '0 auto 20px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <h2>Đang kiểm tra kết quả...</h2>
          <p>{message}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="status-success">
          <div style={{ fontSize: '60px', color: '#48bb78', marginBottom: '20px' }}>✓</div>
          <h2 style={{ color: '#2f855a' }}>Thanh toán thành công!</h2>
          <p style={{ color: '#4a5568', marginBottom: '30px' }}>{message}</p>
          <button 
            onClick={() => navigate('/subscription')}
            style={{
              padding: '12px 30px',
              backgroundColor: '#48bb78',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Quay lại trang Premium
          </button>
        </div>
      )}

      {status === 'failed' && (
        <div className="status-failed">
          <div style={{ fontSize: '60px', color: '#f56565', marginBottom: '20px' }}>✕</div>
          <h2 style={{ color: '#c53030' }}>Giao dịch thất bại</h2>
          <p style={{ color: '#4a5568', marginBottom: '30px' }}>{message}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
            <button 
              onClick={() => navigate('/premium-checkout')}
              style={{
                padding: '12px 25px',
                backgroundColor: '#3182ce',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Thử lại
            </button>
            <button 
              onClick={() => navigate('/')}
              style={{
                padding: '12px 25px',
                backgroundColor: '#edf2f7',
                color: '#4a5568',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Về trang chủ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentResult;
