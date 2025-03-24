import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Đảm bảo Link được import
import axios from 'axios';
import './Login.css';
import { API_BASE_URL } from '../config';
const Login = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const loginAPI = async (user, pass) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/Users/login`, {
        EmailOrUsername: user,
        Password: pass,
      });
      return res;
    } catch (error) {
      console.log(error);
      // Nếu có lỗi xảy ra trong quá trình gọi API, hiển thị thông báo lỗi
      setError('Tên đăng nhập hoặc mật khẩu không đúng.');
      setLoading(false);  // Tắt loading khi gặp lỗi
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await loginAPI(emailOrUsername, password);

    if (res.status === 200) {
      const { $values } = res.data.roles;
      const token = res.data.token?.Result; // Lấy chuỗi token từ response

      if (!token) {
        setError('Không nhận được token hợp lệ từ server.');
        setLoading(false);
        return;
      }

      // Điều hướng người dùng dựa trên vai trò
      switch ($values[0]) {
        case "Admin":
          navigate("/admin");
          break;
        case "Staff":
          navigate("/staff");
          break;
        case "Customer":
          navigate("/");
          break;
        default:
          break;
      }

      // Lưu thông tin người dùng và token vào localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('id', res.data.userId);
      localStorage.setItem('userName', res.data.userName);
      localStorage.setItem('roles', JSON.stringify($values[0]));
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không đúng.');
      setLoading(false);  // Đảm bảo không để trạng thái loading khi có lỗi
    }
  };
  useEffect(() => {
    localStorage.removeItem('roles')
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
  }, [])

  return (
    <div className="login-wrapper">
      <div className="login-page">
        <div className="login-container">
          <div className="login-form">
            <div className="logo">
              <img src="/imgs/logo1.png" alt="Glamour Cosmic Logo" />
            </div>
            <h2>ĐĂNG NHẬP</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Email hoặc Tên đăng nhập</label>
                <input
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  required
                  placeholder="Nhập email hoặc tên đăng nhập của bạn"
                />
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
              </div>
              <div className="forgot-password">
                <Link to="/forgot-password">Quên mật khẩu?</Link>
              </div>
              {/* Hiển thị lỗi nếu có */}
              {error && <p className="error-text">{error}</p>}

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
              </button>
            </form>
            
            <p>Chưa có tài khoản? <Link to="/register" className="register-link">Đăng ký ngay</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
