import React, { useState, useEffect } from 'react';
import './Home.css'; // Đảm bảo đường dẫn chính xác
import { Link } from 'react-router-dom';
const Home = () => {

  const banners = [
    '/imgs/Icons/banner.png',
    '/imgs/Icons/banner 2.png',
    '/imgs/Icons/banner 3.jpg'
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex(currentIndex === banners.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const openModal = (product) => {
    setSelectedProduct(product); // Đặt sản phẩm đã chọn cho modal
  };

  const closeModal = () => {
    setSelectedProduct(null); // Đóng modal bằng cách đặt sản phẩm thành null
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 3000); // 3 giây
    return () => clearInterval(interval);
  }, [currentIndex]);

  const nextIndex = currentIndex === banners.length - 1 ? 0 : currentIndex + 1;

  const brands = [
    { name: 'Yehwadam', image: '/imgs/brand1.png', url: 'http://localhost:5173/brand/2' },
    { name: 'Freshian', image: '/imgs/brand2.png', url: 'http://localhost:5173/brand/1' },
    { name: 'FMGT', image: '/imgs/brand3.png', url: 'http://localhost:5173/brand/4' },
    { name: 'Belif', image: '/imgs/brand4.png', url: 'http://localhost:5173/brand/5' },
  ];

  // Danh sách sản phẩm mẫu cho "Sản Phẩm Nổi Bật"
  const featuredProducts = [
    {
      id: 1,
      brand: 'GLAMOUR COSMIC',
      name: 'Sữa Tắm GLAMOUR SHOP Dạng Gel Hương Nước Hoa Perfume',
      price: '559,000₫',
      originalPrice: '908,000₫',
      discount: '-38%',
      label: '1+1',
      rating: 5,
      reviews: 17,
      image: 'https://image.hsv-tech.io/0x1200/tfs/common/44a504e0-330d-4505-91c8-de9438367676.webp',
    },
    {
      id: 2,
      brand: 'GLAMOUR COSMIC',
      name: 'Gel Tắm GLAMOUR SHOP Cung Cấp Ẩm Avocado Body Wash',
      price: '349,000₫',
      rating: 5,
      reviews: 15,
      image: 'https://image.hsv-tech.io/0x1987/tfs/common/52e55050-072f-4662-a7a5-0c2d64e98695.webp',
    },
    {
      id: 3,
      brand: 'GLAMOUR COSMIC',
      name: 'KEM DƯỠNG Da Tay GLAMOUR SHOP Thật',
      price: '139,000₫',
      rating: 4,
      reviews: 116,
      image: 'https://image.hsv-tech.io/0x1987/tfs/common/404a9c8f-76b9-43fe-ab12-ca6c49b9e806.webp',
    },
    {
      id: 4,
      brand: 'GLAMOUR COSMIC',
      name: 'Tẩy Tế Bào...Body Peeling 300ML',
      price: '649,000₫',
      originalPrice: '989,000₫',
      discount: '-34%',
      rating: 5,
      reviews: 7,
      image: 'https://image.hsv-tech.io/0x1987/tfs/common/5e355e2e-de19-46fa-b1ff-d416544826ee.webp',
    },
    {
      id: 5,
      brand: 'GLAMOUR COSMIC',
      name: 'Dung Dịch Vệ Sinh Phụ Nữ Yehwadam ',
      price: '699,000₫',
      originalPrice: '1,048,000₫',
      discount: '-33%',
      rating: 5,
      reviews: 9,
      image: 'https://image.hsv-tech.io/0x1987/tfs/common/db845ba9-465f-4a63-9314-074be209bb75.webp',
    },
    {
      id: 6,
      brand: 'GLAMOUR COSMIC',
      name: 'Sữa Dưỡng Thể GLAMOUR SHOP Cung Cấp Ẩm Avocado Body...',
      price: '349,000₫',
      rating: 5,
      reviews: 8,
      image: 'https://image.hsv-tech.io/0x1987/tfs/common/df7ebc1c-4a43-4522-a0ab-a1eefa2d93d2.webp',
    },
    {
      id: 7,
      brand: 'GLAMOUR COSMIC',
      name: 'Xịt Dưỡng Thể Hương Nước Hoa GLAMOUR SHOP Nature Garden...',
      price: '439,000₫',
      originalPrice: '788,000₫',
      discount: '-44%',
      rating: 4,
      reviews: 0,
      image: 'https://image.hsv-tech.io/400x0/tfs/common/b8dfd59f-4fd0-49bc-895a-25a4daf4dd27.webp',
    },
    {
      id: 8,
      brand: 'GLAMOUR COSMIC',
      name: 'Sữa Dưỡng Thể Dưỡng Ẩm Cho Da Nhạy Cảm Dr. Belmeur Mild...',
      price: '979,000₫',
      rating: 5,
      reviews: 3,
      image: 'https://image.hsv-tech.io/400x0/tfs/products/65d2fecf-d589-4f46-bc4a-5d4177a11d60.webp',
    },
    {
      id: 9,
      brand: 'GLAMOUR COSMIC',
      name: 'Combo 2 Kem chống nắng đa năng GLAMOUR Natural...',
      price: '550,000₫',
      rating: 5,
      reviews: 3,
      image: 'https://image.hsv-tech.io/0x1987/tfs/common/8eb45545-3cf7-41e2-aa1a-ac575c6c7ea5.webp',
    },
    {
      id: 10,
      brand: 'GLAMOUR COSMIC',
      name: 'Sữa Dưỡng GLAMOUR SHOP Trắng Da White Seed ...',
      price: '425,000₫',
      originalPrice: '788,000₫',
      discount: '-44%',
      rating: 4,
      reviews: 0,
      image: 'https://image.hsv-tech.io/0x1987/tfs/common/1fa6c774-3203-4430-893f-396fef0373c4.webp',
    },

  ];
  const skinConditions = ["Da hỗn hợp", "Da nhạy cảm", "Da khô", "Da thường", "Da dầu"];
  const priceRanges = ["Dưới 500.000", "500.000 - 1.000.000", "1.500.000 - 2.000.000", "Trên 2.000.000"];
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);

  const handleConditionChange = (condition) => {
    setSelectedConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]
    );
  };

  const handlePriceChange = (range) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );
  };

  const filteredProducts = featuredProducts.filter((product) => {
    const matchesCondition = !selectedConditions.length || selectedConditions.includes(product.condition);
    const matchesPriceRange = !selectedPriceRanges.length || selectedPriceRanges.includes(product.priceRange);
    return matchesCondition && matchesPriceRange;
  });


  const productsBySkinCondition = [
    {
      id: 4,
      brand: 'GLAMOUR COSMIC',
      name: 'Tẩy Tế Bào...Body Peeling 300ML',
      price: '649,000₫',
      originalPrice: '989,000₫',
      discount: '-34%',
      rating: 5,
      reviews: 7,
      image: 'https://image.hsv-tech.io/0x1987/tfs/common/5e355e2e-de19-46fa-b1ff-d416544826ee.webp',
    },
    {
      id: 6,
      brand: 'GLAMOUR COSMIC',
      name: 'Sữa Dưỡng Thể GLAMOUR SHOP Cung Cấp Ẩm Avocado Body...',
      price: '349,000₫',
      rating: 5,
      reviews: 8,
      image: 'https://image.hsv-tech.io/0x1987/tfs/common/df7ebc1c-4a43-4522-a0ab-a1eefa2d93d2.webp',
    },
    {
      id: 7,
      brand: 'GLAMOUR COSMIC',
      name: 'Xịt Dưỡng Thể Hương Nước Hoa GLAMOUR SHOP Nature Garden...',
      price: '439,000₫',
      originalPrice: '788,000₫',
      discount: '-44%',
      rating: 4,
      reviews: 0,
      image: 'https://image.hsv-tech.io/400x0/tfs/common/b8dfd59f-4fd0-49bc-895a-25a4daf4dd27.webp',
    },
    {
      id: 8,
      brand: 'GLAMOUR COSMIC',
      name: 'Sữa Dưỡng Thể Dưỡng Ẩm Cho Da Nhạy Cảm Dr. Belmeur Mild...',
      price: '979,000₫',
      rating: 5,
      reviews: 3,
      image: 'https://image.hsv-tech.io/400x0/tfs/products/65d2fecf-d589-4f46-bc4a-5d4177a11d60.webp',
    },
    {
      id: 9,
      brand: 'GLAMOUR COSMIC',
      name: 'Combo 2 Kem chống nắng đa năng GLAMOUR Natural...',
      price: '550,000₫',
      rating: 5,
      reviews: 3,
      image: 'https://image.hsv-tech.io/0x1987/tfs/common/8eb45545-3cf7-41e2-aa1a-ac575c6c7ea5.webp',
    },
    {
      id: 10,
      brand: 'GLAMOUR COSMIC',
      name: 'Sữa Dưỡng GLAMOUR SHOP Trắng Da White Seed ...',
      price: '425,000₫',
      originalPrice: '788,000₫',
      discount: '-44%',
      rating: 4,
      reviews: 0,
      image: 'https://image.hsv-tech.io/0x1987/tfs/common/1fa6c774-3203-4430-893f-396fef0373c4.webp',
    },
    {
      id: 11,
      brand: 'GLAMOUR COSMIC',
      name: 'Sữa Tắm GLAMOUR SHOP Dạng Gel Hương Nước Hoa Perfume',
      price: '559,000₫',
      originalPrice: '908,000₫',
      discount: '-38%',
      label: '1+1',
      rating: 5,
      reviews: 17,
      image: 'https://image.hsv-tech.io/0x1200/tfs/common/44a504e0-330d-4505-91c8-de9438367676.webp',
    },
    {
      id: 12,
      brand: 'GLAMOUR COSMIC',
      name: 'Gel Tắm GLAMOUR SHOP Cung Cấp Ẩm Avocado Body Wash',
      price: '349,000₫',
      rating: 5,
      reviews: 15,
      image: 'https://image.hsv-tech.io/0x1987/tfs/common/52e55050-072f-4662-a7a5-0c2d64e98695.webp',
    }
  ];


  return (
    <div>
      {/* Carousel Section */}
      <div className="carousel-container">
        <div className="carousel-slide">
          <img src={banners[currentIndex]} alt="Banner hiện tại" className="carousel-image" />
          <img src={banners[nextIndex]} alt="Slide tiếp theo" className="carousel-next" />
        </div>
        <button className="carousel-arrow left-arrow" onClick={() => goToSlide(currentIndex === 0 ? banners.length - 1 : currentIndex - 1)}>
          &#10094;
        </button>
        <button className="carousel-arrow right-arrow" onClick={nextSlide}>
          &#10095;
        </button>
        <div className="carousel-dots">
          {banners.map((_, index) => (
            <span
              key={index}
              className={currentIndex === index ? 'dot active' : 'dot'}
              onClick={() => goToSlide(index)}
            ></span>
          ))}
        </div>
      </div>

      {/* Brand Section */}
      <div className="brand-section">
        {brands.map((brand) => (
          <a href={brand.url} key={brand.name} className="brand-link">
            <img src={brand.image} alt={brand.name} className="brand-image" />
          </a>
        ))}
      </div>

      {/* Featured Products Section */}
      <div className="featured-products-section">
        <h2 className="featured-products-title">SẢN PHẨM NỔI BẬT</h2>
        <div className="category-options">
          <span className="category-active">Chăm sóc da</span>
          <span className="category-inactive">Trang điểm</span>
        </div>

        <div className="featured-product-list">
          {featuredProducts.map((product) => (
            <div className="featured-product-card" key={product.id}>
              {product.discount && <div className="badge">{product.discount}</div>}
              <img src={product.image} alt={product.name} className="product-image" />
              <div className="product-brand">{product.brand}</div> {/* Đặt thương hiệu dưới hình ảnh */}
              <h3 className="product-title">{product.name}</h3>
              <div className="price-section">
                {product.originalPrice && <span className="original-price">{product.originalPrice}</span>}
                <span className="discounted-price">{product.price}</span>
              </div>
              <div className="rating">
                {'★'.repeat(product.rating)}
                <span className="reviews">({product.reviews})</span>
              </div>
            </div>
          ))}
        </div>

        <Link to="/all-products">
          <button className="view-all-button">Xem tất cả</button>
        </Link>



      </div>

      <div className="banner-container">
        <img src="/imgs/Icons/hinh2.png" alt="Glamour Cosmic with Wonwoo" className="banner-image" />
      </div>

      <div className="store-system-section">
        <h2 className="store-system-title">HỆ THỐNG CỬA HÀNG</h2>
        <div style={{ textAlign: 'center' }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d250777.34031060818!2d106.51015613303696!3d10.857459659408756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752750d246dd27%3A0xd1ba38d047f69e73!2sC%C3%94NG%20TY%20GLAMOUR%20COMESTIC!5e0!3m2!1sen!2s!4v1729751745670!5m2!1sen!2s"
            width="90%"
            height="360"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
      <a href="https://m.me/yourpage" className="fixed-icon messenger" target="_blank" aria-label="Messenger Chat">
        <img src="https://res.cloudinary.com/dpqdfe1al/image/upload/v1706522050/messenger_zyke2c.png" alt="Messenger Icon" />
      </a>
      <a href="https://zalo.me/yourpage" className="fixed-icon zalo" target="_blank" aria-label="Zalo Chat">
        <img src="https://page.widget.zalo.me/static/images/2.0/Logo.svg" alt="Zalo Icon" />
      </a>
    </div>
  );
};
export default Home;


