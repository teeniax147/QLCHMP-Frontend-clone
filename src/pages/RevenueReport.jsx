import React, { useState } from "react";
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
} from "@mui/material";
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
import { API_BASE_URL } from '../config'
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
import './RevenueReport.css';
const RevenueReport = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const validateDates = () => {
    if (startDate > endDate) {
      setError("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.");
      return false;
    }
    setError("");
    return true;
  };

  const fetchRevenueData = async () => {
    if (!validateDates()) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/reports/revenue/from-to`,
        {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRevenueData(response.data.RevenueData?.$values || []);
      setError(""); // Xóa lỗi nếu dữ liệu tải thành công
    } catch (err) {
      console.error("Error fetching revenue data:", err.response?.data || err.message);
      setError(err.response?.data || "Có lỗi xảy ra khi lấy dữ liệu báo cáo.");
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/reports/revenue/from-to`,
        {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
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

  const parseDate = (dateStr) => {
    const [date, time] = dateStr.split(" ");
    const [day, month, year] = date.split("/");
    const formattedDate = `${year}-${month}-${day}T${time}Z`;
    const dateObj = new Date(formattedDate);
    return isNaN(dateObj) ? "Invalid Date" : dateObj.toLocaleDateString();
  };

  // Dữ liệu cho biểu đồ đường
  const lineChartData = {
    labels: revenueData.map((data) => parseDate(data.Date)).slice(0, 10),
    datasets: [
      {
        label: "Tổng doanh thu (VND)",
        data: revenueData.map((data) => data.TotalRevenue),
        borderColor: "#4e73df",
        backgroundColor: "#4e73df",
        tension: 0.4,
        fill: false,
      },
      {
        label: "Tổng số đơn hàng",
        data: revenueData.map((data) => data.TotalOrders),
        borderColor: "#1cc88a",
        backgroundColor: "#1cc88a",
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const barChartData = {
    labels: ["Giá trị"], // Một nhãn chung cho loại
    datasets: [
      {
        label: "Tổng doanh thu (VND)",
        data: [revenueData.reduce((total, data) => total + data.TotalRevenue, 0)], // Tổng doanh thu
        backgroundColor: "rgba(78, 115, 223, 0.8)",
        borderColor: "rgba(78, 115, 223, 1)",
        borderWidth: 1,
      },
      {
        label: "Tổng số đơn hàng",
        data: [revenueData.reduce((total, data) => total + data.TotalOrders, 0)], // Tổng số đơn hàng
        backgroundColor: "rgba(28, 200, 138, 0.8)",
        borderColor: "rgba(28, 200, 138, 1)",
        borderWidth: 1,
      },
    ],
  };


  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true, // Hiển thị chú thích
        position: "top", // Vị trí của chú thích
        labels: {
          font: {
            size: 14, // Kích thước chữ
          },
          usePointStyle: true, // Sử dụng biểu tượng nhỏ
          boxWidth: 20, // Kích thước hộp màu
          padding: 15, // Khoảng cách giữa các mục
        },
      },
      title: {
        display: true,
        text: "Biểu đồ cột doanh thu và số đơn hàng",
        font: {
          size: 18,
          weight: "bold",
        },
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
      x: {
        ticks: {
          font: {
            size: 12,
          },
        },
        title: {
          display: true,
          text: "Loại giá trị",
          font: {
            size: 14,
          },
        },
      },
      y: {
        ticks: {
          font: {
            size: 12,
          },
          beginAtZero: true, // Đảm bảo trục Y bắt đầu từ 0
        },
        title: {
          display: true,
          text: "Giá trị",
          font: {
            size: 14,
          },
        },
      },
    },
  };


  return (
    <div style={{ padding: "5px 0 0", marginTop: "50px" }}>
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
          onClick={fetchRevenueData} // Giữ nguyên sự kiện onClick
        >
          Lấy dữ liệu
        </Button>

        <Button
          variant="outlined"
          className="custom-button6 custom-button-outlined6"
          onClick={() => exportReport("excel")} // Giữ nguyên sự kiện onClick
        >
          Xuất Excel
        </Button>


      </Box>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          <TableContainer component={Paper} style={{ maxHeight: "400px", overflowY: "auto" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell align="center" style={{ fontWeight: "bold", fontSize: "16px" }}>Ngày</TableCell>
                  <TableCell align="center" style={{ fontWeight: "bold", fontSize: "16px" }}>Tổng doanh thu</TableCell>
                  <TableCell align="center" style={{ fontWeight: "bold", fontSize: "16px" }}>Tổng số đơn hàng</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {revenueData.length > 0 ? (
                  revenueData.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell align="center">{parseDate(data.Date)}</TableCell>
                      <TableCell align="center">{data.TotalRevenue.toLocaleString()} VND</TableCell>
                      <TableCell align="center">{data.TotalOrders}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>


          <Box marginTop="20px" display="flex" justifyContent="space-between">
            <Box style={{ height: "250px", width: "48%" }}>
              <Typography variant="h6" align="center">
                Biểu đồ báo cáo doanh thu (Line)
              </Typography>
              <Line data={lineChartData} />
            </Box>

            <Box
              style={{
                height: "280px",
                width: "48%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="h6" align="center" style={{ marginBottom: "-5px" }}>
                Biểu đồ báo cáo doanh thu (Bar)
              </Typography>
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top",
                      labels: {
                        font: {
                          size: 14,
                        },
                      },
                    },

                  },
                }}
              />
            </Box>
          </Box>
        </>
      )}
    </div>
  );
};

export default RevenueReport;
