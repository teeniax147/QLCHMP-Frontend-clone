import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Container,
  Box,
  Divider,
  Grid,
  styled,
  alpha,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { API_BASE_URL } from '../config';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PercentIcon from '@mui/icons-material/Percent';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import InventoryIcon from '@mui/icons-material/Inventory';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Styled components for enhanced visual presentation
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
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
  whiteSpace: 'nowrap',
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

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  display: 'flex',
  alignItems: 'center',
  fontSize: '1.4rem',
  fontWeight: 600,
  padding: theme.spacing(2),
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
    color: theme.palette.primary.main,
  }
}));

const CouponActiveChip = styled(Chip)(({ theme, isActive }) => ({
  fontWeight: 500,
  backgroundColor: isActive ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
  color: isActive ? theme.palette.success.dark : theme.palette.error.dark,
  border: `1px solid ${isActive ? theme.palette.success.light : theme.palette.error.light}`,
  width: '110px'
}));

const CouponPercentageChip = styled(Chip)(({ theme }) => ({
  fontWeight: 500,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.dark,
  border: `1px solid ${theme.palette.primary.light}`,
}));

const CouponAmountChip = styled(Chip)(({ theme }) => ({
  fontWeight: 500,
  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
  color: theme.palette.secondary.dark,
  border: `1px solid ${theme.palette.secondary.light}`,
}));

// Custom scrollable container with visible scrollbar
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

// Empty state component
const EmptyState = styled(Box)(({ theme }) => ({
  padding: theme.spacing(5),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 12,
  backgroundColor: alpha(theme.palette.primary.light, 0.05),
  border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
}));

const CouponsManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCoupon, setNewCoupon] = useState({
    Name: "",
    Code: "",
    DiscountAmount: 0,
    DiscountPercentage: 0,
    MaxDiscountAmount: 0,
    StartDate: new Date().toISOString().split('T')[0], // Set default to today
    EndDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0], // Set default to next month
    MinimumOrderAmount: 0,
    QuantityAvailable: 1,
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/Coupons`);
      console.log("Dữ liệu API trả về:", response.data);

      // Kiểm tra và làm sạch dữ liệu
      let data = [];
      if (response.data && response.data.$values) {
        data = response.data.$values;
      } else if (Array.isArray(response.data)) {
        data = response.data;
      } else {
        console.warn("Dữ liệu không phải là mảng:", response.data);
        data = [];
      }

      // Làm sạch và chuẩn hóa dữ liệu
      const cleanedData = data.map(coupon => ({
        ...coupon,
        Id: coupon.Id || 0,
        Name: coupon.Name || "Chưa có tên",
        Code: coupon.Code || "NONE",
        DiscountAmount: coupon.DiscountAmount || 0,
        DiscountPercentage: coupon.DiscountPercentage || 0,
        MaxDiscountAmount: coupon.MaxDiscountAmount || 0,
        MinimumOrderAmount: coupon.MinimumOrderAmount || 0,
        QuantityAvailable: coupon.QuantityAvailable || 0,
        // Đảm bảo ngày hợp lệ
        StartDate: coupon.StartDate || new Date().toISOString(),
        EndDate: coupon.EndDate || new Date().toISOString(),
      }));

      setCoupons(cleanedData);
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
      setError("Không thể tải danh sách mã giảm giá.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCoupon({
      ...newCoupon,
      [name]: value,
    });
  };

  const validateCoupon = (coupon) => {
    if (!coupon.Name.trim()) return "Tên mã giảm giá không được để trống";
    if (!coupon.Code.trim()) return "Mã code không được để trống";
    if (coupon.DiscountPercentage <= 0 && coupon.DiscountAmount <= 0)
      return "Vui lòng nhập giá trị cho % giảm giá hoặc số tiền giảm";
    if (coupon.DiscountPercentage > 100)
      return "Phần trăm giảm giá không thể lớn hơn 100%";
    if (!coupon.StartDate) return "Ngày bắt đầu không được để trống";
    if (!coupon.EndDate) return "Ngày kết thúc không được để trống";
    if (new Date(coupon.EndDate) < new Date(coupon.StartDate))
      return "Ngày kết thúc phải sau ngày bắt đầu";
    if (coupon.QuantityAvailable <= 0)
      return "Số lượng phải lớn hơn 0";

    return null;
  };

  const handleAddCoupon = async () => {
    // Validate form
    const validationError = validateCoupon(newCoupon);
    if (validationError) {
      setErrorMessage(validationError);
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/Coupons`, newCoupon, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          "Content-Type": "application/json"
        },
      });

      setSuccessMessage("Mã giảm giá đã được thêm thành công!");
      setTimeout(() => setSuccessMessage(""), 5000);

      // Reset form
      setNewCoupon({
        Name: "",
        Code: "",
        DiscountAmount: 0,
        DiscountPercentage: 0,
        MaxDiscountAmount: 0,
        StartDate: new Date().toISOString().split('T')[0],
        EndDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        MinimumOrderAmount: 0,
        QuantityAvailable: 1,
      });

      setOpenDialog(false);
      fetchCoupons();
    } catch (err) {
      console.error("Lỗi khi thêm mã giảm giá:", err);
      setErrorMessage(err.response?.data?.message || "Lỗi khi thêm mã giảm giá.");
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCoupon = async () => {
    // Validate form
    const validationError = validateCoupon(editingCoupon);
    if (validationError) {
      setErrorMessage(validationError);
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(`${API_BASE_URL}/Coupons/${editingCoupon.Id}`, editingCoupon, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          "Content-Type": "application/json"
        },
      });

      setSuccessMessage("Mã giảm giá đã được cập nhật thành công!");
      setTimeout(() => setSuccessMessage(""), 5000);
      setOpenEditDialog(false);
      fetchCoupons();
    } catch (err) {
      console.error("Lỗi khi cập nhật mã giảm giá:", err);
      setErrorMessage(err.response?.data?.message || "Lỗi khi cập nhật mã giảm giá.");
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirmDialog = (coupon) => {
    setCouponToDelete(coupon);
    setConfirmDeleteDialog(true);
  };

  const handleDeleteCoupon = async () => {
    if (!couponToDelete || !couponToDelete.Id) {
      setErrorMessage("Không tìm thấy thông tin mã giảm giá để xóa");
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete(`${API_BASE_URL}/Coupons/${couponToDelete.Id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setSuccessMessage("Mã giảm giá đã được xóa thành công!");
      setTimeout(() => setSuccessMessage(""), 5000);
      setConfirmDeleteDialog(false);
      setCouponToDelete(null);
      fetchCoupons();
    } catch (err) {
      console.error("Lỗi khi xóa mã giảm giá:", err);
      setErrorMessage(err.response?.data?.message || "Lỗi khi xóa mã giảm giá.");
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Check if coupon is active with safety checks
  const isCouponActive = (coupon) => {
    if (!coupon || !coupon.StartDate || !coupon.EndDate) return false;

    try {
      const now = new Date();
      const startDate = new Date(coupon.StartDate);
      const endDate = new Date(coupon.EndDate);
      return now >= startDate && now <= endDate && Number(coupon.QuantityAvailable) > 0;
    } catch (error) {
      console.error("Error checking coupon active status:", error);
      return false;
    }
  };

  // Format date with error handling
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return new Date(dateString).toLocaleDateString('vi-VN', options);
    } catch (error) {
      console.error("Invalid date format:", dateString);
      return "Invalid date";
    }
  };

  // Safe number formatting with error handling
  const formatNumber = (value) => {
    if (value === null || value === undefined) return "0";

    try {
      return Number(value).toLocaleString();
    } catch (error) {
      console.error("Error formatting number:", error);
      return "0";
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <PageTitle variant="h4">
          <LocalOfferIcon fontSize="large" />
          Quản Lý Mã Giảm Giá
        </PageTitle>
        <StyledButton
          customvariant="add"
          startIcon={<AddCircleIcon />}
          onClick={() => setOpenDialog(true)}
          size="large"
        >
          Thêm Mã Giảm Giá
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
            Đang tải danh sách mã giảm giá...
          </Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      ) : (
        <Box sx={{ mt: 3 }}>
          {coupons.length === 0 ? (
            <EmptyState>
              <ErrorOutlineIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có mã giảm giá nào
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3, maxWidth: 400 }}>
                Bạn chưa có mã giảm giá nào trong hệ thống. Hãy thêm mã giảm giá mới để khách hàng có thể sử dụng.
              </Typography>
              <StyledButton
                customvariant="add"
                startIcon={<AddCircleIcon />}
                onClick={() => setOpenDialog(true)}
              >
                Thêm Mã Giảm Giá
              </StyledButton>
            </EmptyState>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Kéo ngang để xem đầy đủ thông tin →
              </Typography>

              <ScrollableWrapper>
                <Table sx={{ minWidth: 1000 }}>
                  <StyledTableHead>
                    <TableRow>
                      <HeaderTableCell>Mã Code</HeaderTableCell>
                      <HeaderTableCell>Tên mã</HeaderTableCell>
                      <HeaderTableCell>Loại giảm</HeaderTableCell>
                      <HeaderTableCell>Đơn tối thiểu</HeaderTableCell>
                      <HeaderTableCell>Thời gian áp dụng</HeaderTableCell>
                      <HeaderTableCell>Số lượng</HeaderTableCell>
                      <HeaderTableCell>Trạng thái</HeaderTableCell>
                      <HeaderTableCell>Hành động</HeaderTableCell>
                    </TableRow>
                  </StyledTableHead>
                  <TableBody>
                    {coupons.map((coupon, index) => (
                      <StyledTableRow key={coupon.Id || index}>
                        <BodyTableCell>
                          <Typography fontWeight={600} color="primary.main">
                            {coupon?.Code || "N/A"}
                          </Typography>
                        </BodyTableCell>
                        <BodyTableCell>
                          <Tooltip title={coupon?.Name || "Không có tên"} arrow>
                            <Typography noWrap sx={{ maxWidth: 150 }}>
                              {coupon?.Name || "Không có tên"}
                            </Typography>
                          </Tooltip>
                        </BodyTableCell>
                        <BodyTableCell>
                          <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                            {Number(coupon?.DiscountPercentage) > 0 && (
                              <CouponPercentageChip
                                icon={<PercentIcon />}
                                label={`${coupon.DiscountPercentage}%`}
                                size="small"
                              />
                            )}
                            {Number(coupon?.DiscountAmount) > 0 && (
                              <CouponAmountChip
                                icon={<MonetizationOnIcon />}
                                label={`${formatNumber(coupon.DiscountAmount)} đ`}
                                size="small"
                              />
                            )}
                            {Number(coupon?.MaxDiscountAmount) > 0 && (
                              <Typography variant="caption" color="text.secondary">
                                Tối đa: {formatNumber(coupon.MaxDiscountAmount)} đ
                              </Typography>
                            )}
                          </Box>
                        </BodyTableCell>
                        <BodyTableCell>
                          {Number(coupon?.MinimumOrderAmount) > 0 ?
                            `${formatNumber(coupon.MinimumOrderAmount)} đ` :
                            "Không giới hạn"}
                        </BodyTableCell>
                        <BodyTableCell>
                          <Box display="flex" flexDirection="column" gap={0.5}>
                            <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                              <CalendarTodayIcon fontSize="small" color="primary" />
                              <Typography variant="body2">
                                {formatDate(coupon?.StartDate)}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">đến</Typography>
                            <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                              <CalendarTodayIcon fontSize="small" color="error" />
                              <Typography variant="body2">
                                {formatDate(coupon?.EndDate)}
                              </Typography>
                            </Box>
                          </Box>
                        </BodyTableCell>
                        <BodyTableCell>
                          <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                            <InventoryIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {coupon?.QuantityAvailable || 0}
                            </Typography>
                          </Box>
                        </BodyTableCell>
                        <BodyTableCell>
                          <CouponActiveChip
                            label={isCouponActive(coupon) ? "Đang áp dụng" : "Hết hạn"}
                            isActive={isCouponActive(coupon)}
                            size="small"
                          />
                        </BodyTableCell>
                        <ActionButtonsCell>
                          <Box display="flex" justifyContent="center" gap={2}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setEditingCoupon({ ...coupon });
                                setOpenEditDialog(true);
                              }}
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
                              onClick={() => openDeleteConfirmDialog(coupon)}
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
                    ))}
                  </TableBody>
                </Table>
              </ScrollableWrapper>
            </>
          )}
        </Box>
      )}

      {/* Dialog to add a new coupon */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: { borderRadius: 2, overflow: 'hidden' }
        }}
      >
        <StyledDialogTitle>
          <LocalOfferIcon />
          Thêm Mã Giảm Giá
        </StyledDialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Tên mã"
                name="Name"
                fullWidth
                value={newCoupon.Name}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
                required
                helperText="Tên dễ nhớ cho mã giảm giá"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Mã giảm giá"
                name="Code"
                fullWidth
                value={newCoupon.Code}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
                required
                helperText="Mã code khách hàng sẽ nhập (VD: SUMMER2023)"
              />
            </Grid>
            <Grid item xs={12}>
              <Divider />
              <FormSectionTitle>
                <MonetizationOnIcon />
                Thông tin giảm giá
              </FormSectionTitle>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Số tiền giảm (đ)"
                name="DiscountAmount"
                type="number"
                fullWidth
                value={newCoupon.DiscountAmount}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
                helperText="Giảm theo số tiền cố định"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="% Giảm giá"
                name="DiscountPercentage"
                type="number"
                fullWidth
                value={newCoupon.DiscountPercentage}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
                InputProps={{
                  endAdornment: <Box component="span">%</Box>,
                }}
                helperText="Giảm theo phần trăm đơn hàng"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Giảm tối đa (đ)"
                name="MaxDiscountAmount"
                type="number"
                fullWidth
                value={newCoupon.MaxDiscountAmount}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
                helperText="Áp dụng khi giảm theo % (0 = không giới hạn)"
              />
            </Grid>
            <Grid item xs={12}>
              <Divider />
              <FormSectionTitle>
                <CalendarTodayIcon />
                Thời gian áp dụng
              </FormSectionTitle>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Ngày bắt đầu"
                name="StartDate"
                type="date"
                fullWidth
                value={newCoupon.StartDate}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Ngày kết thúc"
                name="EndDate"
                type="date"
                fullWidth
                value={newCoupon.EndDate}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Divider />
              <FormSectionTitle>
                <InventoryIcon />
                Điều kiện áp dụng
              </FormSectionTitle>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Đơn hàng tối thiểu (đ)"
                name="MinimumOrderAmount"
                type="number"
                fullWidth
                value={newCoupon.MinimumOrderAmount}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
                helperText="Giá trị đơn hàng tối thiểu để sử dụng mã (0 = không giới hạn)"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Số lượng phát hành"
                name="QuantityAvailable"
                type="number"
                fullWidth
                value={newCoupon.QuantityAvailable}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
                required
                helperText="Số lượng mã có thể sử dụng (yêu cầu > 0)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <StyledButton customvariant="cancel" onClick={() => setOpenDialog(false)}>
            Hủy
          </StyledButton>
          <StyledButton customvariant="save" onClick={handleAddCoupon}>
            Thêm
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Dialog to edit a coupon */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: { borderRadius: 2, overflow: 'hidden' }
        }}
      >
        <StyledDialogTitle>
          <EditIcon />
          Cập nhật Mã Giảm Giá
        </StyledDialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {editingCoupon && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Tên mã"
                  name="Name"
                  fullWidth
                  value={editingCoupon.Name || ""}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, Name: e.target.value })}
                  margin="normal"
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Mã giảm giá"
                  name="Code"
                  fullWidth
                  value={editingCoupon.Code || ""}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, Code: e.target.value })}
                  margin="normal"
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Divider />
                <FormSectionTitle>
                  <MonetizationOnIcon />
                  Thông tin giảm giá
                </FormSectionTitle>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Số tiền giảm (đ)"
                  name="DiscountAmount"
                  type="number"
                  fullWidth
                  value={editingCoupon.DiscountAmount || 0}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, DiscountAmount: e.target.value })}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="% Giảm giá"
                  name="DiscountPercentage"
                  type="number"
                  fullWidth
                  value={editingCoupon.DiscountPercentage || 0}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, DiscountPercentage: e.target.value })}
                  margin="normal"
                  variant="outlined"
                  InputProps={{
                    endAdornment: <Box component="span">%</Box>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Giảm tối đa (đ)"
                  name="MaxDiscountAmount"
                  type="number"
                  fullWidth
                  value={editingCoupon.MaxDiscountAmount || 0}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, MaxDiscountAmount: e.target.value })}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <Divider />
                <FormSectionTitle>
                  <CalendarTodayIcon />
                  Thời gian áp dụng
                </FormSectionTitle>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Ngày bắt đầu"
                  name="StartDate"
                  type="date"
                  fullWidth
                  value={
                    editingCoupon.StartDate
                      ? new Date(editingCoupon.StartDate).toISOString().split('T')[0]
                      : ""
                  }
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, StartDate: e.target.value })}
                  margin="normal"
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Ngày kết thúc"
                  name="EndDate"
                  type="date"
                  fullWidth
                  value={
                    editingCoupon.EndDate
                      ? new Date(editingCoupon.EndDate).toISOString().split('T')[0]
                      : ""
                  }
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, EndDate: e.target.value })}
                  margin="normal"
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Divider />
                <FormSectionTitle>
                  <InventoryIcon />
                  Điều kiện áp dụng
                </FormSectionTitle>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Đơn hàng tối thiểu (đ)"
                  name="MinimumOrderAmount"
                  type="number"
                  fullWidth
                  value={editingCoupon.MinimumOrderAmount || 0}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, MinimumOrderAmount: e.target.value })}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Số lượng còn lại"
                  name="QuantityAvailable"
                  type="number"
                  fullWidth
                  value={editingCoupon.QuantityAvailable || 0}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, QuantityAvailable: e.target.value })}
                  margin="normal"
                  variant="outlined"
                  required
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <StyledButton customvariant="cancel" onClick={() => setOpenEditDialog(false)}>
            Hủy
          </StyledButton>
          <StyledButton customvariant="save" onClick={handleUpdateCoupon}>
            Cập nhật
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDeleteDialog}
        onClose={() => setConfirmDeleteDialog(false)}
        PaperProps={{
          sx: { borderRadius: 2, overflow: 'hidden' }
        }}
      >
        <DialogTitle sx={{
          bgcolor: 'error.main',
          color: 'error.contrastText',
          display: 'flex',
          alignItems: 'center',
          px: 3,
          py: 2
        }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Xác nhận xóa mã giảm giá
        </DialogTitle>
        <DialogContent sx={{ p: 3, minWidth: '400px' }}>
          <Box>
            <Typography variant="body1" mb={1}>
              Bạn có chắc chắn muốn xóa mã giảm giá sau?
            </Typography>
            {couponToDelete && (
              <Box sx={{
                mt: 2,
                p: 2,
                bgcolor: 'grey.100',
                borderRadius: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}>
                <Typography variant="subtitle1" color="primary.main" fontWeight={600}>
                  {couponToDelete.Code}
                </Typography>
                <Typography variant="body2">
                  {couponToDelete.Name}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  {Number(couponToDelete?.DiscountPercentage) > 0 && (
                    <Chip
                      label={`${couponToDelete.DiscountPercentage}%`}
                      size="small"
                      color="primary"
                    />
                  )}
                  {Number(couponToDelete?.DiscountAmount) > 0 && (
                    <Chip
                      label={`${formatNumber(couponToDelete.DiscountAmount)}đ`}
                      size="small"
                      color="secondary"
                    />
                  )}
                </Box>
              </Box>
            )}
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              <b>Lưu ý:</b> Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến mã giảm giá này sẽ bị xóa vĩnh viễn.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <StyledButton customvariant="cancel" onClick={() => setConfirmDeleteDialog(false)}>
            Hủy
          </StyledButton>
          <StyledButton customvariant="delete" onClick={handleDeleteCoupon} startIcon={<DeleteIcon />}>
            Xác nhận xóa
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CouponsManagement;