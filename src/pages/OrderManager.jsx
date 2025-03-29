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
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  CircularProgress,
  Grid,
  Divider,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { API_BASE_URL } from '../config';
import "./OrderManager.css";

const OrderManager = () => {
  const [orders, setOrders] = useState([]); // Khởi tạo mảng rỗng
  const [loading, setLoading] = useState(false); // Trạng thái tải
  const [error, setError] = useState(null); // Trạng thái lỗi
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [pageSize, setPageSize] = useState(10); // Số lượng đơn hàng mỗi trang
  const [totalOrders, setTotalOrders] = useState(0); // Tổng số đơn hàng
  const [totalPages, setTotalPages] = useState(0); // Tổng số trang
  const [selectedOrder, setSelectedOrder] = useState(null); // Đơn hàng được chọn
  const [modalOpen, setModalOpen] = useState(false); // Trạng thái mở modal
  const [newStatus, setNewStatus] = useState(""); // Trạng thái mới
  const [cancelModalOpen, setCancelModalOpen] = useState(false); // Trạng thái mở modal hủy
  const [activeTab, setActiveTab] = useState(0); // Tab đang active
  const [orderDetails, setOrderDetails] = useState([]); // Chi tiết đơn hàng
  const [loadingDetails, setLoadingDetails] = useState(false); // Trạng thái tải chi tiết
  const [searchTerm, setSearchTerm] = useState(""); // Term tìm kiếm
  const [isSearching, setIsSearching] = useState(false); // Có đang tìm kiếm không

  // Thứ tự trạng thái đơn hàng (từ thấp đến cao)
  const orderStatusFlow = [
    "Chờ Xác Nhận",
    "Chờ Lấy Hàng",
    "Đang Giao Hàng",
    "Đã Giao"
  ];
  // Trạng thái đặc biệt không theo thứ tự
  const specialStatus = ["Đã Hủy"];

  const orderStatusOptions = [
    "Chờ Xác Nhận",
    "Chờ Lấy Hàng",
    "Đang Giao Hàng",
    "Đã Giao",
    "Đã Hủy"
  ];

  const tabLabels = [
    "Tất cả",
    "Chờ xác nhận",
    "Chờ lấy hàng",
    "Đang giao hàng",
    "Đã giao",
    "Đã hủy",
  ];

  // Lấy các trạng thái hợp lệ để cập nhật từ trạng thái hiện tại
  const getValidNextStatuses = (currentStatus) => {
    // Nếu đã hủy, không cho phép cập nhật sang trạng thái khác
    if (currentStatus === "Đã Hủy") {
      return ["Đã Hủy"];
    }

    const currentIndex = orderStatusFlow.indexOf(currentStatus);

    // Nếu trạng thái hiện tại không nằm trong luồng
    if (currentIndex === -1) {
      return [...orderStatusFlow, ...specialStatus];
    }

    // Lấy các trạng thái từ trạng thái hiện tại trở đi (không cho phép lùi lại)
    const validStatuses = orderStatusFlow.slice(currentIndex);

    // Luôn cho phép chuyển sang trạng thái Đã Hủy
    return [...validStatuses, "Đã Hủy"];
  };

  // Lọc đơn hàng theo trạng thái - phiên bản bảo vệ
  const filteredOrders = () => {
    // Kiểm tra kỹ lưỡng để đảm bảo orders là một mảng
    if (!orders) {
      console.warn("orders is undefined or null");
      return [];
    }

    if (!Array.isArray(orders)) {
      console.warn("orders is not an array:", orders);
      return [];
    }

    try {
      return orders.filter((order) => {
        if (!order) return false;

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
    } catch (error) {
      console.error("Error in filteredOrders:", error);
      return [];
    }
  };

  // Lấy danh sách đơn hàng - bao gồm cả tìm kiếm
  // Chỉnh sửa phần fetchOrders để gửi đúng trạng thái
  const fetchOrders = async (page = currentPage, size = pageSize, search = searchTerm, tabIndex = activeTab) => {
    setLoading(true);
    setError(null);

    // Reset orders để tránh lỗi khi chuyển trang
    setOrders([]);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token không hợp lệ. Vui lòng đăng nhập lại.");
      }

      // Xác định endpoint dựa trên có tìm kiếm hay không
      let endpoint = `${API_BASE_URL}/Orders/all-orders?pageNumber=${page}&pageSize=${size}`;
      let statusParam = "";

      // Nếu đang trên tab khác "Tất cả", cần lọc theo trạng thái
      if (tabIndex > 0 && tabIndex < tabLabels.length) {
        // Map từ index tab sang trạng thái chính xác trong DB
        switch (tabIndex) {
          case 1: statusParam = "Chờ Xác Nhận"; break;
          case 2: statusParam = "Chờ Lấy Hàng"; break;
          case 3: statusParam = "Đang Giao Hàng"; break;
          case 4: statusParam = "Đã Giao"; break;
          case 5: statusParam = "Đã Hủy"; break;
        }
      }

      // Nếu có search term, sử dụng endpoint search
      if (search.trim() !== "") {
        endpoint = `${API_BASE_URL}/Orders/search?searchTerm=${encodeURIComponent(search)}&pageNumber=${page}&pageSize=${size}`;
        // Thêm param status nếu có chọn tab
        if (statusParam) {
          endpoint += `&status=${encodeURIComponent(statusParam)}`;
        }
      }

      console.log(`Gọi API: ${endpoint} - Tab: ${tabIndex} - Status: ${statusParam}`);

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;
      console.log("API response:", data);

      // Xử lý dữ liệu response...
      if (!data) {
        console.warn("Empty data from API");
        setOrders([]);
        setTotalOrders(0);
        setTotalPages(0);
        return;
      }

      let processedOrders = [];

      // Kiểm tra các cấu trúc dữ liệu khác nhau
      if (data.Orders && Array.isArray(data.Orders)) {
        processedOrders = data.Orders;
      } else if (data.Orders && data.Orders.$values && Array.isArray(data.Orders.$values)) {
        processedOrders = data.Orders.$values;
      } else if (Array.isArray(data)) {
        processedOrders = data;
      } else if (data.$values && Array.isArray(data.$values)) {
        processedOrders = data.$values;
      } else {
        console.warn("Unknown data structure:", data);
        processedOrders = [];
      }

      // Validate data
      if (!Array.isArray(processedOrders)) {
        processedOrders = [];
      }

      // Final safety check
      processedOrders = processedOrders.filter(item => item != null);

      // Thêm bước lọc client-side nếu backend không lọc đúng
      if (statusParam && processedOrders.length > 0) {
        // Lọc một lần nữa ở client để đảm bảo
        const filteredOrders = processedOrders.filter(order =>
          order.Status === statusParam
        );

        // Chỉ áp dụng nếu kết quả không rỗng để tránh hiển thị rỗng khi API chưa hỗ trợ tốt
        if (filteredOrders.length > 0 || search.trim() !== "") {
          processedOrders = filteredOrders;
        }
      }

      console.log(`Sau khi lọc: ${processedOrders.length} đơn hàng`);

      setOrders(processedOrders);
      setTotalOrders(data.TotalOrders || processedOrders.length || 0);
      setCurrentPage(data.CurrentPage || page);
      setTotalPages(Math.ceil((data.TotalOrders || processedOrders.length || 0) / size));
    } catch (error) {
      console.error("Lỗi khi tải danh sách đơn hàng:", error);
      setError(
        error.message || "Không thể tải danh sách đơn hàng. Vui lòng thử lại!"
      );

      setOrders([]);
      setTotalOrders(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // Lấy chi tiết đơn hàng
  const fetchOrderDetails = async (orderId) => {
    if (!orderId) return;

    setLoadingDetails(true);
    setOrderDetails([]);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token không hợp lệ. Vui lòng đăng nhập lại.");
      }

      const response = await axios.get(
        `${API_BASE_URL}/Orders/orders/${orderId}/details`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;
      console.log("Order details response:", data);

      // Kiểm tra và xử lý cấu trúc dữ liệu
      let processedDetails = [];

      if (Array.isArray(data)) {
        processedDetails = data;
      } else if (data && Array.isArray(data.$values)) {
        processedDetails = data.$values;
      } else if (data && data.Items && Array.isArray(data.Items)) {
        processedDetails = data.Items;
      } else if (data && data.Items && data.Items.$values && Array.isArray(data.Items.$values)) {
        processedDetails = data.Items.$values;
      } else {
        console.warn("Unknown order details structure:", data);
        processedDetails = [];
      }

      // Validate data
      if (!Array.isArray(processedDetails)) {
        console.warn("Processed details is not an array:", processedDetails);
        processedDetails = [];
      }

      setOrderDetails(processedDetails.filter(item => item != null));
    } catch (error) {
      console.error("Lỗi khi tải chi tiết đơn hàng:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Xử lý thay đổi số lượng hiển thị
  const handlePageSizeChange = (event) => {
    const newSize = parseInt(event.target.value);
    setPageSize(newSize);
    setCurrentPage(1); // Reset về trang 1
    fetchOrders(1, newSize, searchTerm);
  };

  // Cập nhật trạng thái đơn hàng
  const handleUpdateOrder = async () => {
    if (!selectedOrder || !selectedOrder.OrderId) {
      alert("Đơn hàng không hợp lệ.");
      return;
    }

    // Kiểm tra xem trạng thái mới có hợp lệ không
    const validStatuses = getValidNextStatuses(selectedOrder.Status);
    if (!validStatuses.includes(newStatus)) {
      alert(`Không thể cập nhật từ trạng thái "${selectedOrder.Status}" sang "${newStatus}". Chỉ được phép tiến lên, không được lùi lại.`);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token không hợp lệ. Vui lòng đăng nhập lại.");
      }

      await axios.put(
        `${API_BASE_URL}/Orders/${selectedOrder.OrderId}/update-status`,
        {
          Status: newStatus,
          PaymentStatus: selectedOrder.PaymentStatus
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Cập nhật trạng thái đơn hàng thành công!");
      setModalOpen(false);
      fetchOrders(currentPage, pageSize, searchTerm);
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
    if (!selectedOrder || !selectedOrder.OrderId) {
      alert("Đơn hàng không hợp lệ.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token không hợp lệ. Vui lòng đăng nhập lại.");
      }

      await axios.put(
        `${API_BASE_URL}/Orders/${selectedOrder.OrderId}/cancel-by-staff`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Đơn hàng đã được hủy thành công!");
      setCancelModalOpen(false);
      fetchOrders(currentPage, pageSize, searchTerm);
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      alert("Không thể hủy đơn hàng. Vui lòng thử lại!");
    }
  };

  // Xử lý chuyển trang
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    fetchOrders(page, pageSize, searchTerm);
  };

  // Format ngày giờ
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "N/A";

    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) return dateTimeStr;

    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Cập nhật trạng thái đơn hàng nhanh
  const updateOrderStatus = async (orderId, newStatus) => {
    // Tìm đơn hàng hiện tại
    const currentOrder = orders.find(order => order.OrderId === orderId);
    if (!currentOrder) {
      alert("Không tìm thấy thông tin đơn hàng.");
      return;
    }

    // Kiểm tra xem trạng thái mới có hợp lệ không
    const validStatuses = getValidNextStatuses(currentOrder.Status);
    if (!validStatuses.includes(newStatus)) {
      alert(`Không thể cập nhật từ trạng thái "${currentOrder.Status}" sang "${newStatus}". Chỉ được phép tiến lên, không được lùi lại.`);
      return;
    }

    if (!window.confirm(`Bạn có chắc muốn chuyển đơn hàng sang trạng thái "${newStatus}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token không hợp lệ. Vui lòng đăng nhập lại.");
      }

      await axios.put(
        `${API_BASE_URL}/Orders/${orderId}/update-status`,
        {
          Status: newStatus,
          PaymentStatus: currentOrder.PaymentStatus
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Cập nhật trạng thái đơn hàng thành công!");

      // Cập nhật trạng thái đơn hàng trong danh sách
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.OrderId === orderId ? { ...order, Status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái đơn hàng:", err);
      alert("Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại!");
    }
  };

  // Mở modal và tải chi tiết đơn hàng
  const handleOpenDetailModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order?.Status || "");
    setModalOpen(true);
    fetchOrderDetails(order?.OrderId);
  };

  // Xử lý tìm kiếm
  const handleSearch = () => {
    setCurrentPage(1);
    setIsSearching(searchTerm.trim() !== "");
    fetchOrders(1, pageSize, searchTerm, activeTab);
  };
  // Xử lý xóa tìm kiếm
  const handleClearSearch = () => {
    setSearchTerm("");
    setIsSearching(false);
    setCurrentPage(1);
    fetchOrders(1, pageSize, "", activeTab);
  };

  // Xử lý khi nhấn Enter trong ô tìm kiếm
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Xử lý khi thay đổi tab
  const handleTabChange = (e, newValue) => {
    // Cập nhật tab active
    setActiveTab(newValue);

    // Phải reset page về 1 khi chuyển tab
    setCurrentPage(1);

    // Nếu đang tìm kiếm, cần tìm kiếm lại với trạng thái tab mới
    if (searchTerm.trim() !== "") {
      // Tạm thời hiển thị loading để người dùng biết đang xử lý
      setLoading(true);

      // Delay một chút để state được cập nhật
      setTimeout(() => {
        // Gọi lại hàm fetch với tab mới và search term hiện tại
        fetchOrders(1, pageSize, searchTerm, newValue);
      }, 100);
    } else {
      // Nếu không có tìm kiếm, chỉ cần gọi lại fetchOrders thông thường
      fetchOrders(1, pageSize, "", newValue);
    }
  };

  useEffect(() => {
    fetchOrders(1, pageSize, "", activeTab);
  }, []); // Gọi lại khi tab thay đổi

  return (
    <div className="order-manager-container">
      <Typography variant="h4" className="page-title">
        Quản Lý Đơn Hàng
      </Typography>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        centered
        textColor="primary"
        className="status-tabs"
        sx={{
          '& .MuiTab-root': {
            color: '#999999', // Unselected tab color
            '&:focus': {
              outline: 'none'
            },
            '&.Mui-focusVisible': {
              outline: 'none'
            },
            '&.Mui-selected': {
              color: '#e91e63', // Selected tab text color (pink)
              fontWeight: 'bold'
            }
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#e91e63', // Indicator color (pink)
            height: '3px'
          }
        }}
      >
        {tabLabels.map((label, index) => (
          <Tab
            key={index}
            label={label}
            sx={{
              '&:focus': {
                outline: 'none'
              },
              '&:hover': {
                color: '#e91e63', // Hover color (pink)
                opacity: 0.8
              }
            }}
          />
        ))}
      </Tabs>

      {/* Thanh tìm kiếm */}
      <Box
        className="search-container"
        sx={{
          my: 1,
          display: 'flex',
          alignItems: 'center',
          maxWidth: '90%',
          mx: 'auto',
          borderRadius: '4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Tìm kiếm theo tên, email, số điện thoại hoặc ID đơn hàng"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          sx={{
            '& .MuiOutlinedInput-root': {
              height: '34px',
              fontSize: '13px',
              borderRadius: '4px 0 0 4px',
              '& fieldset': {
                borderRight: 'none',
                borderColor: '#fe60a2'
              },
              '&:hover fieldset': {
                borderColor: '#fe60a2'
              },
              '&.Mui-focused fieldset': {
                borderColor: '#fe60a2',
                borderWidth: '1px'
              }
            },
            '& .MuiInputBase-input': {
              py: 0.5,
              px: 0.5
            },
            '&:focus-visible': {
              outline: 'none'
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: '#fe60a2' }} />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClearSearch}
                  size="small"
                  sx={{
                    p: 0.25,
                    mr: 0.5,
                    '&:hover': {
                      backgroundColor: 'rgba(254, 96, 162, 0.1)'
                    },
                    '&:focus': {
                      outline: 'none'
                    },
                    '&.Mui-focusVisible': {
                      outline: 'none'
                    }
                  }}
                >
                  <ClearIcon fontSize="small" sx={{ color: '#fe60a2' }} />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{
            height: '34px',
            minWidth: '34px',
            borderRadius: '0 4px 4px 0',
            backgroundColor: '#fe60a2',
            '&:hover': {
              backgroundColor: '#fa83b5',
            },
            '&:focus': {
              outline: 'none'
            },
            '&.Mui-focusVisible': {
              outline: 'none'
            }
          }}
        >
          <SearchIcon fontSize="small" />
        </Button>
      </Box>

      {/* Thông tin phân trang và lựa chọn số lượng hiển thị */}
      <Box className="pagination-info">
        <Typography variant="body2">
          {isSearching && (
            <span className="search-info">Kết quả tìm kiếm: </span>
          )}
          Tổng số: {totalOrders} đơn hàng | Trang {currentPage}/{totalPages}
        </Typography>

        <FormControl
          variant="outlined"
          size="small"
          style={{ minWidth: 70 }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#fe60a2'
              },
              '&:hover fieldset': {
                borderColor: '#fe60a2'
              },
              '&.Mui-focused fieldset': {
                borderColor: '#fe60a2'
              }
            },
            '& .MuiInputLabel-root': {
              color: '#666',
              '&.Mui-focused': {
                color: '#fe60a2'
              }
            },
            '& .MuiSelect-icon': {
              color: '#fe60a2'
            }
          }}
        >
          <InputLabel>Hiển thị</InputLabel>
          <Select
            value={pageSize}
            onChange={handlePageSizeChange}
            label="Hiển thị"
          >
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
            <MenuItem value={150}>150</MenuItem>
            <MenuItem value={200}>200</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Typography color="error" className="error-message">
          {error}
        </Typography>
      )}

      {loading ? (
        <Box className="loading-container">
          <CircularProgress />
          <Typography>Đang tải dữ liệu...</Typography>
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} className="order-table-container">
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell align="center" className="table-header">STT</TableCell>
                  <TableCell align="center" className="table-header">Mã đơn</TableCell>
                  <TableCell align="center" className="table-header">Ngày đặt</TableCell>
                  <TableCell align="center" className="table-header">Trạng thái</TableCell>
                  <TableCell align="center" className="table-header">TT Thanh toán</TableCell>
                  <TableCell align="center" className="table-header">Khách hàng</TableCell>
                  <TableCell align="center" className="table-header">Địa chỉ</TableCell>
                  <TableCell align="center" className="table-header">SĐT</TableCell>
                  <TableCell align="center" className="table-header">Email</TableCell>
                  <TableCell align="center" className="table-header">Tổng tiền</TableCell>
                  <TableCell align="center" className="table-header">Hành động</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {(() => {
                  // Đặt logic filteredOrders vào IIFE để xử lý lỗi trực tiếp
                  try {
                    const filtered = filteredOrders();
                    if (filtered && filtered.length > 0) {
                      return filtered.map((order, index) => (
                        <TableRow key={order?.OrderId || index} className={index % 2 === 0 ? "even-row" : "odd-row"}>
                          <TableCell align="center">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                          <TableCell align="center">#{order?.OrderId || 'N/A'}</TableCell>
                          <TableCell align="center">{order?.OrderDate ? formatDateTime(order.OrderDate) : 'N/A'}</TableCell>
                          <TableCell align="center">
                            <span className={`status-badge status-${order?.Status?.replace(/\s+/g, '-').toLowerCase() || 'unknown'}`}>
                              {order?.Status || 'N/A'}
                            </span>
                          </TableCell>
                          <TableCell align="center">
                            <span className={`payment-status-badge ${order?.PaymentStatus?.toLowerCase().replace(/\s+/g, '-') || 'unknown'}`}>
                              {order?.PaymentStatus || 'N/A'}
                            </span>
                          </TableCell>
                          <TableCell align="center">{order?.CustomerName || 'N/A'}</TableCell>
                          <TableCell align="center">{order?.ShippingAddress || 'N/A'}</TableCell>
                          <TableCell align="center">{order?.PhoneNumber || 'N/A'}</TableCell>
                          <TableCell align="center">{order?.Email || 'N/A'}</TableCell>
                          <TableCell align="center">{order?.TotalAmount ? order.TotalAmount.toLocaleString() : '0'}đ</TableCell>
                          <TableCell align="center">
                            <Box className="action-buttons" sx={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => handleOpenDetailModal(order)}
                                sx={{
                                  boxShadow: 'none',
                                  minWidth: 'unset',
                                  px: 1,
                                  py: 0.5,
                                  fontSize: '11px',
                                  borderRadius: '4px',
                                  fontWeight: 500,
                                  textTransform: 'none',
                                  bgcolor: '#5B7DB1',
                                  '&:hover': { boxShadow: 'none', bgcolor: '#4A6A99', opacity: 0.95 },
                                  '&:focus': { outline: 'none' }
                                }}
                              >
                                Chi tiết
                              </Button>

                              {order?.Status !== "Đã Hủy" && (
                                <>
                                  {order?.Status === "Chờ Xác Nhận" && (
                                    <>
                                      <Button
                                        variant="contained"
                                        color="success"
                                        size="small"
                                        onClick={() => updateOrderStatus(order?.OrderId, "Chờ Lấy Hàng")}
                                        sx={{
                                          boxShadow: 'none',
                                          minWidth: 'unset',
                                          px: 1,
                                          py: 0.5,
                                          fontSize: '11px',
                                          borderRadius: '4px',
                                          fontWeight: 500,
                                          textTransform: 'none',
                                          bgcolor: '#66A182',
                                          '&:hover': { boxShadow: 'none', bgcolor: '#4D8368', opacity: 0.95 },
                                          '&:focus': { outline: 'none' }
                                        }}
                                      >
                                        Xác nhận
                                      </Button>
                                      <Button
                                        variant="contained"
                                        color="error"
                                        size="small"
                                        onClick={() => handleOpenCancelModal(order)}
                                        sx={{
                                          boxShadow: 'none',
                                          minWidth: 'unset',
                                          px: 1,
                                          py: 0.5,
                                          fontSize: '11px',
                                          borderRadius: '4px',
                                          fontWeight: 500,
                                          textTransform: 'none',
                                          bgcolor: '#E07A7A',
                                          '&:hover': { boxShadow: 'none', bgcolor: '#C45A5A', opacity: 0.95 },
                                          '&:focus': { outline: 'none' }
                                        }}
                                      >
                                        Hủy
                                      </Button>
                                    </>
                                  )}

                                  {order?.Status === "Chờ Lấy Hàng" && (
                                    <Button
                                      variant="contained"
                                      color="info"
                                      size="small"
                                      onClick={() => updateOrderStatus(order?.OrderId, "Đang Giao Hàng")}
                                      sx={{
                                        boxShadow: 'none',
                                        minWidth: 'unset',
                                        px: 1,
                                        py: 0.5,
                                        fontSize: '11px',
                                        borderRadius: '4px',
                                        fontWeight: 500,
                                        textTransform: 'none',
                                        bgcolor: '#7AABD4',
                                        '&:hover': { boxShadow: 'none', bgcolor: '#5C8CB3', opacity: 0.95 },
                                        '&:focus': { outline: 'none' }
                                      }}
                                    >
                                      Giao hàng
                                    </Button>
                                  )}

                                  {order?.Status === "Đang Giao Hàng" && (
                                    <Button
                                      variant="contained"
                                      color="success"
                                      size="small"
                                      onClick={() => updateOrderStatus(order?.OrderId, "Đã Giao")}
                                      sx={{
                                        boxShadow: 'none',
                                        minWidth: 'unset',
                                        px: 1,
                                        py: 0.5,
                                        fontSize: '11px',
                                        borderRadius: '4px',
                                        fontWeight: 500,
                                        textTransform: 'none',
                                        bgcolor: '#76B995',
                                        '&:hover': { boxShadow: 'none', bgcolor: '#5A9B77', opacity: 0.95 },
                                        '&:focus': { outline: 'none' }
                                      }}
                                    >
                                      Hoàn thành
                                    </Button>
                                  )}
                                </>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ));
                    } else {
                      return (
                        <TableRow>
                          <TableCell colSpan={11} align="center">
                            {isSearching
                              ? `Không tìm thấy đơn hàng nào với từ khóa "${searchTerm}"`
                              : "Không có đơn hàng nào"}
                          </TableCell>
                        </TableRow>
                      );
                    }
                  } catch (error) {
                    console.error("Error rendering order list:", error);
                    return (
                      <TableRow>
                        <TableCell colSpan={11} align="center">Lỗi khi hiển thị dữ liệu. Vui lòng thử lại.</TableCell>
                      </TableRow>
                    );
                  }
                })()}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box
              className="pagination-container"
              sx={{
                display: 'flex',
                justifyContent: 'center',
                padding: '1.5rem 0',
                margin: '2rem 0 1rem',
                borderRadius: '8px',
                boxShadow: 'none',
                background: 'linear-gradient(to right, #f8f9fa, #ffffff, #f8f9fa)'
              }}
            >
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  size="large"
                  showFirstButton
                  showLastButton
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontWeight: 500,
                      margin: '0 2px',
                      transition: 'all 0.3s ease',
                      border: 'none',
                      outline: 'none',
                      '&:focus': {
                        outline: 'none',
                        boxShadow: 'none'
                      },
                    },
                    '& .MuiPaginationItem-page.Mui-selected': {
                      backgroundColor: '#fe60a2',
                      color: '#fff',
                      boxShadow: 'none',
                      transform: 'scale(1.1)',
                    },
                    '& .MuiPaginationItem-page:hover': {
                      backgroundColor: 'rgba(254, 96, 162, 0.1)',
                    },
                    '& .MuiPaginationItem-ellipsis': {
                      color: '#666',
                    },
                    '& .MuiPaginationItem-firstLast, & .MuiPaginationItem-previousNext': {
                      color: '#fe60a2',
                      '&:hover': {
                        backgroundColor: 'rgba(254, 96, 162, 0.1)',
                      }
                    }
                  }}
                />
              </Box>
            
          )}

        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box className="status-modal" sx={{
          width: '85%',
          maxWidth: '800px',
          p: 3,
          borderRadius: '8px',
          bgcolor: 'white',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}>
          <Typography variant="h6" gutterBottom sx={{
            borderBottom: '1px solid #e0e0e0',
            pb: 1.5,
            textAlign: 'left',
            color: '#2c3e50'
          }}>
            Thông tin đơn hàng #{selectedOrder?.OrderId}
          </Typography>

          {selectedOrder && (
            <Box className="order-details-container" sx={{ mt: 2 }}>
              {/* Thông tin chung */}
              <Box className="order-info-section">
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5, textAlign: 'left' }}>
                  Thông tin chung
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '150px 1fr', rowGap: '8px' }}>
                      <Typography variant="body2" sx={{ textAlign: 'right', pr: 2, color: '#666' }}>Mã đơn hàng:</Typography>
                      <Typography variant="body2" sx={{ textAlign: 'left', fontWeight: 500 }}>#{selectedOrder.OrderId}</Typography>

                      <Typography variant="body2" sx={{ textAlign: 'right', pr: 2, color: '#666' }}>Ngày đặt:</Typography>
                      <Typography variant="body2" sx={{ textAlign: 'left', fontWeight: 500 }}>{formatDateTime(selectedOrder.OrderDate)}</Typography>

                      <Typography variant="body2" sx={{ textAlign: 'right', pr: 2, color: '#666' }}>Trạng thái:</Typography>
                      <Typography variant="body2" sx={{ textAlign: 'left', fontWeight: 500 }}>{selectedOrder.Status}</Typography>

                      <Typography variant="body2" sx={{ textAlign: 'right', pr: 2, color: '#666' }}>TT thanh toán:</Typography>
                      <Typography variant="body2" sx={{ textAlign: 'left', fontWeight: 500 }}>{selectedOrder.PaymentStatus}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '150px 1fr', rowGap: '8px' }}>
                      <Typography variant="body2" sx={{ textAlign: 'right', pr: 2, color: '#666' }}>Tổng tiền:</Typography>
                      <Typography variant="body2" sx={{ textAlign: 'left', fontWeight: 500 }}>{selectedOrder.TotalAmount?.toLocaleString()}đ</Typography>

                      <Typography variant="body2" sx={{ textAlign: 'right', pr: 2, color: '#666' }}>Tổng ban đầu:</Typography>
                      <Typography variant="body2" sx={{ textAlign: 'left', fontWeight: 500 }}>{selectedOrder.OriginalTotalAmount?.toLocaleString()}đ</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 2.5 }} />

              {/* Thông tin khách hàng */}
              <Box className="customer-info-section">
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5, textAlign: 'left' }}>
                  Thông tin khách hàng
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '150px 1fr', rowGap: '8px' }}>
                      <Typography variant="body2" sx={{ textAlign: 'right', pr: 2, color: '#666' }}>Khách hàng:</Typography>
                      <Typography variant="body2" sx={{ textAlign: 'left', fontWeight: 500 }}>{selectedOrder.CustomerName}</Typography>

                      <Typography variant="body2" sx={{ textAlign: 'right', pr: 2, color: '#666' }}>Điện thoại:</Typography>
                      <Typography variant="body2" sx={{ textAlign: 'left', fontWeight: 500 }}>{selectedOrder.PhoneNumber}</Typography>

                      <Typography variant="body2" sx={{ textAlign: 'right', pr: 2, color: '#666' }}>Email:</Typography>
                      <Typography variant="body2" sx={{ textAlign: 'left', fontWeight: 500 }}>{selectedOrder.Email}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '150px 1fr', rowGap: '8px' }}>
                      <Typography variant="body2" sx={{ textAlign: 'right', pr: 2, color: '#666' }}>Địa chỉ giao hàng:</Typography>
                      <Typography variant="body2" sx={{ textAlign: 'left', fontWeight: 500 }}>{selectedOrder.ShippingAddress}</Typography>

                      <Typography variant="body2" sx={{ textAlign: 'right', pr: 2, color: '#666' }}>Mã khách hàng:</Typography>
                      <Typography variant="body2" sx={{ textAlign: 'left', fontWeight: 500 }}>{selectedOrder.CustomerId}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 2.5 }} />

              {/* Chi tiết đơn hàng */}
              <Box className="order-items-section">
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5, textAlign: 'left' }}>
                  Chi tiết đơn hàng
                </Typography>

                {loadingDetails ? (
                  <Box className="loading-container" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3, gap: 2 }}>
                    <CircularProgress size={30} />
                    <Typography>Đang tải chi tiết đơn hàng...</Typography>
                  </Box>
                ) : orderDetails.length > 0 ? (
                  <TableContainer component={Paper} sx={{
                    mt: 2,
                    maxHeight: 300,
                    overflowY: 'auto',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px'
                  }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell className="table-header" align="center" sx={{ fontWeight: 'bold', width: '50px' }}>STT</TableCell>
                          <TableCell className="table-header" align="center" sx={{ fontWeight: 'bold' }}>Sản phẩm</TableCell>
                          <TableCell className="table-header" align="center" sx={{ fontWeight: 'bold', width: '120px' }}>Đơn giá</TableCell>
                          <TableCell className="table-header" align="center" sx={{ fontWeight: 'bold', width: '80px' }}>Số lượng</TableCell>
                          <TableCell className="table-header" align="center" sx={{ fontWeight: 'bold', width: '120px' }}>Thành tiền</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orderDetails.map((item, index) => (
                          <TableRow key={index} sx={{ '&:nth-of-type(odd)': { bgcolor: '#f9f9f9' } }}>
                            <TableCell align="center">{index + 1}</TableCell>
                            <TableCell align="left">
                              <Typography variant="body2" fontWeight="medium">{item.ProductName || item.Name}</Typography>
                            </TableCell>
                            <TableCell align="center">
                              {item.UnitPrice?.toLocaleString() || item.Price?.toLocaleString() || 0}đ
                            </TableCell>
                            <TableCell align="center">{item.Quantity}</TableCell>
                            <TableCell align="center">
                              {((item.UnitPrice || item.Price || 0) * (item.Quantity || 0)).toLocaleString()}đ
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="textSecondary" sx={{ py: 2, textAlign: 'center' }}>
                    Không có dữ liệu chi tiết đơn hàng.
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          <Box className="modal-actions" sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mt: 3,
            pt: 2,
            borderTop: '1px solid #e0e0e0'
          }}>
            <Button
              variant="outlined"
              onClick={() => setModalOpen(false)}
              sx={{
                boxShadow: 'none',
                borderRadius: '6px',
                fontWeight: 500,
                textTransform: 'none',
                minWidth: '80px',
                '&:hover': { boxShadow: 'none' },
                '&:focus': { outline: 'none' }
              }}
            >
              Đóng
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Modal hủy đơn hàng */}
      <Modal open={cancelModalOpen} onClose={handleCloseCancelModal}>
        <Box className="cancel-modal">
          <Typography variant="h6" gutterBottom>Xác nhận hủy đơn hàng</Typography>
          <Typography variant="body1">
            Bạn có chắc chắn muốn hủy đơn hàng <strong>#{selectedOrder?.OrderId}</strong> không?
          </Typography>
          <Typography variant="caption" color="error">
            Lưu ý: Hành động này không thể hoàn tác sau khi xác nhận.
          </Typography>

          <Box className="modal-actions">
            <Button variant="contained" color="error" onClick={handleCancelOrder}>
              Xác nhận hủy
            </Button>
            <Button variant="outlined" onClick={handleCloseCancelModal}>
              Quay lại
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default OrderManager;