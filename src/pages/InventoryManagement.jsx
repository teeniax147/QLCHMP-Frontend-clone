import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Modal,
  Box,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Container,
  Divider,
  IconButton,
  alpha,
  styled,
  Grid,
  Chip
} from "@mui/material";
import axios from "axios";
import { API_BASE_URL } from '../config';

// Import Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import InventoryIcon from '@mui/icons-material/Inventory';
import StoreIcon from '@mui/icons-material/Store';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

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

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  maxHeight: "90vh",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 0,
  overflow: "hidden",
  borderRadius: "12px",
};

const StyledDialogTitle = styled(Box)(({ theme, error }) => ({
  backgroundColor: error ? '#f44336' : '#e91e63',
  color: 'white',
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  '& svg': {
    marginRight: theme.spacing(1),
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

const InventoryChip = styled(Chip)(({ theme }) => ({
  borderColor: '#e91e63',
  color: '#e91e63',
  '& .MuiChip-icon': {
    color: '#e91e63',
  }
}));

const InventoryManagement = () => {
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "add" | "edit" | "delete"
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [formData, setFormData] = useState({
    ProductId: "",
    WarehouseLocation: "",
    QuantityInStock: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Lấy danh sách kho hàng từ API
  const fetchInventories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/Inventories`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setInventories(response.data.$values || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      setError("Không thể lấy danh sách kho hàng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventories();
  }, []);

  const openModal = (type, inventory = null) => {
    setModalType(type);
    setSelectedInventory(inventory);
    setFormData(
      inventory
        ? {
          ProductId: inventory.ProductId,
          WarehouseLocation: inventory.WarehouseLocation,
          QuantityInStock: inventory.QuantityInStock,
        }
        : {
          ProductId: "",
          WarehouseLocation: "",
          QuantityInStock: "",
        }
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInventory(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleAddInventory = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/Inventories`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setSuccessMessage("Thêm kho hàng thành công!");
      setTimeout(() => setSuccessMessage(""), 5000);
      fetchInventories();
      closeModal();
    } catch (error) {
      console.error("Error adding inventory:", error);
      setErrorMessage(error.response?.data || "Có lỗi xảy ra khi thêm kho hàng.");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const handleEditInventory = async () => {
    try {
      const updatedInventory = {
        ...formData,
        InventoryId: selectedInventory.InventoryId,
      };

      await axios.put(
        `${API_BASE_URL}/Inventories/${selectedInventory.InventoryId}`,
        updatedInventory,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSuccessMessage("Cập nhật kho hàng thành công!");
      setTimeout(() => setSuccessMessage(""), 5000);
      fetchInventories();
      closeModal();
    } catch (error) {
      console.error("Error updating inventory:", error);
      setErrorMessage(error.response?.data || "Có lỗi xảy ra khi cập nhật kho hàng.");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const handleDeleteInventory = async () => {
    if (!selectedInventory?.InventoryId) {
      setErrorMessage("Không tìm thấy ID kho hàng để xóa.");
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }
    try {
      await axios.delete(
        `${API_BASE_URL}/Inventories/${selectedInventory.InventoryId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSuccessMessage("Xóa kho hàng thành công!");
      setTimeout(() => setSuccessMessage(""), 5000);
      fetchInventories();
      closeModal();
    } catch (error) {
      console.error("Error deleting inventory:", error);
      setErrorMessage(error.response?.data || "Có lỗi xảy ra khi xóa kho hàng.");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const getModalTitle = () => {
    switch (modalType) {
      case "add":
        return "Thêm Kho Hàng Mới";
      case "edit":
        return "Chỉnh Sửa Kho Hàng";
      case "delete":
        return "Xác Nhận Xóa Kho Hàng";
      default:
        return "";
    }
  };

  const getModalIcon = () => {
    switch (modalType) {
      case "add":
        return <AddCircleIcon />;
      case "edit":
        return <EditIcon />;
      case "delete":
        return <DeleteIcon />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <PageTitle variant="h4">
          <WarehouseIcon fontSize="large" />
          Quản Lý Kho Hàng
        </PageTitle>
        <StyledButton
          customvariant="add"
          startIcon={<AddCircleIcon />}
          onClick={() => openModal("add")}
          size="large"
        >
          Thêm Kho Hàng Mới
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
            Đang tải dữ liệu kho hàng...
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
        <StyledTableContainer component={Paper}>
          <Table>
            <StyledTableHead>
              <TableRow>
                <HeaderTableCell>STT</HeaderTableCell>
                <HeaderTableCell>Vị Trí Kho</HeaderTableCell>
                <HeaderTableCell>Số Lượng</HeaderTableCell>
                <HeaderTableCell>Hành Động</HeaderTableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {inventories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      Không có dữ liệu kho hàng
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                inventories.map((inventory, index) => (
                  <StyledTableRow key={inventory.InventoryId}>
                    <BodyTableCell>{index + 1}</BodyTableCell>
                    <BodyTableCell>
                      <InventoryChip
                        icon={<StoreIcon />}
                        label={inventory.WarehouseLocation}
                        variant="outlined"
                        size="small"
                      />
                    </BodyTableCell>
                    <BodyTableCell>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <InventoryIcon sx={{ mr: 0.5, color: '#e91e63' }} />
                        {inventory.QuantityInStock}
                      </Typography>
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
                          onClick={() => openModal("edit", inventory)}
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
                          onClick={() => openModal("delete", inventory)}
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
        </StyledTableContainer>
      )}

      {/* Modal */}
      <Modal open={isModalOpen} onClose={closeModal}>
        <Box sx={modalStyle}>
          {/* Modal Header */}
          <StyledDialogTitle error={modalType === 'delete'}>
            {getModalIcon()}
            <Typography variant="h6" component="h2">
              {getModalTitle()}
            </Typography>
          </StyledDialogTitle>

          {/* Modal Content */}
          {modalType === "delete" ? (
            <Box sx={{ p: 3 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Bạn có chắc chắn muốn xóa kho hàng{' '}
                <b>{selectedInventory?.WarehouseLocation}</b> với số lượng{' '}
                <b>{selectedInventory?.QuantityInStock}</b> không?
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: '#e91e63' }}>
                Hành động này không thể hoàn tác và sẽ xóa kho hàng khỏi hệ thống.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormSectionTitle>
                    <ShoppingCartIcon />
                    Thông tin sản phẩm
                  </FormSectionTitle>
                  <TextField
                    label="ID Sản Phẩm"
                    name="ProductId"
                    value={formData.ProductId}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      startAdornment: <ShoppingCartIcon sx={{ mr: 1, color: '#e91e63' }} />,
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
                  <Divider sx={{ my: 1 }} />
                  <FormSectionTitle>
                    <StoreIcon />
                    Thông tin kho
                  </FormSectionTitle>
                  <TextField
                    label="Vị Trí Kho"
                    name="WarehouseLocation"
                    value={formData.WarehouseLocation}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      startAdornment: <StoreIcon sx={{ mr: 1, color: '#e91e63' }} />,
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
                  <TextField
                    label="Số Lượng Tồn Kho"
                    name="QuantityInStock"
                    value={formData.QuantityInStock}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    type="number"
                    InputProps={{
                      startAdornment: <LocalShippingIcon sx={{ mr: 1, color: '#e91e63' }} />,
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
              </Grid>
            </Box>
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
              onClick={closeModal}
            >
              Hủy
            </StyledButton>
            <StyledButton
              customvariant={modalType === 'delete' ? 'delete' : 'save'}
              onClick={
                modalType === 'add'
                  ? handleAddInventory
                  : modalType === 'edit'
                    ? handleEditInventory
                    : handleDeleteInventory
              }
              startIcon={
                modalType === 'add' ? <AddCircleIcon /> :
                  modalType === 'edit' ? <EditIcon /> :
                    <DeleteIcon />
              }
            >
              {modalType === 'add'
                ? 'Thêm Kho Hàng'
                : modalType === 'edit'
                  ? 'Lưu Thay Đổi'
                  : 'Xác Nhận Xóa'
              }
            </StyledButton>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default InventoryManagement;