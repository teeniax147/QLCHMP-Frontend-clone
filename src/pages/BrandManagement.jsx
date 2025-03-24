import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from '../config'
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
  CircularProgress,
  Alert,
  alpha,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermark';
import DescriptionIcon from '@mui/icons-material/Description';
import PhotoIcon from '@mui/icons-material/Photo';

// Styled Components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 12,
  overflow: 'hidden',
  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
  marginTop: theme.spacing(3),
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
}));

const HeaderTableCell = styled(TableCell)(({ theme }) => ({
  textAlign: "center",
  fontWeight: "600",
  fontSize: "15px",
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(1.5),
  whiteSpace: 'nowrap',
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
  padding: theme.spacing(1.5),
  fontSize: '14px',
}));

const ActionButtonsCell = styled(TableCell)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(1),
  whiteSpace: 'nowrap',
}));

const AddBrandButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.success.main,
  color: theme.palette.common.white,
  borderRadius: 8,
  padding: '8px 16px',
  fontWeight: 500,
  textTransform: 'none',
  boxShadow: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.success.dark,
    boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`,
  },
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
    color: theme.palette.primary.main,
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
    color: theme.palette.primary.main,
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

const BrandLogoCell = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '& img': {
    width: '60px',
    height: '60px',
    objectFit: 'contain',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.divider}`,
    transition: 'transform 0.2s ease',
    '&:hover': {
      transform: 'scale(1.1)',
    },
  },
}));

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
    backgroundColor: '#2196f3',
    borderRadius: '10px',
    border: '3px solid #f1f1f1',
    '&:hover': {
      backgroundColor: '#1976d2',
    },
  }
}));

// Modal style
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  maxHeight: "90vh",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 0,
  overflow: "hidden",
  borderRadius: "12px",
};

