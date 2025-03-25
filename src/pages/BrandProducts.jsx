import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom"; // Thêm useNavigate
import "./BrandProducts.css";
import { API_BASE_URL } from '../config'
const BrandProducts = () => {
  const { brandId } = useParams(); // Lấy brandId từ URL
  const [brandInfo, setBrandInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Điều hướng

    useEffect(() => {
      const fetchBrandProducts = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`${API_BASE_URL}/thuong-hieu/${brandId}`);
          const data = response.data;

          // Set brand information
          setBrandInfo({
            Name: data.Name,
            LogoUrl: data.LogoUrl ? `https://api.cutexiu.teeniax.io.vn/${data.LogoUrl}` : null, // Add domain if needed
            Description: data.Description,
          });

          // Clean the product data, handling image URLs
          const cleanedProducts = data.Products.$values.map((product) => ({
            ...product,
            ImageUrl: product.ImageUrl
              ? `https://api.cutexiu.teeniax.io.vn/${product.ImageUrl}` // Append base URL to image path
              : "default-image.jpg", // Provide default image if not available
          }));

          setProducts(cleanedProducts); // Set cleaned products
        } catch (error) {
          console.error("Lỗi khi tải sản phẩm theo thương hiệu:", error);
          setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
        } finally {
          setLoading(false);
        }
      };
    fetchBrandProducts();
  }, [brandId]);

  const handleAddToFavorites = async (productId) => {
    const token = localStorage.getItem("token");
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

      alert(response.data);
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm yêu thích:", error.response?.data || error.message);
      alert(error.response?.data || "Không thể thêm sản phẩm vào yêu thích.");
    }
  };

  if (loading) return <p>Đang tải sản phẩm...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="brand-product-container">
      <div className="brand-product-header-banner">
        <img src="https://cutexiu.teeniax.io.vn/imgs/banner5.png" alt="Banner" />
      </div>
      <div className="brand-product-header">
        {brandInfo.LogoUrl ? (
          <img
            src={brandInfo.LogoUrl}
            alt={`${brandInfo.Name} Logo`}
            className="brand-logo"
          />
        ) : null}
        <div className="brand-title-description">
          <h1>{brandInfo?.Name}</h1>
          <p>{brandInfo?.Description}</p>
        </div>

      </div>

      <div className="brand-product-grid">
        {products.length > 0 ? (
          products.map((product) => (
            <div
              className="brand-product-card"
              key={product.Id}
              onClick={() => navigate(`/product-detail/${product.Id}`)}
            >
              <div
                className="brand-favorite-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToFavorites(product.Id);
                }}
              >
                ♡
              </div>
              <img
                src={product.ImageUrl || "https://via.placeholder.com/150"}
                alt={product.Name}
                className="brand-product-image"
              />
              <div className="brand-product-details">
                <p className="brand-product-brand">{product.Brand?.Name || brandInfo.Name}</p>
                <h3 className="brand-product-name">{product.Name}</h3>

                {/* Hiển thị giá */}
                <p className="brand-product-price">
                  {product.Price ? `${product.Price.toLocaleString()}đ` : "Liên hệ"}
                </p>
                <div className="price-and-discount-container-brand">
                  {/* Hiển thị giá gốc và tag giảm giá cùng một dòng */}
                  {product.OriginalPrice && product.OriginalPrice > product.Price && (
                    <>
                      <span className="brand-product-original-price ">{product.OriginalPrice.toLocaleString()}đ</span>
                      <div className="discount-tag-brand">-{Math.round(((product.OriginalPrice - product.Price) / product.OriginalPrice) * 100)}%</div>
                    </>
                  )}
                </div>
                {/* Đánh giá sao */}
                <div className="brand-product-rating-stars">
                  {Array.from({ length: 5 }, (_, index) => (
                    <span
                      key={index}
                      className={`brand-product-star ${product.ReviewCount > 0 && index < Math.round(product.AverageRating || 0)
                        ? "filled"
                        : ""
                        }`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="brand-product-review-count">({product.ReviewCount || 0})</span>
                </div>

             
              </div>

            </div>
          ))
        ) : (
          <p>Không có sản phẩm nào trong danh mục này.</p>
        )}
      </div>
    </div>
  );
};

export default BrandProducts;
