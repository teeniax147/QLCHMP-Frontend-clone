import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import './BeautyBlog.css';

const BeautyBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/beauty-blog`);  // Sửa từ '${API_BASE_URL}/beauty-blog' thành `${API_BASE_URL}/beauty-blog`
        const fullBlogs = response.data.Blogs?.$values || [];
        const cleanedBlogs = fullBlogs.map((blog) => ({
          id: blog.Id,
          title: blog.Title || "Tiêu đề không có sẵn",
          content: blog.Content || "Nội dung không có sẵn",
          author: blog.Author || "Không rõ",
          featuredImage: blog.FeaturedImage
            ? `https://api.glamour.io.vn/${blog.FeaturedImage}`
            : "default-image.jpg",
        }));
        setBlogs(cleanedBlogs);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải bài viết. Vui lòng thử lại.");
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p>{error}</p>;

  const featuredBlog = blogs.length > 0 ? blogs[0] : null;
  const otherBlogs = blogs.slice(1);

  return (
    <div className="beauty-blog-contained">
      <div className="beauty-header">
        <h1>Chuyên Mục Làm Đẹp</h1>
      </div>

      {featuredBlog && (
        <div className="beauty-featured-section">
          <div className="beauty-featured-blog">
            <img
              src={featuredBlog.featuredImage}
              alt={featuredBlog.title}
              className="beauty-featured-image"
            />
            <div className="beauty-featured-content">
              <h2>{featuredBlog.title}</h2>
              <p>{featuredBlog.content.substring(0, 150)}...</p>
              <p>Tác giả: {featuredBlog.author}</p>
            </div>
          </div>
        </div>
      )}

      <div className="beauty-other-blogs">
        {otherBlogs.map((blog) => (
          <div key={blog.id} className="beauty-blog-item">
            <img
              src={blog.featuredImage}
              alt={blog.title || "Hình ảnh không có sẵn"}
              className="beauty-blog-image"
            />
            <div className="beauty-blog-content">
              <h3>{blog.title}</h3>
              <p>{blog.content.substring(0, 80)}...</p>
              <p className="beauty-category">Góc Review</p>
              <p>Tác giả: {blog.author}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BeautyBlog;
