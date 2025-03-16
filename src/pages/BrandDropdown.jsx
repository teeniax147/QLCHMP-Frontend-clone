import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './BrandDropdown.css';
import { API_BASE_URL } from '../config'
const BrandDropdown = ({ title }) => {
  const [brands, setBrands] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/thuong-hieu`);
        if (response.status === 200) {
          const data = response.data?.$values || []; 
          setBrands(data);
        } else {
          console.log("Unexpected response status:", response.status);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu thương hiệu:", error);
      }
    };

    fetchBrands();
  }, []);

  return (
    <div
      className="brand-dropdown"
      onMouseEnter={() => setIsDropdownOpen(true)}
      onMouseLeave={() => setIsDropdownOpen(false)}
    >
      <button className="brand-dropdown-button">{title}</button>
      {isDropdownOpen && (
        <div className="brand-dropdown-content">
          {brands.length > 0 ? (
            brands.map((brand) => (
              <Link to={`/brand/${brand.Id}`} key={brand.Id} className="brand-item">
                <span>{brand.Name}</span>
              </Link>
            ))
          ) : (
            <p>Không có thương hiệu nào.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BrandDropdown;
