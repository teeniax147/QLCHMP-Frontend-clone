import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  styled,
  Modal,
  Box,
  TextField,
  Typography,
  Paper,
  Container,
  IconButton,
  Chip,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  alpha,
  ListItemText,
  Checkbox,
  OutlinedInput,
  Tooltip,
} from "@mui/material";
import { API_BASE_URL } from '../config';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import PhotoIcon from '@mui/icons-material/Photo';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermark';
import DescriptionIcon from '@mui/icons-material/Description';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Styled Components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 12,
  overflow: 'hidden',
  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
  marginTop: theme.spacing(3),
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: '#e91e63',
}));

const HeaderTableCell = styled(TableCell)(({ theme }) => ({
  textAlign: "center",
  fontWeight: "600",
  fontSize: "15px",
  color: "white",
  padding: theme.spacing(1.5),
  whiteSpace: 'nowrap',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: alpha('#e91e63', 0.05),
  },
  '&:hover': {
    backgroundColor: alpha('#e91e63', 0.1),
    transition: 'all 0.2s ease',
  },
  transition: 'all 0.2s ease',
}));

const BodyTableCell = styled(TableCell)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(1.5),
  fontSize: '14px',
}));

const ActionButtonsCell = styled(TableCell)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(1),
  whiteSpace: 'nowrap',
}));

const StyledButton = styled(Button)(({ theme, customvariant }) => ({
  borderRadius: 8,
  padding: '8px 16px',
  fontWeight: 500,
  textTransform: 'none',
  boxShadow: 'none',
  transition: 'all 0.2s ease',

  ...(customvariant === "add" && {
    backgroundColor: '#e91e63',
    color: 'white',
    '&:hover': {
      backgroundColor: '#c2185b',
      boxShadow: `0 4px 12px ${alpha('#e91e63', 0.3)}`,
    },
  }),
  ...(customvariant === "edit" && {
    color: '#e91e63',
    border: `1px solid #e91e63`,
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: alpha('#e91e63', 0.05),
    },
  }),
  ...(customvariant === "delete" && {
    color: '#e91e63',
    border: `1px solid #e91e63`,
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: alpha('#e91e63', 0.05),
    },
  }),
  ...(customvariant === "save" && {
    backgroundColor: '#e91e63',
    color: 'white',
    '&:hover': {
      backgroundColor: '#c2185b',
      boxShadow: `0 4px 12px ${alpha('#e91e63', 0.3)}`,
    },
  }),
  ...(customvariant === "cancel" && {
    color: '#9e9e9e',
    border: `1px solid #9e9e9e`,
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: alpha('#9e9e9e', 0.05),
    },
  }),
  '&:focus': {
    outline: "none",
  },
}));

const StyledDialogContent = styled(Box)(({ theme }) => ({
  maxHeight: '60vh',
  overflowY: 'auto',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
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
    color: '#e91e63',
  }
}));

const FormSectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  '& svg': {
    marginRight: theme.spacing(1),
    color: '#e91e63',
  }
}));

const ImagePreviewContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(2),
  textAlign: 'center',
  '& img': {
    maxWidth: '100%',
    maxHeight: '200px',
    objectFit: 'contain',
    borderRadius: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
  }
}));

