import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  
  useEffect(() => {
    const responseCode = searchParams.get('vnp_ResponseCode');
    
    if (responseCode === '00') {
      setStatus('success');
      // Here usually you would make an API call to verify the signature on backend
      // and update the user's premium status in the database.
      // Example: fetch('/api/user/upgrade-premium', { method: 'POST', body: vnp_TxnRef... })
    } else if (responseCode) {
      setStatus('failed');
    } else {
      setStatus('invalid');
    }
  }, [searchParams]);

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '30px', textAlign: 'center', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
      {status === 'processing' && <h2>Đang xử lý kết quả...</h2>}
      
      {status === 'success' && (
        <>
          <h1 style={{ color: '#2ecc71' }}>🎉 Thanh toán thành công!</h1>
          <p>Cảm ơn bạn đã nâng cấp Premium. Các tính năng nâng cao đã được mở khóa.</p>
          <button 
            onClick={() => navigate('/')}
            style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }}
          >
            Quay lại trang chủ
          </button>
        </>
      )}

      {status === 'failed' && (
        <>
          <h1 style={{ color: '#e74c3c' }}>❌ Thanh toán thất bại</h1>
          <p>Giao dịch của bạn đã bị hủy hoặc có lỗi xảy ra trong quá trình thanh toán.</p>
          <button 
            onClick={() => navigate('/premium-checkout')}
            style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }}
          >
            Thử lại
          </button>
        </>
      )}

      {status === 'invalid' && (
        <>
          <h2>Không tìm thấy thông tin giao dịch</h2>
          <button onClick={() => navigate('/')}>Về trang chủ</button>
        </>
      )}
    </div>
  );
};

export default PaymentResult;
