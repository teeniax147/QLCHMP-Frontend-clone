import React, { useState, useEffect } from 'react';
import './Home.css'; // Đảm bảo đường dẫn chính xác

const Home = () => {

  const banners = [
  
    '/imgs/banner4.png',
    '/imgs/banner3.png',
      
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
    { name: 'Samsung', image: '/imgs/samsung.png', url: 'https://cutexiu.teeniax.io.vn/brand/1' },
    { name: 'Oppo', image: '/imgs/oppo.png', url: 'https://cutexiu.teeniax.io.vn/brand/2' },
    { name: 'ViVo', image: '/imgs/vivo.png', url: 'https://cutexiu.teeniax.io.vn/brand/3' },
    { name: 'Iphone', image: '/imgs/iphone.png', url: 'https://cutexiu.teeniax.io.vn/brand/4' },
    { name: 'Xiaomi', image: '/imgs/xiaomi.png', url: 'https://cutexiu.teeniax.io.vn/brand/5' }
  ];

  


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

     
   

       
      <div className="banner-container">
        <img src="/imgs/banner.png" alt="Glamour Cosmic with Wonwoo" className="banner-image" />
      </div>

      <div className="store-system-section">
        <h2 className="store-system-title">HỆ THỐNG CỬA HÀNG</h2>
        <div style={{ textAlign: 'center' }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d250777.34031060818!2d106.3932592!3d10.9720623!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752eb81e53f437%3A0xf0197b6c4463227c!2z4buRcCBsxrBuZw!5e0!3m2!1sen!2s!4v1729751745670!5m2!1sen!2s"
            width="90%"
            height="360"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
     
      
    </div>
  );
};
export default Home;


