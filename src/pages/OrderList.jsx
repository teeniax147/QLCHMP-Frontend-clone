import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,

} from "@mui/material";
import { API_BASE_URL } from '../config'
import "./OrderList.css";
const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");


  const tabLabels = [
    "Tất cả",
    "Chờ xác nhận",
    "Chờ lấy hàng",
    "Đang giao hàng",
    "Đã giao",
    "Đã hủy",
  ];

  // **Lọc đơn hàng theo trạng thái**
  const filteredOrders = () => {
    return orders.filter((order) => {
      const status = order.Status;
      switch (activeTab) {
        case 1:
          return status === "Chờ Xác Nhận";
        case 2:
          return status === "Chờ Lấy Hàng";
        case 3:
          return status === "Đang Giao Hàng";
        case 4:
          return status === "Đã Giao";
        case 5:
          return status === "Đã Hủy";
        default:
          return true;
      }
    });
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${API_BASE_URL}/Orders/customer/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data && response.data.$values) {
        setOrders(response.data.$values);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err.response?.data || err.message);
      setError(err.response?.data || "Có lỗi xảy ra khi lấy danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const cancelOrder = async (orderId, orderStatus) => {
    if (!window.confirm('Bạn có muốn hủy đơn hàng không?')) {
      return;
    }

    if (orderStatus !== "Chờ Xác Nhận") {
      alert("Chỉ có thể hủy các đơn hàng đang ở trạng thái Chờ Xác Nhận.");
      return;
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/Orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(response.data);

      // Cập nhật danh sách đơn hàng ngay lập tức
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.Id === orderId ? { ...order, Status: "Đã Hủy" } : order
        )
      );
    } catch (err) {
      console.error("Error canceling order:", err.response?.data || err.message);
      alert(err.response?.data || "Có lỗi xảy ra khi hủy đơn hàng.");
    }
  };



  // **Gửi đánh giá sản phẩm**
  const submitFeedback = async () => {
    if (!rating) {
      alert("Vui lòng chọn số sao để đánh giá!");
      return;
    }

    if (!selectedProduct || !selectedProduct.ProductId) {
      alert("Không tìm thấy sản phẩm để đánh giá!");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/ProductFeedbacks/add`,
        {
          ProductId: selectedProduct.ProductId,
          Rating: rating,
          ReviewText: reviewText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(response.data);
      setRatingModal(false);
      setSelectedProduct(null);
      setRating(0);
      setReviewText("");

      // Làm mới danh sách đơn hàng
      await fetchOrders();

      // Chuyển sang tab "Đã giao"
      setActiveTab(4);
    } catch (err) {
      console.error("Error submitting feedback:", err.response?.data || err.message);
      alert(err.response?.data || "Có lỗi xảy ra khi gửi đánh giá.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);


  return (
    <div style={{ padding: "20px", marginTop: "70px" }}>
      <Typography variant="h4" align="center" fontSize={"30px"} fontWeight={"bold"} gutterBottom>
        DANH SÁCH ĐƠN HÀNG
      </Typography>

      {/* Tabs trạng thái */}
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        centered
        indicatorColor="primary"
        textColor="primary"
        style={{ marginBottom: "20px" }}
      >
        {tabLabels.map((label, index) => (
          <Tab key={index} label={label} />
        ))}
      </Tabs>

      {/* Nội dung */}
      {loading ? (
        <Typography>Đang tải dữ liệu...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center" sx={{ fontWeight: "bold", width: "0%", fontSize: "16px" }}>STT</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", width: "5%", fontSize: "16px" }}>Ngày đặt</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", width: "7%", fontSize: "16px" }}>Trạng thái</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", width: "5%", fontSize: "16px" }}>Khách hàng</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", width: "10%", fontSize: "16px" }}>Địa chỉ giao hàng</TableCell>

                <TableCell align="center" sx={{ fontWeight: "bold", width: "5%", fontSize: "16px" }}>Tổng tiền</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", width: "5%", fontSize: "16px" }}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders().map((order, index) => (
                <TableRow key={order.Id}>
                  <TableCell align="center">{index + 1}</TableCell>
                  <TableCell align="center">{order.OrderDate}</TableCell>
                  <TableCell align="center">{order.Status}</TableCell>
                  <TableCell align="center">{order.CustomerName}</TableCell>
                  <TableCell align="center">{order.ShippingAddress}</TableCell>

                  <TableCell align="center">{order.TotalAmount.toLocaleString()} VND</TableCell>
                  <TableCell align="center">
                    <div className="order-action-buttons">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate(`/order-details/${order.Id}`)}
                      >
                        Xem chi tiết
                      </Button>
                      {order.Status === "Chờ Xác Nhận" && (
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => cancelOrder(order.Id, order.Status)}
                        >
                          Hủy đơn hàng
                        </Button>
                      )}
                    </div>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}






    </div>
  );
};

export default OrderList;
