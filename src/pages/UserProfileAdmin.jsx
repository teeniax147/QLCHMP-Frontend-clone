import React, { useState, useEffect } from "react";
import axios from "axios";
import './UserProfile.css';
import { API_BASE_URL } from '../config'
const UserProfileAdmin = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    email: '',
    userName: '',
  });

  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const getUserProfile = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Token không tồn tại. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/Users/get-user-info`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const user = response.data;
      setFormData({
        firstName: user.FirstName || "",
        lastName: user.LastName || "",
        phone: user.PhoneNumber || "",
        address: user.Address || "",
        email: user.Email || "",
        userName: user.UserName || "",
      });
      setError(null);
    } catch (error) {
      console.error("Lỗi khi tải thông tin người dùng:", error);
      setError("Không thể tải thông tin người dùng. Vui lòng thử lại.");

      if (error.response && error.response.status === 401) {
        alert("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
      }
    }
  };

  const updateUserProfile = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Token không tồn tại. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      await axios.put(
        `${API_BASE_URL}/Users/update`,
        {
          FirstName: formData.firstName,
          LastName: formData.lastName,
          Phone: formData.phone,
          Address: formData.address,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setError(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000); // Tự động ẩn thông báo sau 3 giây
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin người dùng:", error);
      setError("Không thể cập nhật thông tin. Vui lòng thử lại.");
    }
  };

  useEffect(() => {
    getUserProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
  
    <div className="user-profile-container">
      <h2>TÀI KHOẢN</h2>
      {error && <p className="user-error-message">{error}</p>}
      
      {/* Thông báo thành công */}
      {showSuccess && <div className="custom-success-toast">Cập nhật thông tin thành công.</div>}
      
      <div className="user-input-section">
        <div className="user-row">
          <div>
            <label>Họ:</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
    
          <div>
            <label>Tên:</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>
        </div>
    
        <div className="user-row">
          <div>
            <label>Email:</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              disabled
            />
          </div>
    
          <div>
            <label>Số điện thoại:</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>
    
        <div className="user-row">
          <div>
            <label>Tên người dùng:</label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              disabled
            />
          </div>
    
          <div>
            <label>Địa chỉ:</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    
      <button className="user-save-button" onClick={updateUserProfile}>Lưu</button>
    </div>

  );
};

export default UserProfileAdmin;
