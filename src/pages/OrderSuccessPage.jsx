import React from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderSuccessPage.css';

const OrderSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="order-success-container">
      <h2 className="order-success-message">ĐẶT HÀNG THÀNH CÔNG</h2>
      <h3 className="order-message">Cùng Glamour Cosmic bảo vệ quyền lợi của bạn - KHÔNG CHUYỂN TIỀN TRƯỚC cho Shipper khi đơn hàng chưa được giao tới với bất kỳ lý do gì</h3>
      <button onClick={() => navigate('/')} className="back-to-home-button">Quay lại Trang chủ</button>
    </div>
  );
};

export default OrderSuccessPage;
