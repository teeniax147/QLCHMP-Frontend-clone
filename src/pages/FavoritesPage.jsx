import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FavoritesPage.css";
import { API_BASE_URL } from '../config'
const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]); // Danh sách yêu thích
  const [error, setError] = useState(null); // Trạng thái lỗi

  // Lấy danh sách sản phẩm yêu thích
  const fetchFavorites = async () => {
    const token = localStorage.getItem("token"); // Lấy token từ localStorage
    if (!token) {
      alert("Bạn cần đăng nhập để xem danh sách yêu thích.");
      return;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/Favorites/user-favorites`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Gửi token thực từ localStorage
          },
        }
      );
      console.log("Dữ liệu yêu thích:", response.data); // Log dữ liệu trả về
      setFavorites(response.data.$values || response.data); // Cập nhật danh sách yêu thích
    } catch (error) {
      console.error("Lỗi khi lấy danh sách yêu thích:", error);
      setError("Không thể tải danh sách yêu thích."); // Cập nhật trạng thái lỗi
    }
  };

  useEffect(() => {
    fetchFavorites(); // Lấy danh sách yêu thích khi load trang
  }, []);

  // Xử lý xóa sản phẩm khỏi danh sách yêu thích
  const handleRemoveFavorite = async (productId) => {
    const token = localStorage.getItem("token"); // Lấy token từ localStorage
    if (!token) {
      alert("Bạn cần đăng nhập để thực hiện thao tác này.");
      return;
    }

    try {
      // Gửi yêu cầu xóa sản phẩm yêu thích
      const response = await axios.delete(
        `${API_BASE_URL}/Favorites/remove`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: { ProductId: productId },
        }
      );

      console.log("Xóa thành công:", response.data);
      // Cập nhật lại danh sách yêu thích sau khi xóa sản phẩm
      setFavorites(favorites.filter(favorite => favorite.Id !== productId));
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm yêu thích:", error);
      alert("Không thể xóa sản phẩm khỏi danh sách yêu thích.");
    }
  };

  if (error) {
    return <p>{error}</p>; // Hiển thị lỗi nếu có
  }

  if (!favorites.length) {
    return <p>Nhấn nút trái tim ở mỗi sản phẩm để lưu vào ưa thích</p>;
  }

  return (
    <div className="favorites-container">
      <h1 className="favorites-title">SẢN PHẨM ƯA THÍCH</h1>
      <div className="favorites-grid">
        {favorites.map((favorite) => (
          <div className="favorites-card" key={favorite.Id}>
            <img
              src={favorite.ImageUrl || "https://via.placeholder.com/150"} // Hình ảnh sản phẩm hoặc placeholder
              alt={favorite.Name}
              className="favorites-image"
            />
            <div className="favorites-details">
              <p className="favorites-brand">
                {favorite.BrandName || "Không rõ"}
              </p>
              <h3 className="favorites-name">{favorite.Name}</h3>
            
           
                {favorite.Price ? (
                  <>
                    <p className="favorites-price">
                      {`${favorite.Price.toLocaleString()}đ`}
                    </p>
                    {favorite.OriginalPrice && favorite.OriginalPrice > favorite.Price && (
                      <span className="favorites-original-price">
                        {`${favorite.OriginalPrice.toLocaleString()}đ`}
                      </span>
                    )}
                  </>
                ) : (
                  <p className="favorites-price">Liên hệ</p>
                )}
            

              
              
              <div className="favorites-rating-stars">
                {Array.from({ length: 5 }, (_, index) => (
                  <span
                    key={index}
                    className={`favorite-star ${favorites.ReviewCount > 0 && index < Math.round(favorites.AverageRating || 0) ? "filled" : ""
                      }`}
                  >
                    ★
                  </span>
                ))}
                <span className="favorite-review-count">({favorites.ReviewCount || 0})</span>
              </div>

              {/* Nút xóa sản phẩm yêu thích */}
              <div
                className="favorite-remove-icon"
                onClick={() => handleRemoveFavorite(favorite.Id)} // Gọi hàm xóa sản phẩm khi nhấp vào trái tim
              >
                ♡
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesPage;
