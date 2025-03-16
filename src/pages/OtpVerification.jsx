import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './OtpVerification.css';
import { API_BASE_URL } from '../config';

const OtpVerification = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300); // Thời gian đếm ngược
  const [canResend, setCanResend] = useState(false); // Trạng thái gửi lại OTP
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const otpPurpose = location.state?.otpPurpose || 'register';

  // Kiểm tra email hợp lệ
  if (!email) {
    console.error('Email không được truyền vào component OtpVerification');
    alert('Đã có lỗi xảy ra. Email không được xác định.');
    navigate('/register');
    return null;
  }

  // Hàm để xử lý thay đổi OTP
  const handleInputChange = (e) => {
    setOtp(e.target.value);
    if (error) setError(false);
  };

  // Hàm xác nhận OTP
  const handleSubmit = async () => {
    if (otp.length !== 6) {
      setError(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/Users/verify-otp`, {
        email,
        otp,
        otpPurpose,
      });
      console.log("Response:", response.data);
      alert(response.data);
      if (otpPurpose === 'forgot-password') {
        navigate('/reset-password', { state: { email } }); // Chuyển hướng tới trang đặt lại mật khẩu
      } else {
        navigate('/login'); // Chuyển hướng tới trang đăng nhập nếu là đăng ký
      }
    } catch (error) {
      console.error('OTP xác thực thất bại:', error.response ? error.response.data : error.message);
      alert(error.response ? error.response.data : 'Đã xảy ra lỗi trong quá trình xác thực OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Hàm gửi lại OTP
  const handleResendOtp = async () => {
    if (!email) {
      alert('Email không hợp lệ.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/Users/forgot-password`, {
        email,
      });
      console.log("OTP resend response:", response.data);
      alert('Mã OTP đã được gửi lại đến email của bạn.');
      setTimer(60); // Reset lại thời gian đếm ngược
      setCanResend(false); // Không cho phép gửi lại khi đang đếm ngược
    } catch (error) {
      console.error('Gửi lại OTP thất bại:', error.response ? error.response.data : error.message);
      alert(error.response ? error.response.data : 'Đã xảy ra lỗi trong quá trình gửi lại OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Hàm hủy bỏ
  const handleCancel = () => {
    navigate('/register');
  };

  // Đếm ngược thời gian
  useEffect(() => {
    if (timer === 0) {
      setCanResend(true); // Cho phép gửi lại OTP khi hết thời gian
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    // Dọn dẹp interval khi component bị hủy
    return () => clearInterval(interval);
  }, [timer]);

  return (
    <div className="otp-wrapper">
      <div className="otp-page">
        <div className="otp-form">
          <div className="logo">
            <img src="/imgs/Icons/logo1.png" alt="Glamour Cosmic Logo" />
          </div>
          <h2>Xác nhận OTP</h2>
          <p>Vui lòng nhập mã OTP được gửi đến email của bạn</p>
          <div className="otp-input-group">
            <input
              type="text"
              value={otp}
              onChange={handleInputChange}
              className={`otp-input ${error ? 'error' : ''}`}
              placeholder="Nhập mã OTP"
              maxLength="6"
            />
            {error && <p className="error-text">Mã OTP phải có 6 chữ số</p>}
          </div>
          <p className="expiry-text">
            Mã OTP sẽ hết hạn sau {timer} giây
          </p>
          <div className="otp-button-group">
            <button
              className="resend-button"
              onClick={handleResendOtp}
              disabled={!canResend || loading}
            >
              {loading ? 'Đang gửi...' : 'Gửi lại mã'}
            </button>
            <button
              className="confirm-button"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Đang xác nhận...' : 'Xác Nhận'}
            </button>
          </div>
          <button
            className="cancel-button"
            onClick={handleCancel}
            disabled={loading}
          >
            Hủy Bỏ
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
