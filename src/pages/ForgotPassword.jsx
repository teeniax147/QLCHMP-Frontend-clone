import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ForgotPassword.css';
import { API_BASE_URL } from '../config'
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    setError(''); // Reset error message when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Email là bắt buộc.");
      return;
    }

    // Simple email validation
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
      setError("Email không hợp lệ.");
      return;
    }

    setLoading(true);
    try {
      // Gửi yêu cầu quên mật khẩu tới API
      const response = await axios.post(`${API_BASE_URL}/Users/forgot-password`, { email });
      console.log("Response:", response.data);
      alert("Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra email để xác nhận.");
      
      // Chuyển đến trang xác thực OTP với mục đích là "forgot-password"
      navigate('/otp', { state: { email, otpPurpose: 'forgot-password' } });
    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu:', error.response ? error.response.data : error.message);
      setError(error.response ? error.response.data : 'Đã xảy ra lỗi khi gửi yêu cầu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-wrapper">
      <div className="forgot-password-form">
      <div className="logo">
              <img src="/imgs/Icons/logo1.png" alt="Glamour Cosmic Logo" />
            </div>
        <h2>Quên Mật Khẩu</h2>
        <p>Vui lòng nhập địa chỉ email của bạn để nhận mã OTP khôi phục mật khẩu.</p>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={handleInputChange}
              placeholder="Nhập email của bạn"
              required
            />
            {error && <p className="error-text">{error}</p>}
          </div>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
