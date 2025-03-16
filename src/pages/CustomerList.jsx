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
} from "@mui/material";
import { API_BASE_URL } from '../config'
const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    address: "",
    totalSpending: 0,
  });

  // Fetch danh sách khách hàng
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/Customers`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const cleanedData = cleanData(response.data);
        setCustomers(cleanedData);
      } catch (error) {
        console.error("Lỗi khi tải danh sách khách hàng:", error);
        setMessage({ type: "error", text: "Không thể tải danh sách khách hàng." });
      }
    };

    fetchCustomers();
  }, []);

  // Hàm xử lý dữ liệu trả về từ API
  const cleanData = (data) => {
    return data.$values.map((customer) => ({
      customerId: customer.CustomerId,
      userId: customer.UserId,
      address: customer.Address && customer.Address !== "string" ? customer.Address : "Không có địa chỉ",
      totalSpending: customer.TotalSpending || 0,
      membershipLevel: customer.MembershipLevel
        ? customer.MembershipLevel.LevelName
        : "Không có cấp độ",
      user: {
        firstName: customer.User?.FirstName && customer.User?.FirstName !== "string" ? customer.User?.FirstName : "",
        lastName: customer.User?.LastName && customer.User?.LastName !== "string" ? customer.User?.LastName : "",
        email: customer.User?.Email || "",
        phoneNumber: customer.User?.PhoneNumber || "",
      },
    }));
  };

  // Xử lý khi nhấn sửa
  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      address: customer.address,
      totalSpending: customer.totalSpending,
    });
    setIsEditOpen(true);
  };

  // Xử lý khi nhấn xóa
  const handleDelete = (customer) => {
    setSelectedCustomer(customer);
    setIsDeleteOpen(true);
  };

  // Cập nhật thông tin khách hàng
  const handleUpdate = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/Customers/${selectedCustomer.customerId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setCustomers((prev) =>
        prev.map((c) =>
          c.customerId === selectedCustomer.customerId
            ? { ...selectedCustomer, ...formData }
            : c
        )
      );
      setMessage({ type: "success", text: "Cập nhật thành công!" });
      setIsEditOpen(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật khách hàng:", error);
      setMessage({ type: "error", text: "Cập nhật thất bại!" });
    }
  };

  // Xóa khách hàng
  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(
        `${API_BASE_URL}/Customers/${selectedCustomer.customerId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
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
      setMessage({ type: "error", text: "Xóa khách hàng thất bại!" });
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
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên</TableCell>
              <TableCell>Địa chỉ</TableCell>
              <TableCell>Tổng Chi Tiêu</TableCell>
              <TableCell>Cấp Độ</TableCell>
             
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.length > 0 ? (
              customers.map((customer) => (
                <TableRow key={customer.customerId}>
                  <TableCell>
                    {customer.user.firstName} {customer.user.lastName}
                  </TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>{customer.totalSpending}</TableCell>
                  <TableCell>{customer.membershipLevel}</TableCell>
                  
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

      {/* Modal chỉnh sửa */}
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
                Chỉnh Sửa Khách Hàng
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
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdate}
                fullWidth
              >
                Cập Nhật
              </Button>
            </>
          ) : (
            <Typography variant="h6" sx={{ textAlign: "center" }}>
              Dữ liệu không hợp lệ!
            </Typography>
          )}
        </Box>
      </Modal>

      {/* Modal xóa */}
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
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDeleteConfirm}
                >
                  Xóa
                </Button>
                <Button
                  variant="contained"
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
