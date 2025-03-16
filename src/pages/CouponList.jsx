import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CouponList.css';
import { API_BASE_URL } from '../config'
const CouponList = () => {
  const [coupons, setCoupons] = useState([]);
  const [error, setError] = useState(null);
  const handleCopy = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      alert('Mã đã được sao chép!');
    }).catch(err => {
      alert('Không thể sao chép mã!');
    });
  };

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/Coupons`);
        const couponsData = response.data.$values || [];
        setCoupons(couponsData);
      } catch (err) {
        setError("Không thể tải danh sách mã giảm giá.");
        console.error(err);
      }
    };

    fetchCoupons();
  }, []);

  return (
    <div className="coupon-list">
      <h1>Tất cả mã giảm giá</h1>
      {error && <p className="error">{error}</p>}
      <div className="coupon-grid">
        {coupons.map((coupon) => (
          <div className="coupon-card" key={coupon.Id || coupon.id}>
            <div className="coupon-header">
            <div className="coupon-left">
         Mã ưu đãi
              </div>
              <div className='coupon-code2'>
              <h2 className="coupon-code">{coupon.Code}</h2>
              <button className="copy-btn" onClick={() => handleCopy(coupon.Code)}>
                <img src="https://img.icons8.com/?size=100&id=86216&format=png&color=000000" alt="Sao chép" className="copy-icon" />
              </button>
              </div>
          </div>
            <hr className="coupon-divider" />
           
            <div className="coupon-right">
             
              <h2 className="coupon-discount">Giảm {coupon.DiscountPercentage}% giảm tối đa {coupon.MaxDiscountAmount}đ</h2>
              <p className="min-order">Đơn tối thiểu: {coupon.MinimumOrderAmount}đ</p>
             
                <div className="expiry">
                  <span>Hiệu lực:</span> <span>{coupon.StartDate}</span>
                  <span>Hết hạn:</span> <span>{coupon.EndDate}</span>
                </div>

              
              <div className="quantity-tag">x {coupon.QuantityAvailable}</div>
            </div>
          </div>



        ))}
      </div>
    </div>
  );
};

export default CouponList;
