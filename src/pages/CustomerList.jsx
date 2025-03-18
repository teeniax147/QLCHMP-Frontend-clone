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
} from "@mui/material";
import { API_BASE_URL } from '../config';
import { jwtDecode } from "jwt-decode"; // Ensure this is imported

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
    membershipLevelId: 1, // Add this field
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
  // Modify your cleanData function to better handle the API response structure
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
    <Box sx={{ mt: 5, mx: "auto", maxWidth: 800 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
        Danh Sách Khách Hàng
      </Typography>
      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: "", text: "" })}>
          {message.text}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên</TableCell>
                <TableCell>Địa chỉ</TableCell>
                <TableCell>Tổng Chi Tiêu</TableCell>
                <TableCell>Cấp Độ</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <TableRow key={customer.customerId || `customer-${Math.random()}`}>
                    <TableCell>
                      {customer.user.firstName} {customer.user.lastName}
                    </TableCell>
                    <TableCell>{customer.address}</TableCell>
                    <TableCell>{customer.totalSpending.toLocaleString()} VND</TableCell>
                    <TableCell>{customer.membershipLevel}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleEdit(customer)}
                        sx={{ mr: 1 }}
                        disabled={!hasRole("Customer")}
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDelete(customer)}
                        disabled={!hasRole("Admin")}
                      >
                        Xóa
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Không có dữ liệu khách hàng.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Modal */}
      <Modal open={isEditOpen} onClose={() => setIsEditOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            p: 4,
            borderRadius: 1,
          }}
        >
          {selectedCustomer ? (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Chỉnh Sửa Khách Hàng: {selectedCustomer.user.firstName} {selectedCustomer.user.lastName}
              </Typography>
              <TextField
                fullWidth
                label="Địa chỉ"
                name="address"
                value={formData.address}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
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
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdate}
                >
                  Cập Nhật
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setIsEditOpen(false)}
                >
                  Hủy
                </Button>
              </Box>
            </>
          ) : (
            <Typography variant="h6" sx={{ textAlign: "center" }}>
              Dữ liệu không hợp lệ!
            </Typography>
          )}
        </Box>
      </Modal>

      {/* Delete Modal */}
      <Modal open={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            p: 4,
            borderRadius: 1,
          }}
        >
          {selectedCustomer ? (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Bạn có chắc chắn muốn xóa khách hàng này?
              </Typography>
              <Typography sx={{ mb: 3 }}>
                Tên: <strong>{selectedCustomer.user.firstName} {selectedCustomer.user.lastName}</strong>
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDeleteConfirm}
                >
                  Xóa
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setIsDeleteOpen(false)}
                >
                  Hủy
                </Button>
              </Box>
            </>
          ) : (
            <Typography variant="h6" sx={{ textAlign: "center" }}>
              Dữ liệu không hợp lệ!
            </Typography>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default CustomerList;