import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Alert,
  Modal,
  TextField,
  CircularProgress,
  Container,
  Divider,
  styled,
  alpha,
} from "@mui/material";
import { API_BASE_URL } from '../config';
import { jwtDecode } from "jwt-decode";
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StarIcon from '@mui/icons-material/Star';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// Styled Components
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
}));

const ActionButtonsCell = styled(TableCell)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(1),
  whiteSpace: 'nowrap',
}));

const ActionButton = styled(Button)(({ theme, buttontype }) => ({
  borderRadius: 8,
  padding: '6px 12px',
  marginRight: theme.spacing(1),
  fontSize: '13px',
  fontWeight: 500,
  textTransform: 'none',
  transition: 'all 0.2s ease',

  ...(buttontype === 'edit' && {
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
    },
  }),

  ...(buttontype === 'delete' && {
    borderColor: theme.palette.error.main,
    color: theme.palette.error.main,
    '&:hover': {
      backgroundColor: alpha(theme.palette.error.main, 0.1),
    },
  }),
}));

const ModalBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 8,
  boxShadow: 24,
  overflow: 'hidden',
}));

const ModalHeader = styled(Box)(({ theme, modaltype }) => ({
  padding: theme.spacing(2),
  backgroundColor: modaltype === 'delete' ? theme.palette.error.main : theme.palette.primary.main,
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  '& svg': {
    marginRight: theme.spacing(1),
  }
}));

const ModalContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const ModalActions = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  padding: theme.spacing(3),
  paddingTop: theme.spacing(1),
}));

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
    backgroundColor: '#2196f3',
    borderRadius: '10px',
    border: '3px solid #f1f1f1',
    '&:hover': {
      backgroundColor: '#1976d2',
    },
  }
}));

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState([]);
  const [formData, setFormData] = useState({
    address: "",
    totalSpending: 0,
    membershipLevelId: 1,
  });

  // Get user roles from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Handle different role formats (string or array)
        const roles = decoded.role || decoded.roles || [];
        setUserRoles(Array.isArray(roles) ? roles : [roles]);
        console.log("User roles:", Array.isArray(roles) ? roles : [roles]);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  // Fetch customers list
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          setMessage({ type: "error", text: "Bạn chưa đăng nhập. Vui lòng đăng nhập để xem danh sách khách hàng." });
          setLoading(false);
          return;
        }

        console.log("Đang gửi yêu cầu đến:", `${API_BASE_URL}/Customers`);

        const response = await axios.get(`${API_BASE_URL}/Customers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Log the raw response for debugging
        console.log("Raw API response:", response);
        console.log("API data format:", typeof response.data, response.data);

        // Try to understand if the data is what we expect
        if (Array.isArray(response.data)) {
          console.log("Response is an array with length:", response.data.length);
        } else if (response.data && response.data.$values) {
          console.log("Response has $values with length:", response.data.$values.length);
        } else {
          console.log("Response structure is unexpected:", response.data);
        }

        const cleanedData = cleanData(response.data);
        console.log("Dữ liệu đã xử lý:", cleanedData);

        setCustomers(cleanedData);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải danh sách khách hàng:", error);
        setMessage({
          type: "error",
          text: `Không thể tải danh sách khách hàng. Lỗi: ${error.response?.data?.message || error.message}`
        });
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Process data returned from API
  const cleanData = (data) => {
    // First determine if we're dealing with an array or object with $values
    const customersArray = Array.isArray(data) ? data :
      (data.$values ? data.$values : []);

    return customersArray.map((customer) => {
      // Check if we're dealing with a user object or nested user data
      const userInfo = customer.User || customer;

      return {
        customerId: customer.CustomerId || customer.customerId || customer.id || "",
        userId: customer.UserId || customer.userId,
        address: customer.Address && customer.Address !== "string" && customer.Address !== ""
          ? customer.Address
          : (customer.address && customer.address !== "" ? customer.address : "Không có địa chỉ"),
        totalSpending: customer.TotalSpending || customer.totalSpending || 0,
        membershipLevelId: customer.MembershipLevelId || customer.membershipLevelId || 1,
        membershipLevel: customer.MembershipLevel?.LevelName ||
          customer.membershipLevel ||
          (customer.MembershipLevelId === 1 || customer.membershipLevelId === 1 ? "Thành Viên" : "Không có cấp độ"),
        user: {
          firstName: userInfo.FirstName || userInfo.firstName || userInfo.userName || "",
          lastName: userInfo.LastName || userInfo.lastName || "",
          email: userInfo.Email || userInfo.email || "",
          phoneNumber: userInfo.PhoneNumber || userInfo.phoneNumber || "",
        },
      };
    });
  };

  // Check if user has the required role
  const hasRole = (role) => {
    return userRoles.includes(role);
  };

  // Handle edit button click
  const handleEdit = (customer) => {
    if (!hasRole("Customer")) {
      setMessage({
        type: "error",
        text: "Bạn không có quyền chỉnh sửa thông tin khách hàng. Vui lòng đăng nhập với tài khoản có quyền Customer."
      });
      return;
    }

    setSelectedCustomer(customer);
    setFormData({
      address: customer.address,
      totalSpending: customer.totalSpending,
      membershipLevelId: customer.membershipLevelId || 1,
    });
    setIsEditOpen(true);
  };

  // Handle delete button click
  const handleDelete = (customer) => {
    if (!hasRole("Admin")) {
      setMessage({
        type: "error",
        text: "Bạn không có quyền xóa khách hàng. Vui lòng đăng nhập với tài khoản có quyền Admin."
      });
      return;
    }

    setSelectedCustomer(customer);
    setIsDeleteOpen(true);
  };

  // Update customer information
  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({ type: "error", text: "Bạn chưa đăng nhập." });
        return;
      }

      if (!hasRole("Customer")) {
        setMessage({
          type: "error",
          text: "Bạn không có quyền cập nhật thông tin khách hàng."
        });
        return;
      }

      console.log("Đang gửi dữ liệu cập nhật:", {
        address: formData.address,
        totalSpending: Number(formData.totalSpending),
        membershipLevelId: Number(formData.membershipLevelId)
      });

      const response = await axios.put(
        `${API_BASE_URL}/Customers/${selectedCustomer.customerId}`,
        {
          address: formData.address,
          totalSpending: Number(formData.totalSpending),
          membershipLevelId: Number(formData.membershipLevelId)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log("Kết quả cập nhật:", response.data);

      setCustomers((prev) =>
        prev.map((c) =>
          c.customerId === selectedCustomer.customerId
            ? {
              ...c,
              address: formData.address,
              totalSpending: Number(formData.totalSpending),
              membershipLevelId: Number(formData.membershipLevelId)
            }
            : c
        )
      );
      setMessage({ type: "success", text: "Cập nhật thành công!" });
      setIsEditOpen(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật khách hàng:", error);
      setMessage({
        type: "error",
        text: `Cập nhật thất bại! Lỗi: ${error.response?.data?.message || error.message}`
      });
    }
  };

  // Delete customer
  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({ type: "error", text: "Bạn chưa đăng nhập." });
        return;
      }

      if (!hasRole("Admin")) {
        setMessage({
          type: "error",
          text: "Bạn không có quyền xóa khách hàng."
        });
        return;
      }

      await axios.delete(
        `${API_BASE_URL}/Customers/${selectedCustomer.customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCustomers((prev) =>
        prev.filter((customer) => customer.customerId !== selectedCustomer.customerId)
      );
      setMessage({ type: "success", text: "Xóa khách hàng thành công!" });
      setIsDeleteOpen(false);
    } catch (error) {
      console.error("Lỗi khi xóa khách hàng:", error);
      setMessage({
        type: "error",
        text: `Xóa khách hàng thất bại! Lỗi: ${error.response?.data?.message || error.message}`
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <PageTitle variant="h4">
          <PersonIcon fontSize="large" />
          Quản Lý Khách Hàng
        </PageTitle>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Alerts */}
      {message.text && (
        <Alert
          severity={message.type}
          sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}
          onClose={() => setMessage({ type: "", text: "" })}
        >
          {message.text}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={5}>
          <CircularProgress />
          <Typography ml={2} variant="body1" color="text.secondary">
            Đang tải danh sách khách hàng...
          </Typography>
        </Box>
      ) : (
        <Box sx={{ mt: 3 }}>


          <ScrollableWrapper>
            <Table sx={{ minWidth: 800 }}>
              <StyledTableHead>
                <TableRow>
                  <HeaderTableCell>
                    <Box display="flex" alignItems="center" justifyContent="center">
                      <AccountCircleIcon sx={{ mr: 1 }} />
                      Tên Khách Hàng
                    </Box>
                  </HeaderTableCell>

                  <HeaderTableCell>Email</HeaderTableCell>
                  <HeaderTableCell>Số Điện Thoại</HeaderTableCell>
                  <HeaderTableCell>
                    <Box display="flex" alignItems="center" justifyContent="center">
                      <AttachMoneyIcon sx={{ mr: 1 }} />
                      Tổng Chi Tiêu
                    </Box>
                  </HeaderTableCell>
                  <HeaderTableCell>
                    <Box display="flex" alignItems="center" justifyContent="center">
                      <StarIcon sx={{ mr: 1 }} />
                      Cấp Độ
                    </Box>
                  </HeaderTableCell>
                  <HeaderTableCell>Thao Tác</HeaderTableCell>
                </TableRow>
              </StyledTableHead>
              <TableBody>
                {customers.length > 0 ? (
                  customers.map((customer) => (
                    <StyledTableRow key={customer.customerId || `customer-${Math.random()}`}>
                      <BodyTableCell>
                        <Typography fontWeight={500}>
                          {customer.user.firstName} {customer.user.lastName}
                        </Typography>
                      </BodyTableCell>

                      <BodyTableCell>{customer.user.email}</BodyTableCell>
                      <BodyTableCell>{customer.user.phoneNumber || "Không có"}</BodyTableCell>
                      <BodyTableCell>{customer.totalSpending.toLocaleString()} VND</BodyTableCell>
                      <BodyTableCell>{customer.membershipLevel}</BodyTableCell>
                      <ActionButtonsCell>
                        <Box display="flex" justifyContent="center">
                          <ActionButton
                            variant="outlined"
                            buttontype="edit"
                            size="small"
                            onClick={() => handleEdit(customer)}
                            disabled={!hasRole("Customer")}
                            startIcon={<EditIcon />}
                          >
                            Sửa
                          </ActionButton>
                          <ActionButton
                            variant="outlined"
                            buttontype="delete"
                            size="small"
                            onClick={() => handleDelete(customer)}
                            disabled={!hasRole("Admin")}
                            startIcon={<DeleteIcon />}
                          >
                            Xóa
                          </ActionButton>
                        </Box>
                      </ActionButtonsCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1" color="text.secondary">
                        Không có dữ liệu khách hàng.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollableWrapper>
        </Box>
      )}

      {/* Edit Modal */}
      <Modal open={isEditOpen} onClose={() => setIsEditOpen(false)}>
        <ModalBox>
          <ModalHeader modaltype="edit">
            <EditIcon />
            <Typography variant="h6">
              Chỉnh Sửa Thông Tin Khách Hàng
            </Typography>
          </ModalHeader>
          {selectedCustomer ? (
            <>
              <ModalContent>
                <Typography variant="subtitle1" fontWeight={500} mb={2}>
                  Khách hàng: {selectedCustomer.user.firstName} {selectedCustomer.user.lastName}
                </Typography>

                <TextField
                  fullWidth
                  label="Tổng Chi Tiêu"
                  name="totalSpending"
                  type="number"
                  value={formData.totalSpending}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Cấp Độ Thành Viên ID"
                  name="membershipLevelId"
                  type="number"
                  value={formData.membershipLevelId}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
              </ModalContent>
              <ModalActions>
                <Button
                  variant="outlined"
                  onClick={() => setIsEditOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdate}
                >
                  Cập Nhật
                </Button>
              </ModalActions>
            </>
          ) : (
            <ModalContent>
              <Typography variant="h6" sx={{ textAlign: "center" }}>
                Dữ liệu không hợp lệ!
              </Typography>
            </ModalContent>
          )}
        </ModalBox>
      </Modal>

      {/* Delete Modal */}
      <Modal open={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
        <ModalBox>
          <ModalHeader modaltype="delete">
            <DeleteIcon />
            <Typography variant="h6">
              Xác Nhận Xóa Khách Hàng
            </Typography>
          </ModalHeader>
          {selectedCustomer ? (
            <>
              <ModalContent>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Bạn có chắc chắn muốn xóa khách hàng này?
                </Typography>
                <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, mb: 2 }}>
                  <Typography variant="body2" mb={1}>
                    <strong>Tên:</strong> {selectedCustomer.user.firstName} {selectedCustomer.user.lastName}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Email:</strong> {selectedCustomer.user.email}
                  </Typography>
                  <Typography variant="body2" color="error">
                    Hành động này không thể hoàn tác!
                  </Typography>
                </Box>
              </ModalContent>
              <ModalActions>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setIsDeleteOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDeleteConfirm}
                >
                  Xác Nhận Xóa
                </Button>
              </ModalActions>
            </>
          ) : (
            <ModalContent>
              <Typography variant="h6" sx={{ textAlign: "center" }}>
                Dữ liệu không hợp lệ!
              </Typography>
            </ModalContent>
          )}
        </ModalBox>
      </Modal>
    </Container>
  );
};

export default CustomerList;