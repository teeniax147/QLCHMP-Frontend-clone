import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './CartPage.css';
import { API_BASE_URL } from '../config'
import { useDispatch } from "react-redux";
import { getItemCount } from "../services/cart.service";

const CartPage = () => {
  const dispatch = useDispatch();
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCartDetails();
  }, []);

  const fetchCartDetails = async () => {
    try {
      let response;

      if (!token) {
        // Khách vãng lai - sử dụng session
        response = await axios.get(`${API_BASE_URL}/Carts/details-guest`, {
          withCredentials: true // Gửi cookie session
        });

        console.log('Phản hồi từ API giỏ hàng khách:', response.data);

        // Kiểm tra và trích xuất dữ liệu chính xác
        if (response.data && response.data.CartItems) {
          // Lấy đúng mảng sản phẩm từ $values
          let items = [];

          if (response.data.CartItems.$values && Array.isArray(response.data.CartItems.$values)) {
            items = response.data.CartItems.$values;
          } else if (Array.isArray(response.data.CartItems)) {
            items = response.data.CartItems;
          }

          // Xử lý thêm thông tin sản phẩm nếu cần
          const processedItems = items.map(item => ({
            ...item,
            ImageUrl: item.ImageUrl
              ? `https:/localhost:5001/${item.ImageUrl}` // Append base URL for image path
              : "default-image.jpg", // Fallback image if no image URL
          }));

          setCartItems(processedItems);
          setTotalAmount(response.data.TotalAmount || 0);
        } else {
          setCartItems([]);
          setTotalAmount(0);
        }

        setError(null);
      } else {
        // Người dùng đã đăng nhập
        response = await axios.get(`${API_BASE_URL}/Carts/details`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data && response.data.CartItems) {
          // Xử lý trường hợp đặc biệt khi có $values
          const items = response.data.CartItems.$values
            ? response.data.CartItems.$values
            : (Array.isArray(response.data.CartItems) ? response.data.CartItems : []);

          const cartItemsWithTotalPrice = items.map(item => ({
            ...item,
            // Clean and handle the product image URL

            ImageUrl: item.ImageUrl
              ? `https://api.cutexiu.teeniax.io.vn/${item.ImageUrl}` // Append base URL for image path
              : "default-image.jpg", // Fallback image if no image URL
            TotalPrice: item.Quantity * item.UnitPrice // Tính toán giá sản phẩm ban đầu
          }));

          setCartItems(cartItemsWithTotalPrice);
          setTotalAmount(response.data.TotalAmount || 0);
        } else {
          setCartItems([]);
          setTotalAmount(0);
        }
      }

      setError(null);
    } catch (err) {
      console.error("Lỗi khi lấy thông tin giỏ hàng:", err);
      setError("Không thể lấy dữ liệu giỏ hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Hàm xóa một sản phẩm khỏi giỏ hàng
  const removeItem = async (productId) => {
    try {
      if (!token) {
        // Khách vãng lai
        await axios.delete(`${API_BASE_URL}/Carts/remove-guest-item`, {
          data: { ProductId: productId },
          withCredentials: true
        });
      } else {
        // Người dùng đã đăng nhập
        await axios.delete(`${API_BASE_URL}/Carts/remove-item`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          data: { ProductId: productId }
        });
      }

      // Sau khi xóa thành công, cập nhật lại giỏ hàng
      fetchCartDetails();
      getItemCount(dispatch);
    } catch (err) {
      console.error("Lỗi khi xóa sản phẩm:", err);
      setError("Lỗi khi xóa sản phẩm khỏi giỏ hàng.");
    }
  };

  // Hàm xóa tất cả sản phẩm khỏi giỏ hàng
  const clearCart = async () => {
    try {
      if (!token) {
        // Khách vãng lai
        await axios.delete(`${API_BASE_URL}/Carts/clear-guest`, {
          withCredentials: true
        });
      } else {
        // Người dùng đã đăng nhập
        await axios.delete(`${API_BASE_URL}/Carts/clear`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }

      // Cập nhật lại giỏ hàng sau khi xóa tất cả sản phẩm
      setCartItems([]);
      setTotalAmount(0);
      getItemCount(dispatch);
    } catch (err) {
      console.error("Lỗi khi xóa tất cả sản phẩm:", err);
      setError("Lỗi khi xóa tất cả sản phẩm khỏi giỏ hàng.");
    }
  };

  const handleQuantityChange = async (productId, delta) => {
    const itemToUpdate = cartItems.find(item => item.ProductId === productId);
    if (!itemToUpdate) return;

    // Tính toán số lượng mới
    const newQuantity = itemToUpdate.Quantity + delta;

    // Kiểm tra nếu số lượng hợp lệ (không nhỏ hơn 1)
    if (newQuantity <= 0) {
      alert("Số lượng không thể nhỏ hơn 1");
      return;
    }

    try {
      let response;

      if (!token) {
        // Khách vãng lai
        response = await axios.put(
          `${API_BASE_URL}/Carts/update-guest`,
          {
            ProductId: productId,
            Quantity: newQuantity,
          },
          {
            withCredentials: true
          }
        );
      } else {
        // Người dùng đã đăng nhập
        response = await axios.put(
          `${API_BASE_URL}/Carts/update`,
          {
            ProductId: productId,
            Quantity: newQuantity,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // Nếu API trả về thành công, cập nhật giỏ hàng ngay lập tức
      if (response.status === 200) {
        // Cập nhật giỏ hàng trong state mà không cần gọi lại fetchCartDetails
        setCartItems(prevItems =>
          prevItems.map(item =>
            item.ProductId === productId
              ? { ...item, Quantity: newQuantity, TotalPrice: newQuantity * item.UnitPrice }
              : item
          )
        );
        setTotalAmount(prevAmount => prevAmount + (itemToUpdate.UnitPrice * delta));
        getItemCount(dispatch); // Cập nhật lại số lượng item trong giỏ
      } else {
        setError("Lỗi khi cập nhật số lượng sản phẩm.");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng:", error);
      setError("Lỗi khi cập nhật số lượng sản phẩm.");
    }
  };

  const handleCheckout = () => {

    navigate('/cart-preview');

  };

  if (loading) return <p style={{ marginTop: "100px", textAlign: "center" }}>Đang tải giỏ hàng...</p>;
  if (error) return <p style={{ marginTop: "100px", textAlign: "center" }}>{error}</p>;
  if (!cartItems || cartItems.length === 0) return (
    <div className="cart-container empty-cart-container">
      <div className="empty-cart-content">
        <p className="empty-cart-message">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
        <button
          className="continue-shopping-button"
          onClick={() => navigate('/all-products')}
        >
          Tiếp tục mua sắm
        </button>
      </div>

    </div>

  );

  return (
    <div className="cart-container">
      <h2 className="cart-title">Giỏ Hàng</h2>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Sản Phẩm</th>
            <th>Tên Sản Phẩm</th>
            <th>Số Lượng</th>
            <th>Giá</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item, index) => (
            <tr key={index}>
              <td>
                <img
                  src={item.ImageUrl || "https://via.placeholder.com/100"}
                  alt={item.ProductName}
                  className="cart-item-image"
                />

              </td>
              <td className="product-name2">{item.ProductName}</td>
              <td className="quantity">
                <div className="quantity-container">
                  <button onClick={() => handleQuantityChange(item.ProductId, -1)}>-</button>
                  <div className="quantity-display">{item.Quantity}</div>
                  <button onClick={() => handleQuantityChange(item.ProductId, 1)}>+</button>
                </div>
              </td>

              <td className="price">{item.UnitPrice.toLocaleString()} VND</td>

              <td>
                <button className="delete-button" onClick={() => removeItem(item.ProductId)}>
                  x
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="cart-total1">Tổng thanh toán: {totalAmount.toLocaleString()} VND</div>
      <div className="button-container">
        <button className="delete-all-button" onClick={clearCart}>XÓA TẤT CẢ</button>
        <button className="checkout-button" onClick={handleCheckout}>MUA HÀNG</button>
      </div>
    </div>
  );
};

export default CartPage;