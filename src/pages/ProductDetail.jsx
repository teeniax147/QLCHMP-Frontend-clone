import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProductDetail.css";
import { API_BASE_URL } from "../config";
import { useDispatch } from "react-redux";
import { getItemCount } from "../services/cart.service";

const ProductDetail = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProductDetail = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/Products/chi-tiet/${id}`
        );

        // Clean and handle the product image URL
        const cleanedProduct = {
          ...response.data,
          ImageUrl: response.data.ImageUrl
            ? `https://api.cutexiu.teeniax.io.vn/${response.data.ImageUrl}` // Add base URL for image path
            : "default-image.jpg", // Fallback image if no image URL
        };

        setProduct(cleanedProduct);
      } catch (err) {
        console.error("Lỗi khi tải chi tiết sản phẩm:", err);
        setError("Không thể tải chi tiết sản phẩm.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [id]);



  const handleAddToCart = async (redirectToCart = false) => {
    if (addingToCart) return; // Ngăn chặn gửi nhiều yêu cầu liên tiếp

    setAddingToCart(true);

    try {
      const token = localStorage.getItem("token");

      const requestData = {
        ProductId: parseInt(id, 10),
        Quantity: quantity,
      };

      console.log('Đang thêm vào giỏ hàng:', requestData);

      let response;

      if (!token) {
        // Khách vãng lai - sử dụng session
        response = await axios.post(
          `${API_BASE_URL}/Carts/add-guest`,
          requestData,
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true // Quan trọng: gửi và nhận cookie session
          }
        );

        console.log('Phản hồi từ API giỏ hàng khách:', response.data);

        // Kiểm tra và xử lý dữ liệu giỏ hàng
        if (response.data && response.data.sessionData) {
          try {
            // Thử phân tích chuỗi JSON từ sessionData
            const cartData = JSON.parse(response.data.sessionData);
            if (Array.isArray(cartData)) {
              // Tính tổng số lượng sản phẩm
              const totalItems = cartData.reduce((sum, item) => sum + item.Quantity, 0);
              localStorage.setItem('guestCartCount', totalItems.toString());
            }
          } catch (parseError) {
            console.error("Lỗi phân tích dữ liệu giỏ hàng:", parseError);
          }
        }
      } else {
        // Người dùng đã đăng nhập - sử dụng token
        response = await axios.post(
          `${API_BASE_URL}/Carts/add`,
          requestData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true
          }
        );

        console.log('Phản hồi từ API giỏ hàng người dùng:', response.data);
      }

      // Xử lý phản hồi từ server
      let alertMessage;

      if (typeof response.data === 'string') {
        alertMessage = response.data;
      } else if (response.data && response.data.message) {
        alertMessage = response.data.message;
      } else {
        alertMessage = "Đã thêm sản phẩm vào giỏ hàng";
      }

      alert(alertMessage);

      // Cập nhật số lượng sản phẩm trong giỏ hàng trên UI
      getItemCount(dispatch);

      // Điều hướng đến giỏ hàng nếu người dùng chọn "Mua Ngay"
      if (redirectToCart) {
        navigate("/CartPage");
      }
    } catch (err) {
      console.error("Chi tiết lỗi:", err);
      let errorMessage = "Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng";

      if (err.response) {
        errorMessage = typeof err.response.data === 'string'
          ? err.response.data
          : (err.response.data?.message || "Không thể xử lý yêu cầu");
      } else if (err.request) {
        errorMessage = "Không có phản hồi từ server. Vui lòng kiểm tra kết nối.";
      } else {
        errorMessage = err.message;
      }

      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (change) => {
    setQuantity((prev) => Math.max(1, prev + change));
  };
  const handleAddToFavorites = async (productId) => {
    const token = localStorage.getItem("token"); // Lấy token từ localStorage
    console.log("Token từ localStorage:", token);

    if (!token) {
      alert("Bạn cần đăng nhập để thêm sản phẩm vào danh sách yêu thích.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/Favorites/add`,
        { ProductId: productId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data); // Hiển thị thông báo thành công từ server
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm yêu thích:", error.response?.data || error.message);
      alert(error.response?.data || "Không thể thêm sản phẩm vào yêu thích.");
    }
  };
  if (loading) return <div className="loading-container"><p>Đang tải chi tiết sản phẩm...</p></div>;
  if (error) return <div className="error-container"><p>{error}</p></div>;
  if (!product) return <div className="error-container"><p>Không tìm thấy sản phẩm.</p></div>;

  return (
    <div className="product-detail-container">
      <img
        src={product.ImageUrl || "https://via.placeholder.com/500"}
        alt={product.Name}
        className="product-detail-image"
      />
      <div className="product-details">
        <h1 className="custom-product-title">{product.Name}</h1>
        <div className="product-rating-stars">
          {Array.from({ length: 5 }, (_, index) => (
            <span
              key={index}
              className={`product-star ${product.ReviewCount > 0 && index < Math.round(product.AverageRating || 0) ? "filled" : ""
                }`}
            >
              ★
            </span>
          ))}
          <span>({product.ReviewCount || 0})</span>
        </div>
        <div className="price-and-discount-container-custom">
          <p className="custom-product-price">
            {product.Price?.toLocaleString()}đ
          </p>

          {product.OriginalPrice && product.OriginalPrice > product.Price && (
            <>
              <span className="product-original-price2-custom">{product.OriginalPrice.toLocaleString()}đ</span>
              <div className="discount-tag-custom">-{Math.round(((product.OriginalPrice - product.Price) / product.OriginalPrice) * 100)}%</div>
            </>
          )}
        </div>
        <div className="product-actions">
          <div className="quantity-container">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
            >-</button>
            <div className="quantity-display">{quantity}</div>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={addingToCart}
            >+</button>
          </div>

          <div className="buttons-container">
            <button
              className="custom-add-to-cart-button"
              onClick={() => handleAddToCart(false)}
              disabled={addingToCart}
            >
              <img
                src="https://img.icons8.com/?size=100&id=ii6Lr4KivOiE&format=png&color=000000"
                alt="Cart Icon"
                style={{
                  width: "20px",
                  height: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                  filter: "invert(1)",
                }}
              />
              {addingToCart ? "Đang thêm..." : "Thêm Vào Giỏ Hàng"}
            </button>

            <button
              className="custom-buy-now-button"
              onClick={() => handleAddToCart(true)}
              disabled={addingToCart}
            >
              <span>{addingToCart ? "Đang xử lý..." : "Mua Ngay"}</span>
            </button>

            <div
              className="product-favorite-icon1"
              onClick={(e) => {
                e.stopPropagation();
                handleAddToFavorites(product.Id);
              }}
            >
              ♡
            </div>
          </div>
        </div>

        <p className="introduce">Giới thiệu:</p>
        <p className="custom-product-description">{product.Description || "Không có mô tả chi tiết."}</p>
      </div>
    </div>
  );
};

export default ProductDetail;