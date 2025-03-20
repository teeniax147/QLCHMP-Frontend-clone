import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./AllProductsList.css"; // CSS cho giao diện
import { API_BASE_URL } from '../config'

const AllProductsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchProducts = location.state?.products || []; // Lấy dữ liệu từ tìm kiếm
  const [avgPrice, setAvgPrice] = useState(null);
  const [products, setProducts] = useState(searchProducts);
  const [loading, setLoading] = useState(!searchProducts.length);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    brandId: '',
    isOnSale: false,
  });
  const [selectedPriceRange, setSelectedPriceRange] = useState(""); // Thêm dòng này để theo dõi phạm vi giá

  const [sortOrder, setSortOrder] = useState(""); // Thứ tự sắp xếp: 'asc' hoặc 'desc'
  const [page, setPage] = useState(1); // Số trang hiện tại
  const [totalPages, setTotalPages] = useState(1); // Tổng số trang
  const [noProductsFound, setNoProductsFound] = useState(false); // State để theo dõi trường hợp không có sản phẩm

  const pageSize = 12; // Số sản phẩm mỗi trang
  const priceRanges = [
    { label: "50.000đ - 100.000đ", min: 50000, max: 100000 },
    { label: "20.000đ - 50.000đ", min: 20000, max: 50000 },
    { label: "Dưới 100.000đ", min: 0, max: 100000 },
  ];


  useEffect(() => {
    console.log("Dữ liệu tìm kiếm:", searchProducts);

    if (searchProducts.length > 0) {
      setProducts([...searchProducts]); // Ép React cập nhật UI
      setNoProductsFound(false); // Đã có sản phẩm
      setLoading(false);
    }
  }, [searchProducts]);


  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${API_BASE_URL}/Products/loc`, {
          params: {
            pageNumber: page,
            pageSize: pageSize,
            minPrice: filters.minPrice || undefined,
            maxPrice: filters.maxPrice || undefined,
            brandId: filters.brandId || undefined,
            isOnSale: filters.isOnSale,
            sortByPrice: sortOrder || undefined,
          },
        });

        const data = response.data;
        const productsList = data.DanhSachSanPham?.$values || [];

        // Clean and handle the product image URL similar to beauty blog images
        const cleanedProducts = productsList.map((product) => ({
          ...product,
          ImageUrl: product.ImageUrl
            ? `https://localhost:5001/${product.ImageUrl}`
            : "default-image.jpg", // Provide default image if not available
        }));

        setProducts(cleanedProducts);
        setNoProductsFound(cleanedProducts.length === 0); // Kiểm tra có sản phẩm hay không
        setTotalPages(Math.ceil(data.TongSoSanPham / pageSize));
      } catch (error) {
        setError("Lỗi từ server: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, [sortOrder, page]); // Chạy lại khi filters, page hoặc sortOrder thay đổi



  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "priceRange") {
      // Xử lý phạm vi giá
      const selectedRange = priceRanges.find(range => range.label === value);

      if (selectedRange) {
        setSelectedPriceRange(value); // Lưu phạm vi giá đã chọn

        if (checked) {
          // Khi checkbox được tích, thiết lập giá trị minPrice và maxPrice
          setFilters((prevFilters) => ({
            ...prevFilters,
            minPrice: selectedRange.min,
            maxPrice: selectedRange.max,
          }));
        } else {
          // Khi bỏ tích, reset minPrice và maxPrice
          setFilters((prevFilters) => ({
            ...prevFilters,
            minPrice: '', // Xóa giá trị minPrice
            maxPrice: '', // Xóa giá trị maxPrice
          }));
          setSelectedPriceRange(""); // Reset selectedPriceRange khi bỏ tích
        }
      }
    } else if (type === "checkbox") {
      // Xử lý các checkbox khác (ví dụ: isOnSale, productTypes)
      setFilters((prevFilters) => ({
        ...prevFilters,
        [name]: checked ? value : '', // Thiết lập giá trị cho checkbox (trong đó value là giá trị của checkbox)
      }));
    } else {
      // Xử lý các trường khác (input type text, select)
      setFilters((prevFilters) => ({
        ...prevFilters,
        [name]: value, // Cập nhật giá trị cho các bộ lọc khác
      }));
    }
  };

  const handlePageChange = (newPage) => {
    console.log("Đang thay đổi trang:", newPage); // Kiểm tra xem giá trị trang có thay đổi hay không
    setPage(newPage);
  };

  const applyFilters = () => {
    setLoading(true);

    // Chỉ gửi các tham số hợp lệ, bỏ qua giá trị null hoặc undefined
    const validParams = {
      pageNumber: page,
      pageSize: pageSize,
      ...(filters.minPrice && { minPrice: filters.minPrice }),
      ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      ...(filters.brandId && { brandId: filters.brandId }),
      ...(filters.isOnSale !== null && { isOnSale: filters.isOnSale }),
      ...(sortOrder && { sortByPrice: sortOrder }),
    };

    axios
      .get(`${API_BASE_URL}/Products/loc`, { params: validParams })
      .then((response) => {
        const data = response.data.DanhSachSanPham?.$values || [];
        // Loại bỏ sản phẩm trùng lặp
        const uniqueProducts = Array.from(new Map(data.map(item => [item.Id, item])).values());

        // Clean and handle the product image URL
        const cleanedProducts = uniqueProducts.map((product) => ({
          ...product,
          ImageUrl: product.ImageUrl
            ? `https://localhost:5001/${product.ImageUrl}`
            : "default-image.jpg", // Provide default image if not available
        }));

        console.log("Cleaned Products:", cleanedProducts); // Log to see the updated products

        setProducts(cleanedProducts); // Cập nhật danh sách sản phẩm
        setNoProductsFound(cleanedProducts.length === 0); // Cập nhật trạng thái không có sản phẩm
        setTotalPages(Math.ceil(response.data.TongSoSanPham / pageSize)); // Cập nhật số trang
      })
      .catch((error) => {
        console.error("Lỗi khi gọi API:", error);
        setError("Lỗi từ server: " + error.message);
      })
      .finally(() => {
        setLoading(false);
      });
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

  if (loading) {
    return <p>Đang tải danh sách sản phẩm...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="product-container-all">

      <div className="product-header-banner-all">
        <img
          src="imgs/banner5.png"
          alt="Banner"
        />
      </div>
    
      <h1 className="product-title-all">Tất cả sản phẩm</h1>
      <div className="product-title-search">
      {products.length} Kết quả
      </div>
      <div className="product-page-container">
        <div className="filters-all">
          <div className="filter-section-all">

            <h4 className="product-text-all">Giá sản phẩm:</h4>

            <div className="price-filters2">
              <label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="10000"
                />
              </label>
              <h4 className="product-text">-</h4>
              <label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="100000"
                />
              </label>
            </div>
        
          <div className="price-range-checkbox-section">
            {priceRanges.map((range) => (
              <div key={range.label} className="price-range-checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="priceRange"
                    value={range.label}
                    onChange={handleFilterChange}
                    checked={selectedPriceRange === range.label}
                  />
                  {range.label}
                </label>
              </div>
            ))}
          </div>
          </div>
          <div className="apply-button-container">
            <button className="page-button-all1" onClick={applyFilters}>
              Áp dụng
            </button>
          </div>
          <div className="sort-section-all">
            <label htmlFor="sortFilter" className="filter-label-all">
              Sắp xếp theo:
            </label>
            <select
              name="sortByPrice"
              onChange={(e) => setSortOrder(e.target.value)}
              value={sortOrder}
            >
              <option value="">Tất cả</option>
              <option value="asc">Giá thấp nhất</option>
              <option value="desc">Giá cao nhất</option>
              <option value="avgasc">Giá trung bình</option>
            </select>
          </div>
        </div>

        {/* Kiểm tra nếu không có sản phẩm sau khi lọc */}
        {noProductsFound ? (
          <div className="no-products-message">
            <p>Không có sản phẩm nào phù hợp với điều kiện lọc của bạn.</p>
          </div>
        ) : (
          <div className="product-grid-all">
            {products.map((product, index) => (
              <div
                className="product-card-all"
                key={`${product.Id}-${index}`}
                onClick={() => navigate(`/product-detail/${product.Id}`)}
              >
                {/* Thêm nút trái tim */}
                <div
                  className="product-favorite-icon"
                  onClick={(e) => {
                    e.stopPropagation(); // Ngăn sự kiện click vào thẻ cha
                    handleAddToFavorites(product.Id); // Gọi API thêm vào danh sách yêu thích
                  }}
                >
                  ♡
                </div>

                <img
                  src={product.ImageUrl}
                  alt={`${product.Name} `}
                  className="product-image-all"
                />
                <div className="product-details-all">
                  <p className="product-brand-all">{product.BrandName || "Không có thương hiệu"}</p>
                  <h3 className="product-name-all">{product.Name}</h3>
                  <p className="product-price-all">
                    {product.Price ? `${product.Price.toLocaleString()}đ` : "Liên hệ"}
                  </p>
                  <div className="price-and-discount-container">
                    {/* Hiển thị giá gốc và tag giảm giá cùng một dòng */}
                    {product.OriginalPrice && product.OriginalPrice > product.Price && (
                      <>
                        <span className="product-original-price2">{product.OriginalPrice.toLocaleString()}đ</span>
                        <div className="discount-tag">-{Math.round(((product.OriginalPrice - product.Price) / product.OriginalPrice) * 100)}%</div>
                      </>
                    )}
                  </div>

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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pagination-all">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={`page-button-all1 ${page === index + 1 ? "active-all" : ""}`}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>


    </div>

  );
};
export default AllProductsList;
