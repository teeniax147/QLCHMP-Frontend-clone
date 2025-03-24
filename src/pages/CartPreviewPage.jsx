import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './CartPreviewPage.css';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config'

const CartPreviewPage = () => {
  const formatDiscountRate = (rate) => {
    if (rate === null || rate === undefined) return 0;
    return rate > 1 ? rate : (rate * 100).toFixed(0);
  };

  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState(null);

  const navigate = useNavigate();
  const [shippingCompanies, setShippingCompanies] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [userAddress, setUserAddress] = useState('');
  const [email, setEmail] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [selectedShippingCompany, setSelectedShippingCompany] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [membershipInfo, setMembershipInfo] = useState(null);
  const [selectedPaymentMethodDetails, setSelectedPaymentMethodDetails] = useState(null);

  // Lấy token để xác định loại người dùng
  const token = localStorage.getItem('token');
  const isGuest = !token;

  // Xác định nếu phương thức thanh toán là VNPAY
  const isVnpayPayment = useMemo(() => {
    return selectedPaymentMethodDetails &&
      (selectedPaymentMethodDetails.Name?.toLowerCase().includes('vnpay') ||
        selectedPaymentMethodDetails.Name?.toLowerCase().includes('vn pay'));
  }, [selectedPaymentMethodDetails]);

  useEffect(() => {
    // Kiểm tra giỏ hàng trước khi tải trang
    if (isGuest) {
      checkGuestCart();
    }

    fetchInitialData();
    if (!isGuest) {
      fetchUserInfo();
      fetchMembershipInfo();
    }
  }, []);

  useEffect(() => {
    if (selectedPaymentMethod && paymentMethods.length > 0) {
      const selectedMethod = paymentMethods.find(method => method.Id.toString() === selectedPaymentMethod.toString());
      setSelectedPaymentMethodDetails(selectedMethod);
    } else {
      setSelectedPaymentMethodDetails(null);
    }
  }, [selectedPaymentMethod, paymentMethods]);

  const checkGuestCart = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Carts/details-guest`, {
        withCredentials: true
      });

      console.log("Giỏ hàng khách vãng lai:", response.data);

      if (!response.data ||
        !response.data.CartItems ||
        (Array.isArray(response.data.CartItems) && response.data.CartItems.length === 0) ||
        (response.data.Message && response.data.Message.includes("trống"))) {
        alert("Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm vào giỏ hàng trước.");
        navigate('/');
      }
    } catch (err) {
      console.error("Lỗi khi kiểm tra giỏ hàng:", err);
      alert("Không thể kiểm tra thông tin giỏ hàng. Vui lòng thử lại sau.");
      navigate('/');
    }
  };

  const fetchInitialData = async () => {
    try {
      let shippingResponse, paymentResponse;

      if (isGuest) {
        [shippingResponse, paymentResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/ShippingCompany`),
          axios.get(`${API_BASE_URL}/PaymentMethod`)
        ]);
      } else {
        [shippingResponse, paymentResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/ShippingCompany`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/PaymentMethod`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
      }

      const shipCompanies = shippingResponse.data.$values || shippingResponse.data || [];
      const payMethods = paymentResponse.data.$values || paymentResponse.data || [];

      setShippingCompanies(Array.isArray(shipCompanies) ? shipCompanies : []);
      setPaymentMethods(Array.isArray(payMethods) ? payMethods : []);
      setError(null);
    } catch (err) {
      console.error("Fetch Initial Data Error:", err.response ? err.response.data : err.message);
      setError("Không thể tải dữ liệu cần thiết. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    if (isGuest) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/Users/get-user-info`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setUserAddress(response.data.Address || '');
        setFirstName(response.data.FirstName || '');
        setLastName(response.data.LastName || '');
        setPhone(response.data.PhoneNumber || '');
        setEmail(response.data.Email || '');
      }
    } catch (err) {
      console.error("Fetch User Info Error:", err.response ? err.response.data : err.message);
    }
  };

  const fetchMembershipInfo = async () => {
    if (isGuest) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/MembershipLevels/CustomerMembershipInfo`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        console.log("Membership info received:", response.data);
        setMembershipInfo(response.data);
      }
    } catch (err) {
      console.error("Fetch Membership Info Error:", err.response ? err.response.data : err.message);
    }
  };

  const updateAddress = async () => {
    if (isGuest) return;

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
    } catch (err) {
      console.error("Update Address Error:", err.response ? err.response.data : err.message);
    }
  };

  const handleAddressChange = (e) => {
    setUserAddress(e.target.value);
  };

  const handleAddressBlur = () => {
    if (!isGuest) {
      updateAddress();
    }
  };

  const fetchPreviewOrder = async () => {
    console.log("Cookies hiện tại:", document.cookie);

    if (!selectedShippingCompany || !selectedPaymentMethod || !userAddress) {
      setError("Vui lòng chọn đầy đủ thông tin công ty vận chuyển, phương thức thanh toán và địa chỉ.");
      return;
    }

    if (isGuest && (!email || !phone)) {
      setError("Vui lòng nhập đầy đủ email và số điện thoại để tiếp tục.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Kiểm tra giỏ hàng trước khi xem trước
      if (isGuest) {
        try {
          const cartCheck = await axios.get(`${API_BASE_URL}/Carts/details-guest`, {
            withCredentials: true
          });

          console.log("Kiểm tra giỏ hàng trước khi preview:", cartCheck.data);

          if (!cartCheck.data ||
            !cartCheck.data.CartItems ||
            (cartCheck.data.Message && cartCheck.data.Message.includes("trống"))) {
            setError("Giỏ hàng của bạn đang trống. Không thể tạo đơn hàng.");
            setLoading(false);
            return;
          }
        } catch (cartErr) {
          console.error("Lỗi khi kiểm tra giỏ hàng:", cartErr);
        }
      }

      let response;
      const requestData = {
        CouponCode: couponCode || null,
        ShippingCompanyId: parseInt(selectedShippingCompany) || null,
        PaymentMethodId: parseInt(selectedPaymentMethod) || null,
        ShippingAddress: userAddress,
        PhoneNumber: phone,
        Email: email
      };

      console.log("Đang gửi yêu cầu xem trước đơn hàng:", requestData);

      if (isGuest) {
        response = await axios.post(
          `${API_BASE_URL}/Carts/preview-guest`,
          requestData,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        response = await axios.post(
          `${API_BASE_URL}/Carts/preview`,
          requestData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      console.log("Dữ liệu preview:", response.data);
      setDebug(response.data);

      if (typeof response.data === 'string') {
        setError(response.data);
        setPreviewData(null);
      }
      else if (response.data && response.data.Message && response.data.Message.includes("Giỏ hàng của bạn đang trống")) {
        setError(response.data.Message);
        setPreviewData(null);
      }
      else {
        const previewProcessed = {
          CartItems: response.data.CartItems || [],
          OriginalTotalAmount: response.data.OriginalTotalAmount || 0,
          DiscountAmount: response.data.DiscountAmount || 0,
          ShippingCost: response.data.ShippingCost || 0,
          TotalAmount: response.data.TotalAmount || 0
        };

        setPreviewData(previewProcessed);
        setError(null);
      }
    } catch (err) {
      console.error("Preview Order Error:", err);
      if (err.response) {
        console.error("Response data:", err.response.data);
        setError(typeof err.response.data === 'string'
          ? err.response.data
          : (err.response.data?.message || "Không thể lấy dữ liệu xem trước đơn hàng"));
      } else {
        setError("Không thể lấy dữ liệu xem trước đơn hàng. Vui lòng thử lại.");
      }
      setPreviewData(null);
    } finally {
      setLoading(false);
    }
  };

  const processVnpayPayment = async (orderId) => {
    setLoading(true);
    console.log("Starting VNPAY payment process for order:", orderId);
    console.log("Total amount to be charged:", previewData.TotalAmount);

    try {
      console.log("Preparing to call VNPAY API...");
      const requestUrl = `${API_BASE_URL}/Vnpay/CreatePaymentUrl?money=${previewData.TotalAmount}&description=${encodeURIComponent(`Thanh toán đơn hàng #${orderId}`)}`;
      console.log("Request URL:", requestUrl);

      console.log("Making GET request to VNPAY API with params:", {
        money: previewData.TotalAmount,
        description: `Thanh toán đơn hàng #${orderId}`
      });
      const returnUrl = `${window.location.origin}/vnpay-callback`;
      console.log("Frontend return URL:", returnUrl);

      let response;
      if (isGuest) {
        response = await axios.get(
          `${API_BASE_URL}/Vnpay/CreatePaymentUrl`,
          {
            params: {
              money: previewData.TotalAmount,
              description: `Thanh toán đơn hàng #${orderId}`,
              returnUrl: returnUrl
            },
            withCredentials: true
          }
        );
      } else {
        response = await axios.get(
          `${API_BASE_URL}/Vnpay/CreatePaymentUrl`,
          {
            params: {
              money: previewData.TotalAmount,
              description: `Thanh toán đơn hàng #${orderId}`,
              returnUrl: returnUrl
            },
            headers: {
              Authorization: `Bearer ${token}`,
              'accept': 'text/plain'
            }
          }
        );
      }

      console.log("VNPAY API response status:", response.status);
      console.log("VNPAY API response headers:", response.headers);
      console.log("VNPAY API full response:", response);

      console.log("Response data type:", typeof response.data);
      if (typeof response.data === 'object') {
        console.log("Response data keys:", Object.keys(response.data));
      } else {
        console.log("Response data content:", response.data);
      }

      let paymentUrl = null;

      if (response.status === 201) {
        console.log("Response status is 201 Created as expected");

        if (response.data && typeof response.data === 'string') {
          console.log("Found URL in response.data");
          paymentUrl = response.data;
        } else if (response.headers && response.headers.location) {
          console.log("Found URL in Location header");
          paymentUrl = response.headers.location;
        } else if (response.request && response.request.responseURL) {
          console.log("Found URL in responseURL");
          paymentUrl = response.request.responseURL;
        } else if (response.data && typeof response.data === 'object') {
          console.log("Searching for URL in response object properties");
          for (const key in response.data) {
            const value = response.data[key];
            if (typeof value === 'string' && value.includes('vnpay')) {
              console.log(`Found potential VNPAY URL in property '${key}':`, value);
              paymentUrl = value;
              break;
            }
          }
        }
      } else {
        console.log("Unexpected response status:", response.status);
      }

      if (paymentUrl) {
        console.log("Successfully found payment URL:", paymentUrl);
        console.log("Redirecting to VNPAY payment gateway...");
        window.location.href = paymentUrl;
      } else {
        console.error("Payment URL not found in response");
        if (typeof response.data === 'string' && response.data.includes('http')) {
          console.log("Found URL-like string in response.data:", response.data);
          window.location.href = response.data;
        } else {
          throw new Error("Không nhận được URL thanh toán từ VNPAY");
        }
      }
    } catch (err) {
      console.error("VNPAY Payment Error:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response,
        stack: err.stack
      });

      if (err.response) {
        console.error("Error response status:", err.response.status);
        console.error("Error response data:", err.response.data);
        setError(`Lỗi thanh toán VNPAY: ${err.response.data}`);
      } else if (err.request) {
        console.error("No response received from server");
        setError("Không nhận được phản hồi từ máy chủ VNPAY. Vui lòng thử lại sau.");
      } else {
        setError("Không thể khởi tạo thanh toán VNPAY. Vui lòng thử lại sau.");
      }
      setLoading(false);
    }
  };

  const createOrder = async () => {
    if (!previewData) {
      setError("Vui lòng xem trước đơn hàng trước khi đặt hàng.");
      return;
    }

    if (isGuest && (!email || !phone || !userAddress)) {
      setError("Vui lòng nhập đầy đủ email, số điện thoại và địa chỉ để tiếp tục.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response;

      if (isGuest) {
        response = await axios.post(
          `${API_BASE_URL}/Orders/create-guest`,
          {
            ShippingAddress: userAddress,
            PhoneNumber: phone,
            Email: email,
            FirstName: firstName,
            LastName: lastName,
            CouponCode: couponCode || null,
            ShippingCompanyId: parseInt(selectedShippingCompany) || null,
            PaymentMethodId: parseInt(selectedPaymentMethod) || null
          },
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        response = await axios.post(
          `${API_BASE_URL}/Orders/create`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      console.log("Kết quả tạo đơn hàng:", response.data);

      // Kiểm tra VNPAY trước
      if (isVnpayPayment) {
        const orderId = response.data.OrderId || response.data.Id || response.data.$id || Date.now();
        localStorage.setItem('lastOrderId', orderId.toString());
        await processVnpayPayment(orderId);
        return;
      }

      // Xử lý chuyển hướng - QUAN TRỌNG: không phụ thuộc vào isOrderCreated
      console.log("Chuyển hướng đến trang order-success");
      // Sử dụng window.location thay vì navigate để đảm bảo chuyển trang
      window.location.href = '/order-success';

    } catch (err) {
      console.error("Lỗi tạo đơn hàng:", err);
      if (err.response) {
        setError(`Không thể tạo đơn hàng: ${err.response.data.Message || err.response.data}`);
      } else {
        setError("Không thể tạo đơn hàng. Vui lòng thử lại sau.");
      }
      setLoading(false);
    }
  };

  if (loading) return <p>Đang xử lý dữ liệu...</p>;
  if (error) return (
    <div className="error-container">
      <p className="error-message">{error}</p>
      <button onClick={() => window.history.back()} className="back-button">QUAY LẠI GIỎ HÀNG</button>
    </div>
  );

  return (
    <div className="preview-container">
      <h2 className="preview-title">THÔNG TIN THANH TOÁN</h2>

      <div className="input-section">
        <label>Họ:</label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          onBlur={handleAddressBlur}
        />

        <label>Tên:</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          onBlur={handleAddressBlur}
        />

        <label>Số điện thoại:</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={handleAddressBlur}
          required={isGuest}
        />

        <label>Email:</label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!isGuest}
          required={isGuest}
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
          required
        >
          <option value="">Chọn phương thức vận chuyển</option>
          {Array.isArray(shippingCompanies) && shippingCompanies.map((company) => (
            <option key={company.Id} value={company.Id}>
              {company.Name} - {company.ShippingCost?.toLocaleString()}đ
            </option>
          ))}
        </select>

        <label>Phương thức thanh toán:</label>
        <select
          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
          value={selectedPaymentMethod}
          required
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
          onBlur={handleAddressBlur}
          className="address-input"
          required
        />

        <button onClick={fetchPreviewOrder} className="preview-button">XEM TRƯỚC ĐƠN HÀNG</button>
      </div>

      {previewData && (
        <div className="preview-details">
          <p>Tổng giá trị đơn hàng: {previewData.OriginalTotalAmount.toLocaleString()}đ</p>
          <p>Giảm giá: {previewData.DiscountAmount.toLocaleString()}đ</p>
          <p>Tổng tiền ship: {previewData.ShippingCost.toLocaleString()}đ</p>
          <p>Tổng (Đã bao gồm VAT): {previewData.TotalAmount.toLocaleString()}đ</p>

          {isVnpayPayment && (
            <p className="payment-notice">
              <strong>Lưu ý:</strong> Bạn sẽ được chuyển hướng đến cổng thanh toán VNPAY sau khi đặt hàng.
            </p>
          )}
        </div>
      )}

      {debug && (
        <div className="debug-info" style={{ display: 'none' }}>
          <pre>{JSON.stringify(debug, null, 2)}</pre>
        </div>
      )}

      <div className="button-container">
        <button
          onClick={createOrder}
          className="next-button"
          disabled={!previewData}
        >
          ĐẶT HÀNG
        </button>
        <button onClick={() => window.history.back()} className="back-button">QUAY LẠI GIỎ HÀNG</button>
      </div>
    </div>
  );
};

export default CartPreviewPage;