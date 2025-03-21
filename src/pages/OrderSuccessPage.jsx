import React from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderSuccessPage.css';

const OrderSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="order-success-container">
      <h2 className="order-success-message">ĐẶT HÀNG THÀNH CÔNG</h2>
      <h3 className="order-message">
        <img
          src="https://c.tenor.com/fD3pE4xVh8oAAAAj/love-heart.gif"
          alt="Order Confirmation GIF"
        />
      </h3>

      <button onClick={() => navigate('/')} className="back-to-home-button">Quay lại Trang chủ</button>
    </div>
  );
};

export default OrderSuccessPage;
