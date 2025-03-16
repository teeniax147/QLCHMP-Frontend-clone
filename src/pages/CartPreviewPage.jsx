import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CartPreviewPage.css';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config'
const CartPreviewPage = () => {
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const [shippingCompanies, setShippingCompanies] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [userAddress, setUserAddress] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [selectedShippingCompany, setSelectedShippingCompany] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    fetchInitialData();
    fetchUserInfo();
  }, []);

  const fetchInitialData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Vui lòng đăng nhập.");
      setLoading(false);
      return;
    }

    try {
      const [shippingResponse, paymentResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/ShippingCompany`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/PaymentMethod`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setShippingCompanies(shippingResponse.data.$values || []);
      setPaymentMethods(paymentResponse.data.$values || paymentResponse.data || []);
      setError(null);
    } catch (err) {
      console.error("Fetch Initial Data Error:", err.response ? err.response.data : err.message);
      setError("Không thể tải dữ liệu cần thiết. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Vui lòng đăng nhập.");
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/Users/get-user-info`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setUserAddress(response.data.Address || '');
        setFirstName(response.data.FirstName || '');
        setLastName(response.data.LastName || '');
        setPhone(response.data.PhoneNumber || '');
      }
    } catch (err) {
      console.error("Fetch User Info Error:", err.response ? err.response.data : err.message);
      setError("Không thể tải thông tin người dùng.");
    }
  };

  const updateAddress = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Vui lòng đăng nhập.");
      return;
    }
  
    try {
      await axios.put(
        `${API_BASE_URL}/Users/update`,
        {
          FirstName: firstName,
          LastName: lastName,
          Phone: phone,
          Address: userAddress
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
  
      setError(null);
      // Không cần hiển thị thông báo khi cập nhật thành công
    } catch (err) {
      console.error("Update Address Error:", err.response ? err.response.data : err.message);
      setError(`Không thể cập nhật địa chỉ. Chi tiết: ${JSON.stringify(err.response ? err.response.data : err.message)}`);
    }
  };
  
  const handleAddressChange = (e) => {
    setUserAddress(e.target.value);
  };

  const handleAddressBlur = () => {
    updateAddress(); // Gọi hàm cập nhật địa chỉ khi người dùng rời khỏi ô nhập
  };

  const fetchPreviewOrder = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Vui lòng đăng nhập.");
      return;
    }

    if (!selectedShippingCompany || !selectedPaymentMethod || !userAddress) {
      setError("Vui lòng chọn đầy đủ thông tin công ty vận chuyển, phương thức thanh toán và địa chỉ.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/Carts/preview`,
        {
          CouponCode: couponCode || null,
          ShippingCompanyId: parseInt(selectedShippingCompany) || null,
          PaymentMethodId: parseInt(selectedPaymentMethod) || null,
          ShippingAddress: userAddress
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setPreviewData(response.data);
      setError(null);
    } catch (err) {
      console.error("Preview Order Error:", err.response ? err.response.data : err.message);
      setError("Không thể lấy dữ liệu xem trước đơn hàng. Vui lòng thử lại.");
      setPreviewData(null);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Vui lòng đăng nhập.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.post(
        `${API_BASE_URL}/Orders/create`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      navigate('/order-success'); // Điều hướng tới trang OrderSuccessPage
    } catch (err) {
      console.error("Create Order Error:", err.response ? err.response.data : err.message);
      setError("Không thể tạo đơn hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Đang xử lý dữ liệu...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="preview-container">
      <h2 className="preview-title">THÔNG TIN THANH TOÁN</h2>

      <div className="input-section">
        <label>Họ:</label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        <label>Tên:</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <label>Số điện thoại:</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <label>Mã giảm giá:</label>
        <input
          type="text"
          placeholder="Nhập mã giảm giá"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
        />

        <label>Phương thức vận chuyển:</label>
        <select
          onChange={(e) => setSelectedShippingCompany(e.target.value)}
          value={selectedShippingCompany}
        >
          <option value="">Chọn phương thức vận chuyển</option>
          {Array.isArray(shippingCompanies) && shippingCompanies.map((company) => (
            <option key={company.Id} value={company.Id}>
              {company.Name} - {company.ShippingCost.toLocaleString()}đ
            </option>
          ))}
        </select>

        <label>Phương thức thanh toán:</label>
        <select
          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
          value={selectedPaymentMethod}
        >
          <option value="">Chọn phương thức thanh toán</option>
          {Array.isArray(paymentMethods) && paymentMethods.map((method) => (
            <option key={method.Id} value={method.Id}>
              {method.Name}
            </option>
          ))}
        </select>

        <label>Thông tin nhận hàng:</label>
        <input
          type="text"
          value={userAddress}
          onChange={handleAddressChange}
          onBlur={handleAddressBlur} // Gọi hàm update khi rời khỏi ô nhập
          className="address-input"
        />

        <button onClick={fetchPreviewOrder} className="preview-button">XEM TRƯỚC ĐƠN HÀNG</button>
      </div>

      {previewData && (
        <div className="preview-details">
          <p>Tổng giá trị đơn hàng: {previewData.OriginalTotalAmount.toLocaleString()} VND</p>
          <p>Giảm giá: {previewData.DiscountAmount.toLocaleString()} VND</p>
          <p>Tổng tiền ship: {previewData.ShippingCost.toLocaleString()} VND</p>
          <p>Tổng (Đã bao gồm VAT): {previewData.TotalAmount.toLocaleString()} VND</p>
        </div>
      )}

      <div className="button-container">
        <button onClick={createOrder} className="next-button">ĐẶT HÀNG</button>
        <button onClick={() => window.history.back()} className="back-button">QUAY LẠI GIỎ HÀNG</button>
      </div>
    </div>
  );
};

export default CartPreviewPage;