const BrandManagement = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "add" | "edit" | "delete"
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logoFile: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
      setErrorMessage("Không thể tải danh sách thương hiệu. Vui lòng thử lại!");
      setTimeout(() => setErrorMessage(""), 5000);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openModal = (type, brand = null) => {
    setModalType(type);
    setSelectedBrand(brand);

    if (brand) {
      setFormData({
        name: brand.Name || "",
        description: brand.Description || "",
        logoFile: null
      });
      setPreviewImage(brand.LogoUrl || null);
    } else {
      setFormData({
        name: "",
        description: "",
        logoFile: null
      });
      setPreviewImage(null);
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBrand(null);
    setPreviewImage(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        logoFile: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddBrand = async () => {
    if (!formData.name) {
      setErrorMessage("Vui lòng nhập tên thương hiệu");
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");

      const formDataToSend = new FormData();
      formDataToSend.append("Name", formData.name);
      formDataToSend.append("Description", formData.description || "");
      if (formData.logoFile) {
        formDataToSend.append("LogoFile", formData.logoFile);
      }

      const response = await axios.post(
        `${API_BASE_URL}/thuong-hieu/them-moi`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccessMessage("Thêm thương hiệu thành công!");
      setTimeout(() => setSuccessMessage(""), 5000);
      fetchBrands();
      closeModal();
    } catch (error) {
      console.error("Failed to add brand:", error);
      setErrorMessage(error.response?.data?.message || "Có lỗi xảy ra khi thêm thương hiệu.");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const handleUpdateBrand = async () => {
    if (!formData.name) {
      setErrorMessage("Vui lòng nhập tên thương hiệu");
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");

      const formDataObj = new FormData();
      formDataObj.append("Name", formData.name);
      formDataObj.append("Description", formData.description || "");
      if (formData.logoFile) {
        formDataObj.append("LogoFile", formData.logoFile);
      }

      const response = await axios.put(
        `${API_BASE_URL}/thuong-hieu/cap-nhat/${selectedBrand.Id}`,
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccessMessage("Cập nhật thương hiệu thành công!");
      setTimeout(() => setSuccessMessage(""), 5000);
      fetchBrands();
      closeModal();
    } catch (error) {
      console.error("Failed to update brand:", error);
      setErrorMessage(error.response?.data?.message || "Có lỗi xảy ra khi cập nhật thương hiệu.");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const handleDeleteBrand = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");

      const response = await axios.delete(
        `${API_BASE_URL}/thuong-hieu/xoa/${selectedBrand.Id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccessMessage("Xóa thương hiệu thành công!");
      setTimeout(() => setSuccessMessage(""), 5000);
      fetchBrands();
      closeModal();
    } catch (error) {
      console.error("Failed to delete brand:", error);
      setErrorMessage(error.response?.data?.message || "Có lỗi xảy ra khi xóa thương hiệu.");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const getModalTitle = () => {
    switch (modalType) {
      case "add":
        return "Thêm Thương Hiệu Mới";
      case "edit":
        return "Chỉnh Sửa Thương Hiệu";
      case "delete":
        return "Xác Nhận Xóa Thương Hiệu";
      default:
        return "";
    }
  };

  const handleModalAction = () => {
    switch (modalType) {
      case "add":
        return handleAddBrand();
      case "edit":
        return handleUpdateBrand();
      case "delete":
        return handleDeleteBrand();
      default:
        return null;
    }
  };

  const getModalActionText = () => {
    switch (modalType) {
      case "add":
        return "Thêm Thương Hiệu";
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
          <BrandingWatermarkIcon fontSize="large" />
          Quản Lý Thương Hiệu
        </PageTitle>
        <AddBrandButton
          startIcon={<AddCircleIcon />}
          onClick={() => openModal("add")}
          size="large"
        >
          Thêm Thương Hiệu Mới
        </AddBrandButton>
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
            Đang tải danh sách thương hiệu...
          </Typography>
        </Box>
      ) : (
        <Box sx={{ mt: 3 }}>

          <ScrollableWrapper>
            <Table>
              <StyledTableHead>
                <TableRow>
                  <HeaderTableCell width="5%">STT</HeaderTableCell>
                  <HeaderTableCell width="20%">Tên Thương Hiệu</HeaderTableCell>
                  <HeaderTableCell width="50%">Mô Tả</HeaderTableCell>
                  <HeaderTableCell width="15%">Logo</HeaderTableCell>
                  <HeaderTableCell width="10%">Hành Động</HeaderTableCell>
                </TableRow>
              </StyledTableHead>
              <TableBody>
                {brands.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1" color="text.secondary">
                        Không có thương hiệu nào!
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  brands.map((brand, index) => (
                    <StyledTableRow key={brand.Id}>
                      <BodyTableCell>{index + 1}</BodyTableCell>
                      <BodyTableCell>
                        <Typography fontWeight={500}>{brand.Name}</Typography>
                      </BodyTableCell>
                      <BodyTableCell sx={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left' }}>
                        <Typography
                          noWrap
                          title={brand.Description || "Không có mô tả"}
                        >
                          {brand.Description || "Không có mô tả"}
                        </Typography>
                      </BodyTableCell>
                      <BodyTableCell>
                        <BrandLogoCell>
                          {brand.LogoUrl ? (
                            <img
                              src={brand.LogoUrl}
                              alt={brand.Name}
                            />
                          ) : (
                            <Chip label="Không có logo" size="small" variant="outlined" />
                          )}
                        </BrandLogoCell>
                      </BodyTableCell>
                      <ActionButtonsCell>
                        <Box display="flex" justifyContent="center" gap={2}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => openModal("edit", brand)}
                            sx={{
                              border: '1px solid #2196f3',
                              p: 1,
                              '&:hover': {
                                backgroundColor: alpha('#2196f3', 0.1),
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => openModal("delete", brand)}
                            sx={{
                              border: '1px solid #f44336',
                              p: 1,
                              '&:hover': {
                                backgroundColor: alpha('#f44336', 0.1),
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </ActionButtonsCell>
                    </StyledTableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollableWrapper>
        </Box>
      )}

      {/* Brand Modal */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        aria-labelledby="modal-title"
      >
        <Box sx={modalStyle}>
          {/* Modal Header */}
          <Box sx={{
            backgroundColor: modalType === 'delete' ? '#f44336' : '#2196f3',
            color: 'white',
            p: 2,
            display: 'flex',
            alignItems: 'center',
          }}>
            {modalType === 'add' && <AddCircleIcon sx={{ mr: 1 }} />}
            {modalType === 'edit' && <EditIcon sx={{ mr: 1 }} />}
            {modalType === 'delete' && <DeleteIcon sx={{ mr: 1 }} />}
            <Typography variant="h6" component="h2">
              {getModalTitle()}
            </Typography>
          </Box>

          {/* Modal Content */}
          {modalType === "delete" ? (
            <Box sx={{ p: 3 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Bạn có chắc chắn muốn xóa thương hiệu <b>{selectedBrand?.Name}</b>?
              </Typography>
              <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                Hành động này không thể hoàn tác và sẽ xóa thương hiệu khỏi hệ thống.
              </Typography>
            </Box>
          ) : (
            <StyledDialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Tên thương hiệu"
                    name="name"
                    fullWidth
                    value={formData.name}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: <BrandingWatermarkIcon color="primary" sx={{ mr: 1 }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <FormSectionTitle>
                    <DescriptionIcon />
                    Mô tả thương hiệu
                  </FormSectionTitle>
                  <TextField
                    label="Mô tả chi tiết"
                    name="description"
                    fullWidth
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <FormSectionTitle>
                    <PhotoIcon />
                    Logo thương hiệu
                  </FormSectionTitle>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      sx={{ borderRadius: '8px' }}
                    >
                      Chọn logo
                      <input
                        type="file"
                        hidden
                        onChange={handleLogoChange}
                        accept="image/*"
                      />
                    </Button>
                    <Typography variant="body2" color="text.secondary">
                      {formData.logoFile ? formData.logoFile.name : "Chưa chọn file nào"}
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
            <Button
              variant="outlined"
              color="inherit"
              onClick={closeModal}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              color={modalType === 'delete' ? 'error' : 'primary'}
              onClick={handleModalAction}
              startIcon={
                modalType === 'add' ? <AddCircleIcon /> :
                  modalType === 'edit' ? <EditIcon /> :
                    <DeleteIcon />
              }
            >
              {getModalActionText()}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default BrandManagement;