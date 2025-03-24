import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderSuccessPage.css';

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Kiểm tra nếu là khách vãng lai (không có token)
    const token = localStorage.getItem('token');
    setIsGuest(!token);
  }, []);

  return (
    <div className="order-success-container">
      <h2 className="order-success-message">ĐẶT HÀNG THÀNH CÔNG</h2>

      {isGuest ? (
        // Hiển thị thông báo cho khách vãng lai
        <>
          <h3 className="order-message">
            Bạn vui lòng liên hệ tới số 0787803677 (có Zalo) hoặc Gmail: linhnguyentran0612@gmail.com để được xác nhận, cập nhật thông tin đơn hàng nhé.
          </h3>
          <p className="guest-notice">
            Đơn hàng của bạn đã được ghi nhận. Chúng tôi sẽ liên hệ sớm nhất có thể để xác nhận đơn hàng.
          </p>
        </>
      ) : (
        // Hiển thị thông báo cho người dùng đã đăng nhập
       
      <h3 className="order-message">
        <img
          src="https://c.tenor.com/fD3pE4xVh8oAAAAj/love-heart.gif"
          alt="Order Confirmation GIF"
        />
      </h3>

    
    
      )}

      <button onClick={() => navigate('/')} className="back-to-home-button">
        Quay lại Trang chủ
      </button>
    </div>
  );
};

export default OrderSuccessPage;