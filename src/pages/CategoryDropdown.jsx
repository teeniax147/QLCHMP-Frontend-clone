import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './CategoryDropdown.css';
import { API_BASE_URL } from '../config'
const CategoryDropdown = ({ title, parentId }) => {
    const [categories, setCategories] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/Categories`);
                const data = response.data.$values || [];
                console.log("Danh mục từ API:", data); // Kiểm tra dữ liệu trong console

                const parentCategory = data.find(category => category.Id === parentId);
                if (parentCategory && parentCategory.InverseParent) {
                    setCategories(parentCategory.InverseParent.$values);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, [parentId]);

    // Hàm xử lý điều hướng đến sản phẩm theo danh mục
    const handleCategoryClick = (categoryId) => {
        navigate(`/products/${categoryId}`); // Điều hướng đến trang hiển thị sản phẩm theo danh mục
    };

    return (
        <div
            className="dropdown"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
        >
            <button className="dropdown-button">{title}</button>
            {isDropdownOpen && (
                <div className="dropdown-content">
                    {categories.map((category) => (
                        <div key={category.Id} className="category-group">
                            <h4 onClick={() => handleCategoryClick(category.Id)} style={{ cursor: 'pointer' }}>
                                {category.Name}
                            </h4>
                            {category.InverseParent && category.InverseParent.$values.length > 0 ? (
                                <ul>
                                    {category.InverseParent.$values.map((subCategory) => (
                                        <li key={subCategory.Id}>
                                            <Link to={`/products/${subCategory.Id}`}>{subCategory.Name}</Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No subcategories available</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryDropdown;
