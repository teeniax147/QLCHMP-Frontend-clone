// Định dạng ngày thành chuỗi dd-MM-yyyy để phù hợp với backend
const formatDateForAPI = (date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}; import React, { useState, useEffect } from "react";
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
  TextField,
  Button,
  CircularProgress,
  Box,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Divider,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { API_BASE_URL } from '../config';
import './RevenueReport.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const RevenueReport = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const token = localStorage.getItem("token");

  const validateDates = () => {
    if (startDate > endDate) {
      setError("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.");
      return false;
    }
    setError("");
    return true;
  };

  // Lấy chi tiết đơn hàng
  const fetchOrderDetails = async (orderId) => {
    setLoadingDetails(true);
    try {
      console.log(`Đang gọi API lấy chi tiết đơn hàng #${orderId}`);

      // API_BASE_URL đã bao gồm "/api" nên không cần thêm vào nữa
      const apiUrl = `${API_BASE_URL}/Orders/orders/${orderId}/details`;
      console.log(`URL API: ${apiUrl}`);

      const response = await axios.get(
        apiUrl,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Chi tiết đơn hàng nhận được:", response.data);

      // Kiểm tra cấu trúc dữ liệu trả về
      if (Array.isArray(response.data)) {
        setOrderDetails(response.data);
      } else if (response.data.$values && Array.isArray(response.data.$values)) {
        // Xử lý trường hợp kết quả nằm trong thuộc tính $values (định dạng ASP.NET)
        setOrderDetails(response.data.$values);
      } else {
        console.error("Định dạng dữ liệu không như mong đợi:", response.data);
        setOrderDetails([]);
        alert("Định dạng dữ liệu không hợp lệ. Chi tiết trong console log.");
      }
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", err);
      console.error("OrderId được truyền vào:", orderId);
      setOrderDetails([]);

      // Hiển thị thông báo lỗi chi tiết
      let errorMessage = `Có lỗi xảy ra khi lấy chi tiết đơn hàng #${orderId}.`;

      if (err.response) {
        // Lỗi từ server
        console.error("Lỗi server:", err.response.status, err.response.data);

        // Nếu lỗi 404, hiển thị thông báo gợi ý kiểm tra endpoint
        if (err.response.status === 404) {
          errorMessage = `Không tìm thấy API endpoint. Vui lòng kiểm tra lại đường dẫn API hoặc liên hệ với người phát triển backend.`;
        } else {
          errorMessage = err.response.data?.Message || `Lỗi từ server: ${err.response.status}`;
        }
      } else if (err.request) {
        // Không nhận được phản hồi từ server
        console.error("Không nhận được phản hồi:", err.request);
        errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
      } else {
        // Lỗi khác
        console.error("Lỗi:", err.message);
        errorMessage = err.message || errorMessage;
      }

      alert(errorMessage);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Mở modal chi tiết đơn hàng
  const handleOpenOrderDetails = (orderId) => {
    setSelectedOrderId(orderId);
    fetchOrderDetails(orderId);
    setOrderDetailsOpen(true);
  };

  const fetchRevenueData = async () => {
    if (!validateDates()) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/reports/revenue/from-to2`,
        {
          params: {
            startDateStr: formatDateForAPI(startDate),
            endDateStr: formatDateForAPI(endDate),
            format: "json"
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Lấy dữ liệu từ API và đảm bảo là một mảng
      const data = response.data.RevenueData?.$values || response.data.RevenueData || [];
      setRevenueData(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Error fetching revenue data:", err.response?.data || err.message);
      setError(err.response?.data || "Có lỗi xảy ra khi lấy dữ liệu báo cáo.");
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    if (!validateDates()) return;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/reports/revenue/from-to2`,
        {
          params: {
            startDateStr: formatDateForAPI(startDate),
            endDateStr: formatDateForAPI(endDate),
            format: format,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        format === "pdf" ? "BaoCaoDoanhThu.pdf" : "BaoCaoDoanhThu.xlsx"
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error exporting report:", err);
      alert("Có lỗi xảy ra khi xuất báo cáo.");
    }
  };

  // Hàm parse định dạng ngày từ API - bao gồm cả giờ
  const formatDate = (dateValue) => {
    // Nếu là chuỗi rỗng hoặc null/undefined
    if (!dateValue) return "N/A";

    try {
      // Kiểm tra định dạng ngày từ API (có thể là ISO, Unix timestamp, hoặc định dạng tùy chỉnh)
      if (typeof dateValue === 'string') {
        // Nếu đã có định dạng dd/MM/yyyy hh:mm:ss
        if (dateValue.match(/^\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}/)) {
          return dateValue; // Giữ nguyên định dạng đầy đủ
        }

        // Nếu đã có định dạng dd/MM/yyyy
        if (dateValue.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          return dateValue; // Giữ nguyên định dạng ngày
        }

        // Thử phân tích như là ISO date
        const isoDate = new Date(dateValue);
        if (!isNaN(isoDate.getTime())) {
          const day = isoDate.getDate().toString().padStart(2, '0');
          const month = (isoDate.getMonth() + 1).toString().padStart(2, '0');
          const year = isoDate.getFullYear();
          const hours = isoDate.getHours().toString().padStart(2, '0');
          const minutes = isoDate.getMinutes().toString().padStart(2, '0');
          const seconds = isoDate.getSeconds().toString().padStart(2, '0');

          return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        }

        // Kiểm tra định dạng yyyy-MM-dd hoặc yyyy-MM-ddTHH:mm:ss
        if (dateValue.includes('-') || dateValue.includes('T')) {
          const date = new Date(dateValue);
          if (!isNaN(date.getTime())) {
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const seconds = date.getSeconds().toString().padStart(2, '0');

            return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
          }
        }
      }

      // Nếu là Date object
      if (dateValue instanceof Date) {
        if (!isNaN(dateValue.getTime())) {
          const day = dateValue.getDate().toString().padStart(2, '0');
          const month = (dateValue.getMonth() + 1).toString().padStart(2, '0');
          const year = dateValue.getFullYear();
          const hours = dateValue.getHours().toString().padStart(2, '0');
          const minutes = dateValue.getMinutes().toString().padStart(2, '0');
          const seconds = dateValue.getSeconds().toString().padStart(2, '0');

          return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        }
      }

      // Nếu không phải Invalid Date string, trả về giá trị nguyên bản
      if (dateValue !== "Invalid Date") {
        return dateValue.toString();
      }

      // Nếu là Invalid Date, chuyển sang định dạng khác
      return "Chưa có ngày";

    } catch (error) {
      console.error("Lỗi khi định dạng ngày:", error, dateValue);
      return "Ngày không hợp lệ";
    }
  };

  // Dữ liệu cho biểu đồ đường - sử dụng dữ liệu từ API
  const lineChartData = {
    labels: revenueData.map((data) => formatDate(data.Date).split(' ')[0]),
    datasets: [
      {
        label: "Tổng doanh thu (đ)",
        data: revenueData.map((data) => data.TotalRevenue),
        borderColor: "#4e73df",
        backgroundColor: "#4e73df",
        tension: 0.4,
        fill: false,
        yAxisID: 'y-revenue'
      },
      {
        label: "Tổng số đơn hàng",
        data: revenueData.map((data) => data.TotalOrders),
        borderColor: "#1cc88a",
        backgroundColor: "#1cc88a",
        tension: 0.4,
        fill: false,
        yAxisID: 'y-orders'
      },
    ],
  };

  // Tùy chọn cho biểu đồ đường
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Quan trọng - cho phép điều chỉnh chiều cao độc lập
    onClick: (event, elements) => {
      // Xử lý khi người dùng click vào điểm trên biểu đồ
      if (elements && elements.length > 0) {
        const index = elements[0].index;
        const dayData = revenueData[index];
        if (dayData) {
          setSelectedDayData(dayData);
          setOpenModal(true);
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: false, // Đã có tiêu đề riêng nên tắt tiêu đề mặc định
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.datasetIndex === 0) {
                label += new Intl.NumberFormat('vi-VN').format(context.parsed.y) + 'đ';
              } else {
                label += context.parsed.y;
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      // Trục y chính cho doanh thu
      'y-revenue': {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Doanh thu (đ)',
          font: {
            size: 12,
          },
        },
        ticks: {
          callback: function (value) {
            return value.toLocaleString();
          },
          font: {
            size: 10,
          },
          maxTicksLimit: 8, // Giới hạn số điểm đánh dấu
        },
        grid: {
          drawOnChartArea: true,
        },
      },
      // Trục y thứ hai cho số đơn hàng
      'y-orders': {
        type: 'linear',
        position: 'right',
        title: {
          display: true,
          text: 'Số đơn hàng',
          font: {
            size: 12,
          }
        },
        min: 0,
        max: Math.max(...revenueData.map(d => d.TotalOrders || 0), 1) + 2, // Thêm space trên đỉnh
        ticks: {
          stepSize: 1,
          font: {
            size: 10,
          },
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 10, // Giới hạn số nhãn hiển thị
          font: {
            size: 9, // Giảm kích thước font chữ để nhãn không chồng lên nhau
          },
        }
      }
    },
    layout: {
      padding: {
        left: 5,
        right: 25, // Thêm padding bên phải cho trục Y thứ hai
        top: 10,
        bottom: 5
      }
    }
  };

  // Dữ liệu cho biểu đồ cột
  const barChartData = {
    labels: ["Tổng"],
    datasets: [
      {
        label: "Tổng doanh thu (đ)",
        data: [revenueData.reduce((total, data) => total + data.TotalRevenue, 0)],
        backgroundColor: "rgba(78, 115, 223, 0.8)",
        borderColor: "rgba(78, 115, 223, 1)",
        borderWidth: 1,
        // Sử dụng yAxisID để liên kết với trục y chính
        yAxisID: 'y-revenue'
      },
      {
        label: "Tổng số đơn hàng",
        data: [revenueData.reduce((total, data) => total + data.TotalOrders, 0)],
        backgroundColor: "rgba(28, 200, 138, 0.8)",
        borderColor: "rgba(28, 200, 138, 1)",
        borderWidth: 1,
        // Sử dụng yAxisID để liên kết với trục y thứ hai
        yAxisID: 'y-orders'
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements) => {
      // Hiển thị tất cả dữ liệu nếu người dùng nhấp vào biểu đồ cột
      if (elements && elements.length > 0) {
        // Tìm ngày có doanh thu cao nhất để hiển thị
        const maxRevenueDay = revenueData.reduce((max, current) =>
          current.TotalRevenue > max.TotalRevenue ? current : max,
          revenueData[0] || {});

        if (maxRevenueDay) {
          setSelectedDayData(maxRevenueDay);
          setOpenModal(true);
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          font: {
            size: 14,
          },
          usePointStyle: true,
          boxWidth: 20,
          padding: 15,
        },
      },
      title: {
        display: false, // Đã có tiêu đề riêng nên tắt tiêu đề mặc định
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || "";
            const value = context.raw || 0;
            return `${label}: ${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      // Trục y chính cho doanh thu
      'y-revenue': {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Doanh thu (đ)',
          font: {
            size: 12,
          },
        },
        ticks: {
          font: {
            size: 10,
          },
          beginAtZero: true,
          callback: function (value) {
            return value.toLocaleString() + 'đ';
          }
        },
        grid: {
          display: true,
        }
      },
      // Trục y thứ hai cho số đơn hàng
      'y-orders': {
        type: 'linear',
        position: 'right',
        title: {
          display: true,
          text: 'Số đơn hàng',
          font: {
            size: 12,
          }
        },
        ticks: {
          font: {
            size: 10,
          },
          beginAtZero: true,
          stepSize: 1,
        },
        grid: {
          display: false, // Không hiển thị lưới cho trục này để tránh chồng chéo
        }
      },
      x: {
        ticks: {
          font: {
            size: 12,
          },
        },
        title: {
          display: false, // Không cần hiển thị tiêu đề trục x
        },
      },
    },
    layout: {
      padding: {
        left: 5,
        right: 25,
        top: 10,
        bottom: 5
      }
    }
  };

  return (
    <div style={{ padding: "5px 0 0", marginTop: "20px" }}>
      <Typography variant="h4" align="center" gutterBottom>
        Báo Cáo Doanh Thu
      </Typography>

      <Box display="flex" justifyContent="space-between" marginBottom="15px">
        <TextField
          type="date"
          label="Ngày bắt đầu"
          value={startDate.toISOString().split("T")[0]}
          onChange={(e) => setStartDate(new Date(e.target.value))}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          type="date"
          label="Ngày kết thúc"
          value={endDate.toISOString().split("T")[0]}
          onChange={(e) => setEndDate(new Date(e.target.value))}
          InputLabelProps={{ shrink: true }}
        />
        <Button
          variant="contained"
          className="custom-button1 custom-button-contained1"
          onClick={fetchRevenueData}
        >
          Lấy dữ liệu
        </Button>

        <Button
          variant="outlined"
          className="custom-button6 custom-button-outlined6"
          onClick={() => exportReport("excel")}
          style={{ marginRight: "10px" }}
        >
          Xuất Excel
        </Button>

        <Button
          variant="outlined"
          className="custom-button6 custom-button-outlined6"
          onClick={() => exportReport("pdf")}
        >
          Xuất PDF
        </Button>
      </Box>

      {error && <Typography color="error" style={{ marginBottom: "10px" }}>{error}</Typography>}

      {loading ? (
        <Box display="flex" justifyContent="center" marginY="30px">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} style={{ maxHeight: "400px", overflowY: "auto" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell align="center" style={{ fontWeight: "bold", fontSize: "16px" }}>Ngày</TableCell>
                  <TableCell align="center" style={{ fontWeight: "bold", fontSize: "16px" }}>Tổng doanh thu</TableCell>
                  <TableCell align="center" style={{ fontWeight: "bold", fontSize: "16px" }}>Tổng số đơn hàng</TableCell>
                  <TableCell align="center" style={{ fontWeight: "bold", fontSize: "16px" }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {revenueData.length > 0 ? (
                  revenueData.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell align="center">{formatDate(data.Date).split(' ')[0]}</TableCell>
                      <TableCell align="center">{data.TotalRevenue.toLocaleString()}đ</TableCell>
                      <TableCell align="center">{data.TotalOrders}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={() => {
                            setSelectedDayData(data);
                            setOpenModal(true);
                          }}
                        >
                          Chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {revenueData.length > 0 && (
            <Box marginTop="20px" display="flex" justifyContent="space-between" style={{ height: "450px" }}>
              <Box style={{ height: "100%", width: "49%" }}>
                <Typography variant="h6" align="center" sx={{ mb: 1 }}>
                  Biểu đồ báo cáo doanh thu (Line)
                  <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 0.5 }}>
                    Nhấp vào điểm trên biểu đồ để xem chi tiết đơn hàng
                  </Typography>
                </Typography>
                <div style={{ height: "calc(100% - 40px)", width: "100%" }}>
                  <Line data={lineChartData} options={lineChartOptions} />
                </div>
              </Box>

              <Box
                style={{
                  height: "100%",
                  width: "49%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography variant="h6" align="center" sx={{ mb: 1 }}>
                  Biểu đồ báo cáo doanh thu (Bar)
                  <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 0.5 }}>
                    Nhấp vào biểu đồ để xem chi tiết ngày doanh thu cao nhất
                  </Typography>
                </Typography>
                <div style={{ height: "calc(100% - 40px)", width: "100%" }}>
                  <Bar
                    data={barChartData}
                    options={barChartOptions}
                  />
                </div>
              </Box>
            </Box>
          )}
        </>
      )}

      {/* Modal chi tiết đơn hàng */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {selectedDayData ? `Chi tiết đơn hàng - Ngày ${formatDate(selectedDayData.Date).split(' ')[0]}` : 'Chi tiết đơn hàng'}
            </Typography>
            <IconButton
              aria-label="close"
              onClick={() => setOpenModal(false)}
              sx={{ color: (theme) => theme.palette.grey[500] }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedDayData && (
            <>
              <Box marginBottom="15px">
                <Typography variant="subtitle1">
                  Tổng số đơn hàng: {selectedDayData.TotalOrders}
                </Typography>
                <Typography variant="subtitle1">
                  Tổng doanh thu: {selectedDayData.TotalRevenue.toLocaleString()}đ
                </Typography>
              </Box>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ fontWeight: "bold" }}>Mã đơn</TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>Thời gian</TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>Khách hàng</TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>Tổng tiền</TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>Trạng thái</TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>Thanh toán</TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedDayData.Orders && selectedDayData.Orders.$values && selectedDayData.Orders.$values.length > 0 ? (
                      selectedDayData.Orders.$values.map((order) => (
                        <TableRow key={order.Id}>
                          <TableCell>{order.Id}</TableCell>
                          <TableCell>{order.OrderDate ? formatDate(order.OrderDate) : "N/A"}</TableCell>
                          <TableCell>{order.CustomerName}</TableCell>
                          <TableCell>{order.TotalAmount?.toLocaleString()}đ</TableCell>
                          <TableCell>{order.Status}</TableCell>
                          <TableCell>{order.PaymentStatus}</TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              color="primary"
                              startIcon={<InfoIcon />}
                              onClick={() => handleOpenOrderDetails(order.Id)}
                            >
                              Chi tiết
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          Không có dữ liệu chi tiết
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal chi tiết hóa đơn */}
      <Dialog
        open={orderDetailsOpen}
        onClose={() => setOrderDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Chi tiết hóa đơn #{selectedOrderId}
            </Typography>
            <IconButton
              aria-label="close"
              onClick={() => setOrderDetailsOpen(false)}
              sx={{ color: (theme) => theme.palette.grey[500] }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {loadingDetails ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : orderDetails && orderDetails.length > 0 ? (
            <>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ fontWeight: "bold" }}>STT</TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>Sản phẩm</TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>Số lượng</TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>Đơn giá</TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>Thành tiền</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderDetails.map((item, index) => (
                      <TableRow key={item.Id || index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            {item.ProductImage && (
                              <Avatar
                                src={item.ProductImage}
                                alt={item.ProductName}
                                variant="rounded"
                                sx={{ width: 50, height: 50, marginRight: 2 }}
                              />
                            )}
                            <Box>
                              <Typography variant="subtitle2">{item.ProductName || "Sản phẩm không có tên"}</Typography>
                              <Typography variant="caption" color="textSecondary">
                                {item.ProductDescription && item.ProductDescription.length > 50
                                  ? `${item.ProductDescription.substring(0, 50)}...`
                                  : item.ProductDescription || "Không có mô tả"}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{item.Quantity || 0}</TableCell>
                        <TableCell>{(item.UnitPrice || 0).toLocaleString()}đ</TableCell>
                        <TableCell>{(item.TotalPrice || 0).toLocaleString()}đ</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box display="flex" justifyContent="flex-end">
                <Typography variant="subtitle1" fontWeight="bold">
                  Tổng cộng: {orderDetails.reduce((sum, item) => sum + (item.TotalPrice || 0), 0).toLocaleString()}đ
                </Typography>
              </Box>
            </>
          ) : (
            <Box p={3} textAlign="center">
              <Typography color="textSecondary" gutterBottom>
                Không có dữ liệu chi tiết đơn hàng
              </Typography>
              <Typography variant="caption" color="error">
                Có thể API không trả về dữ liệu hoặc đường dẫn không chính xác. Vui lòng kiểm tra lại hoặc thử lại sau.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDetailsOpen(false)} color="primary">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RevenueReport;