const ProductImageCell = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '& img': {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.divider}`,
    transition: 'transform 0.2s ease',
    '&:hover': {
      transform: 'scale(1.1)',
    },
  },
}));

const ProductChip = styled(Chip)(({ theme }) => ({
  margin: '2px',
  backgroundColor: alpha('#e91e63', 0.1),
  border: `1px solid ${alpha('#e91e63', 0.3)}`,
  color: '#e91e63',
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

// Update the modalStyle object to handle overflow properly
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  maxHeight: "90vh",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 0, // Reduced padding to create more space for content
  overflow: "hidden", // Hide overflow, we'll handle it inside
  borderRadius: "12px",
};

// Custom scrollable container with enhanced scrollbar styling
const ScrollableWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  overflowX: 'auto',
  display: 'block',
  position: 'relative',
  borderRadius: 12,
  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
  '&::-webkit-scrollbar': {
    height: '14px',
    display: 'block',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: '#f1f1f1',
    borderRadius: '10px',
    margin: '0 10px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#e91e63',
    borderRadius: '10px',
    border: '3px solid #f1f1f1',
    '&:hover': {
      backgroundColor: '#c2185b',
    },
  }
}));

// Empty state component
const EmptyState = styled(Box)(({ theme }) => ({
  padding: theme.spacing(5),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 12,
  backgroundColor: alpha('#e91e63', 0.05),
  border: `1px dashed ${alpha('#e91e63', 0.2)}`,
}));

const StyledDialogTitle = styled(Box)(({ theme, deleteMode }) => ({
  backgroundColor: deleteMode ? '#f44336' : '#e91e63',
  color: 'white',
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
}));

const ProductManager = () => {
  const location = useLocation();
  const searchProducts = location.state?.products || [];

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [currentProduct, setCurrentProduct] = useState({
    Name: "",
    Price: "",
    OriginalPrice: "",
    Description: "",
    ImageFile: "",
  });

  const pageSize = 10;

  const fetchBrands = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/thuong-hieu`, {
        headers: { Accept: "application/json" },
      });

      if (response.data && response.data.$values) {
        setBrands(response.data.$values);
      } else {
        console.error("Invalid data format:", response.data);
        setBrands([]);
      }
    } catch (error) {
      console.error("Failed to fetch brands:", error);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const flattenCategories = (categories) => {
    let flatList = [];
    categories.forEach((category) => {
      if (category?.Name && category?.Name !== "Không có tên") {
        flatList.push({
          Id: category?.Id || "Không có ID",
          Name: category?.Name || "Không có tên",
          Description: category?.Description || "Không có mô tả",
          ParentName: category?.Parent?.Name || "Không có",
          SubCategories:
            category?.InverseParent?.$values
              ?.map((sub) => sub.Name)
              .join(", ") || "Không có",
        });

        if (category?.InverseParent?.$values?.length > 0) {
          flatList = flatList.concat(flattenCategories(category.InverseParent.$values));
        }
      }
    });
    return flatList;
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
      }

      const response = await axios.get(`${API_BASE_URL}/Categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.status === 200 && response.data) {
        const flatCategories = flattenCategories(response.data.$values || []);
        setCategories(flatCategories);
      } else {
        throw new Error("Dữ liệu trả về không hợp lệ.");
      }
    } catch (err) {
      console.error("Lỗi API:", err);
      setError(
        err.response?.data?.message ||
        "Không thể lấy danh mục. Vui lòng kiểm tra lại API hoặc kết nối mạng."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchProducts = async (page) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Products/danh-sach`,
        { params: { pageNumber: page, pageSize: pageSize } }
      );

      console.log('Dữ liệu sản phẩm trả về:', response.data?.DanhSachSanPham?.$values);

      const productsData = response.data?.DanhSachSanPham?.$values || [];
      const cleanedProducts = productsData.map((product) => ({
        ...product,
        ImageUrl: product.ImageUrl
          ? `https://api.cutexiu.teeniax.io.vn/${product.ImageUrl}`
          : "default-image.jpg",
      }));

      setProducts(cleanedProducts);
      setTotalProducts(response.data?.TongSoSanPham || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error("Lỗi khi tải danh sách sản phẩm:", error);
      setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const openModal = (type, product = null) => {
    setModalType(type);
    setCurrentProduct(
      product || {
        Name: "",
        Price: "",
        OriginalPrice: "",
        Description: "",
        ImageFile: "",
        Brand: "",
        Categories: "",
      }
    );
    setPreviewImage(product?.ImageUrl || null);
    setSelectedBrands([]);
    setSelectedCategories([]);
    setModalVisible(true);
  };

  const handleAddProduct = async () => {
    const formData = new FormData();

    if (!currentProduct.Name || !currentProduct.Price) {
      setErrorMessage("Vui lòng nhập đầy đủ thông tin sản phẩm");
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }

    if (!selectedCategories || selectedCategories.length === 0) {
      setErrorMessage("Vui lòng chọn ít nhất một danh mục");
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }

    formData.append("Name", currentProduct.Name);
    formData.append("Price", parseFloat(currentProduct.Price));
    formData.append("OriginalPrice", parseFloat(currentProduct.OriginalPrice));
    formData.append("Description", currentProduct.Description);

    selectedBrands.forEach(brandId => {
      formData.append("BrandIds", brandId);
    });

    selectedCategories.forEach(categoryId => {
      formData.append("Categories", categoryId);
    });

    if (selectedFile) {
      formData.append("ImageFile", selectedFile);
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token không tồn tại.");

      const response = await axios.post(`${API_BASE_URL}/Products/them-moi`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccessMessage("Thêm sản phẩm thành công!");
      setTimeout(() => setSuccessMessage(""), 5000);
      fetchProducts(currentPage);
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      setErrorMessage(`Lỗi khi thêm sản phẩm: ${error.response?.data?.message || error.message}`);
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setModalVisible(false);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditProduct = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token không tồn tại.");

      const formData = new FormData();

      formData.append("Id", currentProduct.Id);
      formData.append("Name", currentProduct.Name);
      formData.append("Price", parseFloat(currentProduct.Price));
      formData.append("OriginalPrice", parseFloat(currentProduct.OriginalPrice));
      formData.append("Description", currentProduct.Description);

      selectedBrands.forEach(brandId => {
        formData.append("BrandIds", brandId);
      });

      selectedCategories.forEach(categoryId => {
        formData.append("Categories", categoryId);
      });

      if (selectedFile) {
        formData.append("ImageFile", selectedFile);
      }

      const response = await axios.put(
        `${API_BASE_URL}/Products/cap-nhat/${currentProduct.Id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchProducts(currentPage);
      setSuccessMessage("Cập nhật sản phẩm thành công!");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error.response?.data || error.message);
      setErrorMessage(`Lỗi khi cập nhật sản phẩm: ${error.response?.data?.message || error.message}`);
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setModalVisible(false);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_BASE_URL}/Products/xoa/${currentProduct.Id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchProducts(currentPage);
      setSuccessMessage("Xóa sản phẩm thành công!");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      setErrorMessage("Lỗi khi xóa sản phẩm.");
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setModalVisible(false);
    }
  };

  const totalPages = Math.ceil(totalProducts / pageSize);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const getModalTitle = () => {
    switch (modalType) {
      case "add":
        return "Thêm Sản Phẩm Mới";
      case "edit":
        return "Chỉnh Sửa Sản Phẩm";
      case "delete":
        return "Xác Nhận Xóa Sản Phẩm";
      default:
        return "";
    }
  };

  const handleModalAction = () => {
    switch (modalType) {
      case "add":
        return handleAddProduct();
      case "edit":
        return handleEditProduct();
      case "delete":
        return handleDeleteProduct();
      default:
        return null;
    }
  };

  const getModalActionText = () => {
    switch (modalType) {
      case "add":
        return "Thêm Sản Phẩm";
      case "edit":
        return "Cập Nhật";
      case "delete":
        return "Xác Nhận Xóa";
      default:
        return "";
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <PageTitle variant="h4">
          <InventoryIcon fontSize="large" />
          Quản Lý Sản Phẩm
        </PageTitle>
        <StyledButton
          customvariant="add"
          startIcon={<AddCircleIcon />}
          onClick={() => openModal("add")}
          size="large"
        >
          Thêm Sản Phẩm Mới
        </StyledButton>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Alerts */}
      {successMessage && (
        <Alert
          severity="success"
          variant="filled"
          sx={{
            mb: 2,
            borderRadius: 2,
            boxShadow: 2,
            backgroundColor: '#e91e63'
          }}
          onClose={() => setSuccessMessage("")}
        >
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert
          severity="error"
          variant="filled"
          sx={{
            mb: 2,
            borderRadius: 2,
            boxShadow: 2,
            backgroundColor: '#e91e63'
          }}
          onClose={() => setErrorMessage("")}
        >
          {errorMessage}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={5}>
          <CircularProgress sx={{ color: '#e91e63' }} />
          <Typography ml={2} variant="body1" color="text.secondary">
            Đang tải danh sách sản phẩm...
          </Typography>
        </Box>
      ) : error ? (
        <Alert
          severity="error"
          sx={{
            mt: 2,
            borderRadius: 2,
            backgroundColor: 'rgba(233, 30, 99, 0.1)',
            color: '#e91e63',
            '& .MuiAlert-icon': {
              color: '#e91e63'
            }
          }}
        >
          {error}
        </Alert>
      ) : (
        <Box sx={{ mt: 3 }}>
          {products.length === 0 ? (
            <EmptyState>
              <ErrorOutlineIcon sx={{ fontSize: 60, color: '#e91e63', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có sản phẩm nào
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3, maxWidth: 400 }}>
                Bạn chưa có sản phẩm nào trong hệ thống. Hãy thêm sản phẩm mới để hiển thị cho khách hàng.
              </Typography>
              <StyledButton
                customvariant="add"
                startIcon={<AddCircleIcon />}
                onClick={() => openModal("add")}
              >
                Thêm Sản Phẩm Mới
              </StyledButton>
            </EmptyState>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Kéo ngang để xem đầy đủ thông tin →
              </Typography>

              <ScrollableWrapper>
                <Table sx={{ minWidth: 1450 }}>
                  <StyledTableHead>
                    <TableRow>
                      <HeaderTableCell>STT</HeaderTableCell>
                      <HeaderTableCell>Tên sản phẩm</HeaderTableCell>
                      <HeaderTableCell>Giá bán</HeaderTableCell>
                      <HeaderTableCell>Giá gốc</HeaderTableCell>
                      <HeaderTableCell>Mô tả</HeaderTableCell>
                      <HeaderTableCell>Thương hiệu</HeaderTableCell>
                      <HeaderTableCell>Danh mục</HeaderTableCell>
                      <HeaderTableCell>Hình ảnh</HeaderTableCell>
                      <HeaderTableCell>Hành động</HeaderTableCell>
                    </TableRow>
                  </StyledTableHead>
                  <TableBody>
                    {products.map((product, index) => (
                      <StyledTableRow key={product.Id}>
                        <BodyTableCell>{(currentPage - 1) * pageSize + index + 1}</BodyTableCell>
                        <BodyTableCell>
                          <Typography fontWeight={500}>{product.Name}</Typography>
                        </BodyTableCell>
                        <BodyTableCell>
                          <ProductChip
                            icon={<LocalOfferIcon />}
                            label={`${product.Price.toLocaleString()}đ`}
                            size="small"
                          />
                        </BodyTableCell>
                        <BodyTableCell>
                          <Typography variant="body2" color="text.secondary">
                            {product.OriginalPrice.toLocaleString()}đ
                          </Typography>
                        </BodyTableCell>
                        <BodyTableCell sx={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <Tooltip title={product.Description || "Không có mô tả"} arrow>
                            <Typography
                              noWrap
                            >
                              {product.Description || "Không có mô tả"}
                            </Typography>
                          </Tooltip>
                        </BodyTableCell>
                        <BodyTableCell>
                          {product.BrandName ? (
                            <ProductChip
                              label={product.BrandName}
                              size="small"
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Không có thương hiệu
                            </Typography>
                          )}
                        </BodyTableCell>
                        <BodyTableCell>
                          {product.Categories && product.Categories.$values && product.Categories.$values.length > 0 ? (
                            <Box display="flex" flexWrap="wrap" justifyContent="center" gap={0.5}>
                              {product.Categories.$values.map((category, idx) => (
                                <ProductChip
                                  key={idx}
                                  label={category}
                                  size="small"
                                />
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Không có danh mục
                            </Typography>
                          )}
                        </BodyTableCell>
                        <BodyTableCell>
                          <ProductImageCell>
                            <img
                              src={product.ImageUrl}
                              alt={product.Name || "Hình ảnh sản phẩm"}
                            />
                          </ProductImageCell>
                        </BodyTableCell>
                        <ActionButtonsCell>
                          <Box display="flex" justifyContent="center" gap={2}>
                            <IconButton
                              size="small"
                              sx={{
                                border: '1px solid #e91e63',
                                color: '#e91e63',
                                p: 1,
                                '&:hover': {
                                  backgroundColor: alpha('#e91e63', 0.1),
                                }
                              }}
                              onClick={() => openModal("edit", product)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{
                                border: '1px solid #e91e63',
                                color: '#e91e63',
                                p: 1,
                                '&:hover': {
                                  backgroundColor: alpha('#e91e63', 0.1),
                                }
                              }}
                              onClick={() => openModal("delete", product)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </ActionButtonsCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollableWrapper>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    sx={{
                      '& .MuiPaginationItem-root': {
                        '&.Mui-selected': {
                          backgroundColor: '#e91e63',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: '#c2185b',
                          }
                        },
                        '&:hover': {
                          backgroundColor: alpha('#e91e63', 0.1),
                        }
                      }
                    }}
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      )}

      {/* Product Modal */}
      <Modal
        open={modalVisible}
        onClose={() => setModalVisible(false)}
        aria-labelledby="modal-title"
      >
        <Box sx={modalStyle}>
          {/* Modal Header */}
          <StyledDialogTitle deleteMode={modalType === 'delete'}>
            {modalType === 'add' && <AddCircleIcon sx={{ mr: 1 }} />}
            {modalType === 'edit' && <EditIcon sx={{ mr: 1 }} />}
            {modalType === 'delete' && <DeleteIcon sx={{ mr: 1 }} />}
            <Typography variant="h6" component="h2">
              {getModalTitle()}
            </Typography>
          </StyledDialogTitle>

          {/* Modal Content */}
          {modalType === "delete" ? (
            <Box sx={{ p: 3 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Bạn có chắc chắn muốn xóa sản phẩm <b>{currentProduct.Name}</b>?
              </Typography>
              <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                Hành động này không thể hoàn tác và sẽ xóa sản phẩm khỏi hệ thống.
              </Typography>
            </Box>
          ) : (
            <StyledDialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Tên sản phẩm"
                    fullWidth
                    value={currentProduct.Name}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, Name: e.target.value })}
                    InputProps={{
                      startAdornment: <InventoryIcon sx={{ mr: 1, color: '#e91e63' }} />,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#e91e63'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#e91e63'
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#e91e63'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Giá bán"
                    fullWidth
                    type="number"
                    value={currentProduct.Price}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, Price: e.target.value })}
                    InputProps={{
                      startAdornment: <LocalOfferIcon sx={{ mr: 1, color: '#e91e63' }} />,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#e91e63'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#e91e63'
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#e91e63'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Giá gốc"
                    fullWidth
                    type="number"
                    value={currentProduct.OriginalPrice}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, OriginalPrice: e.target.value })}
                    InputProps={{
                      startAdornment: <CurrencyExchangeIcon sx={{ mr: 1, color: '#e91e63' }} />,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#e91e63'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#e91e63'
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#e91e63'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <FormSectionTitle>
                    <BrandingWatermarkIcon />
                    Chọn Thương Hiệu
                  </FormSectionTitle>
                  <FormControl fullWidth>
                    <InputLabel sx={{ '&.Mui-focused': { color: '#e91e63' } }}>Thương hiệu</InputLabel>
                    <Select
                      multiple
                      value={selectedBrands}
                      onChange={(e) => setSelectedBrands(e.target.value)}
                      input={<OutlinedInput label="Thương hiệu" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const brand = brands.find(b => b.Id === value);
                            return (
                              <ProductChip key={value} label={brand?.Name || value} size="small" />
                            );
                          })}
                        </Box>
                      )}
                      MenuProps={MenuProps}
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          '&.Mui-focused': {
                            borderColor: '#e91e63',
                          },
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#e91e63',
                        },
                      }}
                    >
                      {brands.map((brand) => (
                        <MenuItem key={brand.Id} value={brand.Id}>
                          <Checkbox
                            checked={selectedBrands.indexOf(brand.Id) > -1}
                            sx={{
                              '&.Mui-checked': {
                                color: '#e91e63',
                              },
                            }}
                          />
                          <ListItemText primary={brand.Name} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormSectionTitle>
                    <CategoryIcon />
                    Chọn Danh Mục
                  </FormSectionTitle>
                  <FormControl fullWidth>
                    <InputLabel sx={{ '&.Mui-focused': { color: '#e91e63' } }}>Danh mục sản phẩm</InputLabel>
                    <Select
                      multiple
                      value={selectedCategories}
                      onChange={(e) => setSelectedCategories(e.target.value)}
                      input={<OutlinedInput label="Danh mục sản phẩm" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const category = categories.find(c => c.Id === value);
                            return (
                              <ProductChip key={value} label={category?.Name || value} size="small" />
                            );
                          })}
                        </Box>
                      )}
                      MenuProps={MenuProps}
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          '&.Mui-focused': {
                            borderColor: '#e91e63',
                          },
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#e91e63',
                        },
                      }}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.Id} value={category.Id}>
                          <Checkbox
                            checked={selectedCategories.indexOf(category.Id) > -1}
                            sx={{
                              '&.Mui-checked': {
                                color: '#e91e63',
                              },
                            }}
                          />
                          <ListItemText primary={category.Name} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <FormSectionTitle>
                    <DescriptionIcon />
                    Mô tả sản phẩm
                  </FormSectionTitle>
                  <TextField
                    label="Mô tả chi tiết"
                    fullWidth
                    multiline
                    rows={4}
                    value={currentProduct.Description}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, Description: e.target.value })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#e91e63'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#e91e63'
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#e91e63'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <FormSectionTitle>
                    <PhotoIcon />
                    Hình ảnh sản phẩm
                  </FormSectionTitle>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      sx={{
                        borderRadius: '8px',
                        borderColor: '#e91e63',
                        color: '#e91e63',
                        '&:hover': {
                          borderColor: '#c2185b',
                          backgroundColor: alpha('#e91e63', 0.05),
                        }
                      }}
                    >
                      Chọn ảnh
                      <input
                        type="file"
                        hidden
                        onChange={handleImageChange}
                        accept="image/*"
                      />
                    </Button>
                    <Typography variant="body2" color="text.secondary">
                      {selectedFile ? selectedFile.name : "Chưa chọn file nào"}
                    </Typography>
                  </Box>

                  {previewImage && (
                    <ImagePreviewContainer>
                      <img src={previewImage} alt="Xem trước" />
                    </ImagePreviewContainer>
                  )}
                </Grid>
              </Grid>
            </StyledDialogContent>
          )}

          {/* Modal Footer */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            gap: 2
          }}>
            <StyledButton
              customvariant="cancel"
              onClick={() => setModalVisible(false)}
            >
              Hủy
            </StyledButton>
            <StyledButton
              customvariant={modalType === 'delete' ? 'delete' : 'save'}
              onClick={handleModalAction}
              startIcon={
                modalType === 'add' ? <AddCircleIcon /> :
                  modalType === 'edit' ? <EditIcon /> :
                    <DeleteIcon />
              }
            >
              {getModalActionText()}
            </StyledButton>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default ProductManager;