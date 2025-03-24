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
  Container,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Divider,
  styled,
  alpha,
} from "@mui/material";
import { API_BASE_URL } from '../config';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ArticleIcon from '@mui/icons-material/Article';

// Styled components for enhanced visual presentation
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(3),
  borderRadius: 12,
  overflow: 'hidden',
  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
}));

const HeaderTableCell = styled(TableCell)(({ theme }) => ({
  textAlign: "center",
  fontWeight: "600",
  fontSize: "16px",
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2),
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: alpha(theme.palette.primary.light, 0.05),
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.light, 0.1),
    transition: 'all 0.2s ease',
  },
  transition: 'all 0.2s ease',
}));

const BodyTableCell = styled(TableCell)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(2),
  fontSize: '15px',
}));

const ActionButtonsCell = styled(TableCell)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(1),
}));

const StyledButton = styled(Button)(({ theme, customvariant }) => ({
  borderRadius: 8,
  padding: '8px 16px',
  fontWeight: 500,
  textTransform: 'none',
  boxShadow: 'none',
  transition: 'all 0.2s ease',

  ...(customvariant === "add" && {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.success.dark,
      boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`,
    },
  }),
  ...(customvariant === "edit" && {
    color: theme.palette.primary.main,
    border: `1px solid ${theme.palette.primary.main}`,
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.05),
    },
  }),
  ...(customvariant === "delete" && {
    color: theme.palette.error.main,
    border: `1px solid ${theme.palette.error.main}`,
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: alpha(theme.palette.error.main, 0.05),
    },
  }),
  ...(customvariant === "save" && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
    },
  }),
  ...(customvariant === "cancel" && {
    color: theme.palette.error.main,
    border: `1px solid ${theme.palette.error.main}`,
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: alpha(theme.palette.error.main, 0.05),
    },
  }),
  '&:focus': {
    outline: "none",
  },
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.8rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  '& svg': {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  }
}));

const ModalPaper = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  maxHeight: '80vh',
  overflow: 'auto',
  backgroundColor: theme.palette.background.paper,
  borderRadius: 12,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
  padding: theme.spacing(4),
}));

const ModalTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.4rem',
  fontWeight: 600,
  color: theme.palette.primary.main,
  textAlign: 'center',
  marginBottom: theme.spacing(3),
}));

const ImagePreview = styled('img')(({ theme }) => ({
  width: '100%',
  height: 200,
  objectFit: 'cover',
  borderRadius: 8,
  marginBottom: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
}));

const BlogImageCell = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '& img': {
    width: 120,
    height: 70,
    objectFit: 'cover',
    borderRadius: 4,
    border: `1px solid ${theme.palette.divider}`,
    transition: 'transform 0.2s ease',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
}));

const BlogManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/beauty-blog`, {
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
          ? `https://api.cutexiu.teeniax.io.vn/${blog.FeaturedImage}`
          : null,
        createdAt: blog.CreatedAt || "",
        updatedAt: blog.UpdatedAt || "",
      }));
      setBlogs(cleanedData);
    } catch (err) {
      console.error("Lỗi khi tải danh sách bài viết:", err.response?.data || err.message);
      setErrorMessage("Không thể tải danh sách bài viết. Vui lòng thử lại sau.");
      setTimeout(() => setErrorMessage(""), 5000);
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
      setPreviewImage(blog.featuredImage || null);
    } else {
      setCurrentBlog({
        title: "",
        content: "",
        author: "",
        categoryId: "",
        featuredImage: null,
      });
      setPreviewImage(null);
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setCurrentBlog(null);
    setPreviewImage(null);
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
          `${API_BASE_URL}/beauty-blog/cap-nhat/${currentBlog.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setSuccessMessage("Cập nhật bài viết thành công!");
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        // Thêm mới bài viết
        await axios.post(`${API_BASE_URL}/beauty-blog/them-moi`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setSuccessMessage("Thêm bài viết mới thành công!");
        setTimeout(() => setSuccessMessage(""), 5000);
      }

      fetchBlogs();
      handleCloseModal();
    } catch (err) {
      console.error("Lỗi khi lưu bài viết:", err.response?.data || err.message);
      setErrorMessage(`Đã xảy ra lỗi: ${err.response?.data?.Message || err.message}`);
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCurrentBlog({ ...currentBlog, featuredImage: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleDeleteBlog = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa bài viết này?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_BASE_URL}/beauty-blog/xoa/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSuccessMessage("Xóa bài viết thành công!");
        setTimeout(() => setSuccessMessage(""), 5000);
        fetchBlogs();
      } catch (err) {
        console.error("Lỗi khi xóa bài viết:", err.response?.data || err.message);
        setErrorMessage(`Đã xảy ra lỗi: ${err.response?.data?.Message || err.message}`);
        setTimeout(() => setErrorMessage(""), 5000);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <PageTitle variant="h4">
          <ArticleIcon fontSize="large" />
          Danh Sách Bài Viết
        </PageTitle>
        <StyledButton
          customvariant="add"
          startIcon={<AddCircleIcon />}
          onClick={() => handleOpenModal()}
          size="large"
        >
          Thêm bài viết mới
        </StyledButton>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Alerts */}
      {successMessage && (
        <Alert
          severity="success"
          variant="filled"
          sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}
          onClose={() => setSuccessMessage("")}
        >
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert
          severity="error"
          variant="filled"
          sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}
          onClose={() => setErrorMessage("")}
        >
          {errorMessage}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={5}>
          <CircularProgress />
          <Typography ml={2} variant="body1" color="text.secondary">
            Đang tải danh sách bài viết...
          </Typography>
        </Box>
      ) : (
        <StyledTableContainer component={Paper}>
          <Table>
            <StyledTableHead>
              <TableRow>
                <HeaderTableCell>STT</HeaderTableCell>
                <HeaderTableCell>Tiêu đề</HeaderTableCell>
                <HeaderTableCell>Tác giả</HeaderTableCell>
                <HeaderTableCell>Hình ảnh</HeaderTableCell>
                <HeaderTableCell>Hành động</HeaderTableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {blogs.length > 0 ? (
                blogs.map((blog, index) => (
                  <StyledTableRow key={blog.id}>
                    <BodyTableCell>{index + 1}</BodyTableCell>
                    <BodyTableCell>
                      <Typography fontWeight={500}>{blog.title}</Typography>
                    </BodyTableCell>
                    <BodyTableCell>{blog.author}</BodyTableCell>
                    <BodyTableCell>
                      <BlogImageCell>
                        {blog.featuredImage ? (
                          <img
                            src={blog.featuredImage}
                            alt="Hình ảnh bài viết"
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">Không có hình ảnh</Typography>
                        )}
                      </BlogImageCell>
                    </BodyTableCell>
                    <ActionButtonsCell>
                      <Box display="flex" justifyContent="center" gap={1}>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenModal(blog)}
                            sx={{
                              border: '1px solid',
                              borderColor: 'primary.light',
                              '&:hover': { backgroundColor: 'primary.lighter' }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteBlog(blog.id)}
                            sx={{
                              border: '1px solid',
                              borderColor: 'error.light',
                              '&:hover': { backgroundColor: 'error.lighter' }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ActionButtonsCell>
                  </StyledTableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: "center", padding: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      Không có bài viết nào.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </StyledTableContainer>
      )}

      {/* Modal for Adding/Editing Blog */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="blog-modal-title"
      >
        <ModalPaper>
          <ModalTitle id="blog-modal-title">
            {currentBlog?.id ? "Cập nhật bài viết" : "Thêm bài viết mới"}
          </ModalTitle>
          <TextField
            fullWidth
            label="Tiêu đề"
            variant="outlined"
            value={currentBlog?.title || ""}
            onChange={(e) => setCurrentBlog({ ...currentBlog, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Nội dung"
            multiline
            rows={4}
            variant="outlined"
            value={currentBlog?.content || ""}
            onChange={(e) => setCurrentBlog({ ...currentBlog, content: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Tác giả"
            variant="outlined"
            value={currentBlog?.author || ""}
            onChange={(e) => setCurrentBlog({ ...currentBlog, author: e.target.value })}
            sx={{ mb: 2 }}
          />

          {previewImage && (
            <ImagePreview
              src={previewImage}
              alt="Hình ảnh xem trước"
            />
          )}

          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Hình ảnh bài viết
          </Typography>
          <TextField
            fullWidth
            type="file"
            InputProps={{
              sx: { mb: 3 }
            }}
            onChange={handleImageChange}
          />

          <Box display="flex" gap={2} mt={2}>
            <StyledButton
              customvariant="save"
              onClick={handleSaveBlog}
              fullWidth
            >
              Lưu
            </StyledButton>
            <StyledButton
              customvariant="cancel"
              onClick={handleCloseModal}
              fullWidth
            >
              Hủy
            </StyledButton>
          </Box>
        </ModalPaper>
      </Modal>
    </Container>
  );
};

export default BlogManager;