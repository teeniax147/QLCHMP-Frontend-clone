import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Register.css';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config'
const Register = () => {
  const [username, setUsername] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.add('register-page');
    document.body.classList.add('register-page');

    return () => {
      document.documentElement.classList.remove('register-page');
      document.body.classList.remove('register-page');
    };
  }, []);

  const validateForm = () => {
    let formErrors = {};

    // Email validation
    if (!email) {
      formErrors.email = "Email là bắt buộc.";
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      formErrors.email = "Email không hợp lệ. Email phải chứa ký tự '@'.";
    }

    // Username validation
    if (!username) {
      formErrors.username = "Tên đăng nhập là bắt buộc.";
    } else if (username.length < 6 || username.length > 24) {
      formErrors.username = "Tên đăng nhập phải từ 6 đến 24 ký tự.";
    } else if (!/^(?!.*[._])(?!.*\s)[a-zA-Z0-9]{6,24}$/.test(username)) {
      formErrors.username = "Tên đăng nhập không được có khoảng trắng, ký tự đặc biệt, dấu chấm hoặc dấu gạch dưới.";
    }

    // Password validation
    if (!password) {
      formErrors.password = "Mật khẩu là bắt buộc.";
    } else if (password.length < 8 || password.length > 32) {
      formErrors.password = "Mật khẩu phải dài từ 8 đến 32 ký tự.";
    } else if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/.test(password)) {
      formErrors.password = "Mật khẩu phải có ít nhất một ký tự chữ hoa, một chữ số và một ký tự đặc biệt.";
    }

    // Confirm password validation
    if (!confirmPassword) {
      formErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc.";
    } else if (password !== confirmPassword) {
      formErrors.confirmPassword = "Mật khẩu và xác nhận mật khẩu không khớp.";
    }

    // Last name validation
    if (!lastName) {
      formErrors.lastName = "Họ là bắt buộc.";
    } else if (lastName.length < 2 || lastName.length > 40) {
      formErrors.lastName = "Họ phải từ 2 đến 40 ký tự.";
    }

    // First name validation
    if (!firstName) {
      formErrors.firstName = "Tên là bắt buộc.";
    } else if (firstName.length < 2 || firstName.length > 40) {
      formErrors.firstName = "Tên phải từ 2 đến 40 ký tự.";
    }

    // Phone number validation
    if (!phoneNumber) {
      formErrors.phoneNumber = "Số điện thoại là bắt buộc.";
    } else if (!/^[0-9]{10}$/.test(phoneNumber)) {
      formErrors.phoneNumber = "Số điện thoại phải bao gồm 10 chữ số từ 0 đến 9.";
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Vui lòng hoàn thành tất cả các trường bắt buộc.");
      return;
    }

    const data = {
      email,
      username,
      password,
      confirmPassword,
      lastName,
      firstName,
      phone: phoneNumber,
      address: ''
    };
    console.log("Sending request", data);

    try {
      const response = await axios.post(`${API_BASE_URL}/Users/register`, data);
      console.log("Response:", response.data);
      alert(response.data);
      navigate('/otp', { state: { email, otpPurpose: 'register' } });
    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu:', error);
      if (error.response) {
        alert(error.response.data);
      }
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-form">
        <div className="logo">
          <img src="/imgs/Icons/logo1.png" alt="Glamour Cosmic Logo" />
        </div>
        <h2>Đăng Ký Tài Khoản</h2>
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <div className="input-group">
            <label>Tên Đăng Nhập</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Nhập tên đăng nhập của bạn"
            />
            {errors.username && <p className="error-text">{errors.username}</p>}
          </div>
          <div className="input-group">
            <label>Họ</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              placeholder="Nhập họ của bạn"
            />
            {errors.lastName && <p className="error-text">{errors.lastName}</p>}
          </div>
          <div className="input-group">
            <label>Tên</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder="Nhập tên của bạn"
            />
            {errors.firstName && <p className="error-text">{errors.firstName}</p>}
          </div>

          <div className="input-group">
            <label>Số Điện Thoại</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              placeholder="Nhập số điện thoại của bạn"
            />
            {errors.phoneNumber && <p className="error-text">{errors.phoneNumber}</p>}
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Nhập email của bạn"
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          <div className="input-group">
            <label>Mật Khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Nhập mật khẩu của bạn"
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          <div className="input-group">
            <label>Xác Nhận Mật Khẩu</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Xác nhận mật khẩu của bạn"
            />
            {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" className="register-button">
            Đăng Ký
          </button>
        </form>
        <p>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
      </div>
    </div>
  );
};

export default Register;
