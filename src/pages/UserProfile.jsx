import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UserProfile.css";
import { API_BASE_URL } from "../config";

const UserProfile = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    email: "",
    userName: "",
  });

  const [membershipInfo, setMembershipInfo] = useState(null);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

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
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin người dùng:", error);
      setError("Không thể cập nhật thông tin. Vui lòng thử lại.");
    }
  };

  const getCustomerMembershipInfo = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Token không tồn tại. Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/MembershipLevels/CustomerMembershipInfo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("API response:", response.data); // Debug log

      // Explicitly use the exact property names from the API response
      setMembershipInfo({
        CustomerId: response.data.CustomerId,
        CurrentLevelName: response.data.CurrentLevelName,
        TotalSpending: response.data.TotalSpending,
        CurrentDiscountRate: response.data.CurrentDiscountRate,
        NextLevelName: response.data.NextLevelName,
        AmountToNextLevel: response.data.AmountToNextLevel,
        NextLevelDiscountRate: response.data.NextLevelDiscountRate
      });

      setError(null);
    } catch (error) {
      console.error("Lỗi khi tải thông tin tư cách thành viên:", error);

      if (error.response) {
        if (error.response.status === 400) {
          setError("Yêu cầu không hợp lệ. Vui lòng thử lại.");
        } else if (error.response.status === 401) {
          alert("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("token");
        } else if (error.response.status === 404) {
          setError("Không tìm thấy thông tin khách hàng.");
        } else {
          setError("Lỗi khi tải thông tin tư cách thành viên. Vui lòng thử lại.");
        }
      } else {
        setError("Lỗi khi kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
      }

      setMembershipInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserProfile();
    getCustomerMembershipInfo();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Format Vietnamese currency - handle possible NaN values
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return "0 đ";
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format percentage - handle possible NaN values
  const formatPercentage = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return "0%";
    }
    // The API returns decimal values (0, 0.01) directly
    return `${value * 100}%`;
  };

  // Determine if user has reached max level
  const hasNextLevel = () => {
    return membershipInfo &&
      membershipInfo.NextLevelName &&
      membershipInfo.NextLevelName !== "";
  };

  return (
    <div className="user-profile-container">
      <h2>TÀI KHOẢN</h2>
      {error && <p className="user-error-message">{error}</p>}

      {showSuccess && (
        <div className="custom-success-toast">
          Cập nhật thông tin thành công.
        </div>
      )}

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
            <input type="text" name="email" value={formData.email} disabled />
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

      <button className="user-save-button" onClick={updateUserProfile}>
        Lưu
      </button>

      <div className="membership-info-container">
        <h2>THỨ HẠNG THÀNH VIÊN</h2>
        {loading ? (
          <div className="membership-loading">Đang tải thông tin thành viên...</div>
        ) : membershipInfo ? (
          <div className="membership-details">


            <div className="membership-row">
              <div className="membership-label">Cấp độ hiện tại: {membershipInfo.CurrentLevelName || "Thành Viên"}</div>

            </div>

            <div className="membership-row">
              <div className="membership-label">Tổng chi tiêu: {formatCurrency(membershipInfo.TotalSpending)}</div>
            </div>

            <div className="membership-row">
              <div className="membership-label">Tỷ lệ chiết khấu hiện tại: {formatPercentage(membershipInfo.CurrentDiscountRate)}</div>
            </div>

            {hasNextLevel() ? (
              <>
                <div className="membership-divider"></div>
                <div className="next-level-section">
                  <div className="membership-row">
                    <div className="membership-label">Cấp độ tiếp theo: {membershipInfo.NextLevelName}</div>

                  </div>

                  <div className="membership-row">
                    <div className="membership-label">Số tiền cần chi tiêu để lên cấp: {formatCurrency(membershipInfo.AmountToNextLevel)}</div>

                  </div>

                  <div className="membership-row">
                    <div className="membership-label">Tỷ lệ chiết khấu cấp tiếp theo: {formatPercentage(membershipInfo.NextLevelDiscountRate)}</div>

                  </div>
                </div>

              </>
            ) : (
              <div className="membership-row">
                <div className="membership-label">Trạng thái: Bạn đã đạt cấp thành viên cao nhất</div>

              </div>
            )}
          </div>
        ) : (
          <div className="membership-error">Không thể tải thông tin thành viên</div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;