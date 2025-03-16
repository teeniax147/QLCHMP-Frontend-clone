import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Typography,
  Modal,
  Box,
} from "@mui/material";
import { API_BASE_URL } from '../config';

const BlogManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null); // State để lưu ảnh xem trước

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/beauty-blog`, {  // Sửa từ '${API_BASE_URL}/beauty-blog' thành `${API_BASE_URL}/beauty-blog`
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const blogsData = response.data.Blogs?.$values || [];
      const cleanedData = blogsData.map((blog) => ({
        id: blog.Id,
        title: blog.Title || "Không có tiêu đề",
        content: blog.Content || "Không có nội dung",
        author: blog.Author || "Không có tác giả",
        category: blog.Category?.Name || "Không có danh mục",
        featuredImage: blog.FeaturedImage
          ? `https://api.glamour.io.vn${blog.FeaturedImage}`
          : null,
        createdAt: blog.CreatedAt || "",
        updatedAt: blog.UpdatedAt || "",
      }));
      setBlogs(cleanedData);
    } catch (err) {
      console.error("Lỗi khi tải danh sách bài viết:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleOpenModal = (blog = null) => {
    if (blog) {
      setCurrentBlog({
        id: blog.id,
        title: blog.title,
        content: blog.content,
        author: blog.author,
        categoryId: blog.categoryId,
        featuredImage: blog.featuredImage,
      });
      setPreviewImage(blog.featuredImage || null); // Hiển thị ảnh hiện tại
    } else {
      setCurrentBlog({
        title: "",
        content: "",
        author: "",
        categoryId: "",
        featuredImage: null,
      });
      setPreviewImage(null); // Không có ảnh
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setCurrentBlog(null);
    setPreviewImage(null); // Reset preview
    setOpenModal(false);
  };

  const handleSaveBlog = async () => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("Title", currentBlog.title || "");
      formData.append("Content", currentBlog.content || "");
      formData.append("Author", currentBlog.author || "");
      formData.append("CategoryId", currentBlog.categoryId || "");

      if (currentBlog.featuredImage instanceof File) {
        formData.append("FeaturedImage", currentBlog.featuredImage);
      }

      if (currentBlog.id) {
        // Cập nhật bài viết
        await axios.put(
          `${API_BASE_URL}/beauty-blog/cap-nhat/${currentBlog.id}`,  // Sửa từ '${API_BASE_URL}/beauty-blog/cap-nhat/${currentBlog.id}' thành `${API_BASE_URL}/beauty-blog/cap-nhat/${currentBlog.id}`
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        alert("Cập nhật bài viết thành công!");
      } else {
        // Thêm mới bài viết
        await axios.post(`${API_BASE_URL}/beauty-blog/them-moi`, formData, {  // Sửa từ '${API_BASE_URL}/beauty-blog/them-moi' thành `${API_BASE_URL}/beauty-blog/them-moi`
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Thêm bài viết mới thành công!");
      }

      fetchBlogs();
      handleCloseModal();
    } catch (err) {
      console.error("Lỗi khi lưu bài viết:", err.response?.data || err.message);
      alert(`Đã xảy ra lỗi: ${err.response?.data?.Message || err.message}`);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCurrentBlog({ ...currentBlog, featuredImage: file });
      setPreviewImage(URL.createObjectURL(file)); // Tạo URL tạm thời cho ảnh
    }
  };

  const handleDeleteBlog = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa bài viết này?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_BASE_URL}/beauty-blog/xoa/${id}`, {  // Sửa từ '${API_BASE_URL}/beauty-blog/xoa/${id}' thành `${API_BASE_URL}/beauty-blog/xoa/${id}`
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert("Xóa bài viết thành công!");
        fetchBlogs(); // Tải lại danh sách bài viết
      } catch (err) {
        console.error("Lỗi khi xóa bài viết:", err.response?.data || err.message);
        alert(`Đã xảy ra lỗi: ${err.response?.data?.Message || err.message}`);
      }
    }
  };

  return (
    <div style={{ margin: "20px", marginTop: "40px", marginBottom: "20px" }}>
      <Typography variant="h4" align="center" gutterBottom>
        Danh Sách Bài Viết
      </Typography>
      {loading && (
        <Typography variant="body1" align="center" gutterBottom>
          Đang tải dữ liệu...
        </Typography>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleOpenModal()}
        style={{ marginBottom: "20px" }}
      >
        Thêm bài viết mới
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center" style={{ fontWeight: "bold" }}>STT</TableCell>
              <TableCell align="center" style={{ fontWeight: "bold" }}>Tiêu đề</TableCell>
              <TableCell align="center" style={{ fontWeight: "bold" }}>Tác giả</TableCell>
              <TableCell align="center" style={{ fontWeight: "bold" }}>Hình ảnh</TableCell>
              <TableCell align="center" style={{ fontWeight: "bold" }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {blogs.length > 0 ? (
              blogs.map((blog, index) => (
                <TableRow key={blog.id}>
                  <TableCell align="center">{index + 1}</TableCell>
                  <TableCell align="center">{blog.title}</TableCell>
                  <TableCell align="center">{blog.author}</TableCell>
                  <TableCell align="center">
                    {blog.featuredImage ? (
                      <img
                        src={blog.featuredImage}
                        alt="Hình ảnh"
                        style={{ width: "100px", height: "50px", objectFit: "cover" }}
                      />
                    ) : (
                      "Không có hình ảnh"
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleOpenModal(blog)}
                      style={{ marginRight: "10px" }}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteBlog(blog.id)}
                    >
                      Xóa
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Không có bài viết nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            width: 400,
            maxHeight: "70vh", // Giới hạn chiều cao modal
        
            bgcolor: "background.paper",
            p: 3,
            borderRadius: 2,
            boxShadow: 24,
            mx: "auto",
            mt: "10%",
          }}
        >
          <Typography variant="h6" align="center" gutterBottom>
            {currentBlog?.id ? "Cập nhật bài viết" : "Thêm bài viết mới"}
          </Typography>
          <TextField
            fullWidth
            label="Tiêu đề"
            value={currentBlog?.title || ""}
            onChange={(e) => setCurrentBlog({ ...currentBlog, title: e.target.value })}
            style={{ marginBottom: "10px" }}
          />
          <TextField
            fullWidth
            label="Nội dung"
            multiline
            rows={4}
            value={currentBlog?.content || ""}
            onChange={(e) => setCurrentBlog({ ...currentBlog, content: e.target.value })}
            style={{ marginBottom: "10px" }}
          />
          <TextField
            fullWidth
            label="Tác giả"
            value={currentBlog?.author || ""}
            onChange={(e) => setCurrentBlog({ ...currentBlog, author: e.target.value })}
            style={{ marginBottom: "10px" }}
          />
          {previewImage && (
            <img
              src={previewImage}
              alt="Hình ảnh xem trước"
              style={{ width: "30%", height: "auto", marginBottom: "10px", borderRadius: "5px" }}
            />
          )}
          <TextField
            fullWidth
            type="file"
            onChange={handleImageChange}
            style={{ marginBottom: "10px" }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveBlog}
            fullWidth
            style={{ marginBottom: "10px" }}
          >
            Lưu
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleCloseModal}
            fullWidth
          >
            Hủy
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default BlogManager;
