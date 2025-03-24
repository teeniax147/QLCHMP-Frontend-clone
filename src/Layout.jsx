import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import './Layout.css';
import CategoryDropdown from "./pages/CategoryDropdown";
import BrandDropdown from "./pages/BrandDropdown";
import axios from 'axios'; // Thêm axios để gọi API
import { useNavigate } from "react-router-dom";  // Thêm useNavigate
import { API_BASE_URL } from './config';
import { useDispatch, useSelector } from 'react-redux';
import { getItemCount } from './services/cart.service';

const Layout = () => {
  const dispatch = useDispatch();
  const { countItem } = useSelector((state) => state.cartReducer);

  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }

    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting('Good morning 🌅');
    } else if (currentHour < 18) {
      setGreeting('Good afternoon ☀️');
    } else {
      setGreeting('Good evening 🌙');
    }

    getItemCount(dispatch);
  }, []);

  const handleDropdownToggle = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('roles');
    localStorage.removeItem('token');
    setUserName('');


    setShowDropdown(false);

  };
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchKeyword.trim()) {
      alert("Vui lòng nhập từ khóa tìm kiếm!");
      return;
    }

    try {
      console.log(" Từ khóa tìm kiếm:", searchKeyword);

      const response = await axios.get(`${API_BASE_URL}/Products/tim-kiem`, {
        params: { Keyword: searchKeyword },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}` || "",
        },
      });

      console.log(" Phản hồi từ API:", response.data);

      if (!response.data || response.data.TotalProducts === 0) {
        alert("Không tìm thấy sản phẩm nào phù hợp.");
        return;
      }

      console.log(" Dữ liệu gửi sang AllProductsList:", response.data.Products.$values);

      // Điều hướng và truyền dữ liệu vào state
      navigate("/all-products", { state: { products: response.data.Products.$values || [] } });

    } catch (error) {
      console.error("Lỗi khi gọi API tìm kiếm:", error.response?.data || error.message);
      alert("Không thể tìm kiếm sản phẩm. Vui lòng thử lại!");
    }
  };




  return (
    <>
      <header className="home">
        <div className="header-top">

          <span className="store-info">Mua online nhận nhiều ưu đãi hấp dẫn</span>
        </div>

        <div className="header-main">
          <Link to="/" className="logoheader">
            <img src="/imgs/Icons/logo.png" alt="Glamour Cosmic Logo" />
          </Link>

          {/* Thanh tìm kiếm */}
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Nhập từ khóa tìm kiếm..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <button type="submit" className="search-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 30 30">
                <path d="M 13 3 C 7.4889971 3 3 7.4889971 3 13 C 3 18.511003 7.4889971 23 13 23 C 15.396508 23 17.597385 22.148986 19.322266 20.736328 L 25.292969 26.707031 A 1.0001 1.0001 0 1 0 26.707031 25.292969 L 20.736328 19.322266 C 22.148986 17.597385 23 15.396508 23 13 C 23 7.4889971 18.511003 3 13 3 z M 13 5 C 17.430123 5 21 8.5698774 21 13 C 21 17.430123 17.430123 21 13 21 C 8.5698774 21 5 17.430123 5 13 C 5 8.5698774 8.5698774 5 13 5 z"></path>
              </svg>
            </button>
          </form>

          <div className="header-icons">

            <a href="https://info.cutexiu.teeniax.io.vn/" target="_blank" rel="noopener noreferrer" className="link-blog">
              <span className="icon">
                <img src="/imgs/Icons/trungtamhotro.png" alt="Support Icon" />
                Trung tâm hỗ trợ
              </span>
            </a>

            <span className="icon-more">•••</span>
            <span className="icon-divider"></span>
            <span className="icon">
              {userName ? (
                <div onClick={handleDropdownToggle} className="user-menu-trigger">
                  <img src="/imgs/Icons/dangnhap.png" alt="User Icon" />
                  <span>Xin chào {userName} !</span>
                </div>
              ) : (

                <Link to="/login" className='link-blog'>
                  <img src="/imgs/Icons/dangnhap.png" alt="Login Icon" />

                  Đăng nhập

                </Link>

              )}
              {userName && showDropdown && (
                <div className="user-dropdown-menu">
                  <p>{greeting} {userName} !</p>
                  <ul>
                    <li>
                      <Link to="/user-profile">
                        <img src="https://img.icons8.com/?size=100&id=98957&format=png&color=000000" alt="Thông tin tài khoản Icon" style={{ width: '20px', marginRight: '8px', verticalAlign: 'middle' }} />
                        Thông tin tài khoản
                      </Link>
                    </li>

                    <li>
                      <Link to="/orders/customer/:customerId">
                        <img src="https://img.icons8.com/?size=100&id=89394&format=png&color=000000" alt="Lịch sử đặt hàng Icon" style={{ width: '20px', marginRight: '8px', verticalAlign: 'middle' }} />
                        Đơn hàng
                      </Link>
                    </li>

                    <li>
                      <button onClick={handleLogout} className="logout-button">Đăng xuất</button>
                    </li>
                  </ul>
                </div>
              )}
            </span>
            <span className="iconfavorites">
              <Link to="/favorites">❤️</Link>
            </span>
            <span className="iconcart">
              <Link to="/CartPage">
                <img src="/imgs/cart1.png" alt="Cart Icon" />
                <span className="cart-count">{countItem}</span>
              </Link>
            </span>

          </div>
        </div>

        <nav className="nav">
          <ul>
            <li><Link to="/">TRANG CHỦ</Link></li>
            <li><Link to="/all-products">SẢN PHẨM</Link></li>
            <li>
              <CategoryDropdown title="BỘ SƯU TẬP" parentId={2} />
            </li>

            <li><BrandDropdown title="THƯƠNG HIỆU" /></li>

            <li><Link to="/coupons">MÃ ƯU ĐÃI</Link></li>
          </ul>
        </nav>


      </header>
      {/* Đây là phần Outlet hiển thị nội dung của trang */}
      <main>
        <Outlet />
      </main>
      <a href="https://m.me/yourpage" className="fixed-icon messenger" target="_blank" rel="noopener noreferrer" aria-label="Messenger Chat">
        <img src="https://res.cloudinary.com/dpqdfe1al/image/upload/v1706522050/messenger_zyke2c.png" alt="Messenger Icon" />
      </a>
      <footer className="footer">
        <div className="newsletter-section">


        </div>

        <div className="footer-middle">
          {/* Phần nội dung footer */}
          <div className="footer-logo-social">
            <div className="footer-logo">
              <img src="/imgs/Icons/logo.png" alt="Cutexiu" />
            </div>
            <div className="footer-social">
              <h4>THEO DÕI CHÚNG TÔI TRÊN</h4>
              <ul className="social-icons">
                <li><img src="/imgs/Icons/fb(black).png" alt="Facebook" /></li>
                <li><img src="/imgs/Icons/instagram.png" alt="Instagram" /></li>
                <li><img src="/imgs/Icons/tiktok.png" alt="Tiktok" /></li>
              </ul>
              <h4>PHƯƠNG THỨC THANH TOÁN</h4>
              <ul className="payment-icons">
                <li><img src="/imgs/Icons/visa.png" alt="Visa" /></li>
                <li><img src="/imgs/Icons/mastercard.png" alt="Mastercard" /></li>
                <li><img src="/imgs/Icons/momo1.png" alt="COD" /></li>
                <li><img src="/imgs/Icons/tienmat(bank).png" alt="Bank Transfer" /></li>
              </ul>
            </div>
          </div>
          <div className="footer-links">
            <div className="footer-section">
              <h4>VỀ CHÚNG TÔI</h4>
              <ul>
                <li><a href="#">Câu chuyện thương hiệu</a></li>
                <li><a href="#">Liên hệ chúng tôi</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>CHĂM SÓC KHÁCH HÀNG</h4>
              <ul>
                <li><a href="#">Đăng ký tài khoản thành viên</a></li>
                <li><a href="#">Hướng dẫn mua ốp lưng online</a></li>
                <li><a href="#">Quyền lợi thành viên</a></li>
                <li><a href="#">Giao hàng và thanh toán</a></li>
                <li><a href="#">Chính sách đổi hàng</a></li>
                <li><a href="#">Điều khoản mua bán ốp lưng</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>ĐỐI TÁC - LIÊN KẾT</h4>
              <ul>
                <li><a href="#">Ốp lưng Cutexiu</a></li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="footer-divider" />  {/* Đường gạch ngang */}
        <div className="footer-bottom">

          <p>® cutexiu.io.vn thuộc quyền sở hữu của Công ty TNHH Ốp Lưng Cutexiu, được cấp Giấy phép kinh doanh số 0316789123 vào ngày 02/03/2025 bởi Sở Kế hoạch & Đầu tư TP. Hồ Chí Minh.</p>

          <div className="certification-icons">

            <div class="payment">

            </div>
          </div>
        </div>


      </footer>
    </>
  );
};

export default Layout;
