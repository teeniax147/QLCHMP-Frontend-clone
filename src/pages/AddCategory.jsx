import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AddCategory.css";
import { API_BASE_URL } from "../config";  // Đảm bảo import chính xác

const AddCategory = () => {
  const [category, setCategory] = useState({ Name: "", Description: "", ParentId: null });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Hàm xử lý danh mục lồng nhau
  const flattenNestedCategories = (categories, level = 0, parentKey = "") => {
    let flatList = [];
    categories.forEach((category, index) => {
      if (category?.Name && category?.InverseParent?.$values?.length > 0) {
        // Chỉ thêm danh mục nếu có danh mục con
        const uniqueKey = `${parentKey}-${category.Id || "no-id"}-${index}`;
        flatList.push({
          Id: category?.Id || uniqueKey,
          Name: `${"-".repeat(level)} ${category.Name}`,
        });

        // Xử lý tiếp danh mục con
        flatList = flatList.concat(
          flattenNestedCategories(category.InverseParent.$values, level + 1, uniqueKey)
        );
      }
    });
    return flatList;
  };

  // Lấy danh mục cha từ API
  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token không tồn tại.");
        }
        const response = await axios.get(`${API_BASE_URL}/Categories`, {  // Đổi dấu " thành ` cho template string
          headers: { Authorization: `Bearer ${token}` },
        });
        const flatCategories = flattenNestedCategories(response.data.$values || []);
        setCategories(flatCategories);
      } catch (err) {
        setError("Không thể tải danh mục cha.");
      }
    };

    fetchParentCategories();
  }, []);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategory({ ...category, [name]: value });
  };

  // Gửi dữ liệu lên API
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token không tồn tại.");
      }
      await axios.post(`${API_BASE_URL}/Categories`, category, {  // Đổi dấu " thành ` cho template string
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      alert("Thêm danh mục thành công!");
      navigate("/admin/categories"); // Điều hướng về danh sách danh mục
    } catch (err) {
      setError("Lỗi khi thêm danh mục. Vui lòng thử lại.");
    }
  };

  return (
    <div className="add-category-container">
      <h1 className="add-category-title">Thêm Danh Mục</h1>
      <form onSubmit={handleSubmit}>
        <label className="add-category-label">Tên danh mục:</label>
        <input
          type="text"
          name="Name"
          value={category.Name}
          onChange={handleChange}
          required
          className="add-category-input"
        />
        <label className="add-category-label">Mô tả:</label>
        <textarea
          name="Description"
          value={category.Description}
          onChange={handleChange}
          className="add-category-textarea"
        />
        <label className="add-category-label">Danh mục cha:</label>
        <select
          name="ParentId"
          value={category.ParentId || ""}
          onChange={handleChange}
          className="add-category-select"
        >
          <option value="">-- Không có --</option>
          {categories.map((parent) => (
            <option key={parent.Id} value={parent.Id}>
              {parent.Name}
            </option>
          ))}
        </select>
        {error && <p className="add-category-error">{error}</p>}
        <button type="submit" className="add-category-btn-submit">
          Thêm
        </button>
        <button
          type="button"
          className="add-category-btn-cancel"
          onClick={() => navigate("/admin/categories")}
        >
          Hủy
        </button>
      </form>
    </div>
  );
};

export default AddCategory;
