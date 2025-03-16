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
  Button,
  Select,
  MenuItem,
  TextField,
  Modal,
  Box,
  Pagination,
  Typography,
} from "@mui/material";
import { API_BASE_URL } from '../config'
const OrderManager = () => {
  const [orders, setOrders] = useState([]); // Danh sách đơn hàng
  const [loading, setLoading] = useState(false); // Trạng thái tải
  const [error, setError] = useState(null); // Trạng thái lỗi
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [pageSize] = useState(10); // Số lượng đơn hàng mỗi trang
  const [totalOrders, setTotalOrders] = useState(0); // Tổng số đơn hàng
  const [selectedOrder, setSelectedOrder] = useState(null); // Đơn hàng được chọn
  const [modalOpen, setModalOpen] = useState(false); // Trạng thái mở modal
  const [newStatus, setNewStatus] = useState(""); // Trạng thái mới
  const [newPaymentStatus, setNewPaymentStatus] = useState(""); // Trạng thái thanh toán mới
  const [cancelModalOpen, setCancelModalOpen] = useState(false); // Trạng thái mở modal hủy

  const orderStatusOptions = [
    "Chờ Xác Nhận",
    "Chờ Lấy Hàng",
    "Đang Giao Hàng",
    "Đã Giao",
  ];

  // Lấy danh sách đơn hàng
  const fetchOrders = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token không hợp lệ. Vui lòng đăng nhập lại.");
      }

      const response = await axios.get(
        `${API_BASE_URL}/Orders/all-orders?pageNumber=${page}&pageSize=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      if (!data || !data.Orders || !data.Orders.$values) {
        throw new Error("Dữ liệu từ API không hợp lệ.");
      }

      setOrders(data.Orders.$values || []);
      setTotalOrders(data.TotalOrders || 0);
      setCurrentPage(data.CurrentPage || 1);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đơn hàng:", error);
      setError(
        error.message || "Không thể tải danh sách đơn hàng. Vui lòng thử lại!"
      );
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật trạng thái đơn hàng
  const handleUpdateOrder = async () => {
    if (!selectedOrder || !selectedOrder.Id) {
      alert("Đơn hàng không hợp lệ.");
      return;
    }

    const currentStatusIndex = orderStatusOptions.indexOf(selectedOrder.Status);
    const newStatusIndex = orderStatusOptions.indexOf(newStatus);

    if (newStatusIndex !== currentStatusIndex + 1) {
      alert(
        `Trạng thái mới không hợp lệ! Bạn chỉ có thể cập nhật sang trạng thái tiếp theo: "${orderStatusOptions[currentStatusIndex + 1]}".`
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token không hợp lệ. Vui lòng đăng nhập lại.");
      }

      await axios.put(
        `${API_BASE_URL}/Orders/${selectedOrder.Id}/update-status`,
        {
          Status: newStatus,
          PaymentStatus: newPaymentStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Cập nhật trạng thái đơn hàng thành công!");
      setModalOpen(false);
      fetchOrders(currentPage);
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      alert("Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại!");
    }
  };

  // Mở modal hủy đơn hàng
  const handleOpenCancelModal = (order) => {
    setSelectedOrder(order);
    setCancelModalOpen(true);
  };

  // Đóng modal hủy đơn hàng
  const handleCloseCancelModal = () => {
    setCancelModalOpen(false);
  };

  // Xử lý hủy đơn hàng
  const handleCancelOrder = async () => {
    if (!selectedOrder || !selectedOrder.Id) {
      alert("Đơn hàng không hợp lệ.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token không hợp lệ. Vui lòng đăng nhập lại.");
      }

      await axios.put(
        `${API_BASE_URL}/Orders/${selectedOrder.Id}/cancel-by-staff`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Đơn hàng đã được hủy thành công!");
      setCancelModalOpen(false);
      fetchOrders(currentPage);
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      alert("Không thể hủy đơn hàng. Vui lòng thử lại!");
    }
  };

  // Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchOrders(newPage);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div style={{ padding: "5px 0 0", marginTop: "40px", marginBottom: "20px" }}>

      <Typography variant="h4" align="center" gutterBottom>
        Quản Lý Đơn Hàng
      </Typography>

      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}

      {loading ? (
        <Typography>Đang tải...</Typography>
      ) : (
        <>
          <TableContainer
            component={Paper}
           
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", fontSize: "16px" }}
                  >
                    STT
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", fontSize: "16px" }}
                  >
                    Ngày đặt
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", fontSize: "16px" }}
                  >
                    Trạng thái
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", fontSize: "16px" }}
                  >
                    Tổng tiền
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", fontSize: "16px" }}
                  >
                    Địa chỉ giao hàng
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", fontSize: "16px" }}
                  >
                    Khách hàng
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", fontSize: "16px" }}
                  >
                    Hành động
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {orders.map((order, index) => (
                  <TableRow key={order.Id}>
                    <TableCell>
                      {index + 1 + (currentPage - 1) * pageSize}
                    </TableCell>
                    <TableCell>{order.OrderDate}</TableCell>
                    <TableCell>{order.Status}</TableCell>
                    <TableCell>
                      {order.TotalAmount?.toLocaleString()} VND
                    </TableCell>
                    <TableCell>{order.ShippingAddress}</TableCell>
                    <TableCell>{order.CustomerName}</TableCell>
                    <TableCell>
                      {order.Status !== "Đã Hủy" && (
                        <>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                              setSelectedOrder(order);
                              setNewStatus(order.Status || "");
                              setNewPaymentStatus(order.PaymentStatus || "");
                              setModalOpen(true);
                            }}
                          >
                            Cập nhật
                          </Button>
                          {order.Status !== "Đang Giao Hàng" &&
                            order.Status !== "Đã Giao" && (
                              <Button
                                variant="outlined"
                                color="error"
                                onClick={() => handleOpenCancelModal(order)}
                              >
                                Hủy
                              </Button>
                            )}
                        </>
                      )}
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Pagination
              count={Math.ceil(totalOrders / pageSize)}
              page={currentPage}
              onChange={(event, page) => handlePageChange(page)}
              color="primary"
              shape="rounded"
            />
          </div>
        </>
      )}

      {/* Modal cập nhật trạng thái */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            margin: "50px auto",
            width: "400px",
          }}
        >
          <Typography variant="h6">Cập nhật trạng thái</Typography>
          <Select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            fullWidth
          >
            {orderStatusOptions.map((status) => (
              <MenuItem value={status} key={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
          <TextField
            label="Trạng thái thanh toán"
            value={newPaymentStatus}
            onChange={(e) => setNewPaymentStatus(e.target.value)}
            fullWidth
            style={{ marginTop: "20px" }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleUpdateOrder}
            style={{ marginTop: "20px" }}
          >
            Lưu
          </Button>
        </Box>
      </Modal>

      {/* Modal hủy đơn hàng */}
      <Modal open={cancelModalOpen} onClose={handleCloseCancelModal}>
        <Box
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            margin: "50px auto",
            width: "400px",
          }}
        >
          <Typography variant="h6">Xác nhận hủy đơn hàng</Typography>
          <Typography>
            Bạn có chắc chắn muốn hủy đơn hàng{" "}
            <strong>#{selectedOrder?.Id}</strong> không?
          </Typography>
          <Box
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Button variant="contained" color="error" onClick={handleCancelOrder}>
              Đồng ý
            </Button>
            <Button variant="outlined" onClick={handleCloseCancelModal}>
              Hủy
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default OrderManager;
