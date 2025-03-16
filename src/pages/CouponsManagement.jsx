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
} from "@mui/material";
import { API_BASE_URL } from '../config';

const CouponsManagement = () => {
  const [coupons, setCoupons] = useState([]); // Dữ liệu mã giảm giá
  const [loading, setLoading] = useState(true); // Trạng thái loading
  const [error, setError] = useState(null); // Lỗi nếu có
  const [newCoupon, setNewCoupon] = useState({ // Dữ liệu mã giảm giá mới
    Name: "",
    Code: "",
    DiscountAmount: 0,
    DiscountPercentage: 0,
    MaxDiscountAmount: 0,
    StartDate: "",
    EndDate: "",
    MinimumOrderAmount: 0,
    QuantityAvailable: 0,
  });
  const [openDialog, setOpenDialog] = useState(false); // Điều khiển hiển thị form thêm mã giảm giá
  const [editingCoupon, setEditingCoupon] = useState(null); // Dữ liệu mã giảm giá đang được chỉnh sửa
  const [openEditDialog, setOpenEditDialog] = useState(false); // Điều khiển hiển thị form chỉnh sửa mã giảm giá

  // Hàm gọi API
  const fetchCoupons = async () => {
    try {
      setLoading(true); // Bắt đầu tải
      const response = await axios.get(`${API_BASE_URL}/Coupons`);
      console.log("Dữ liệu API trả về:", response.data); // Kiểm tra dữ liệu trả về
      const data = response.data.$values || []; // Lấy dữ liệu từ $values
      setCoupons(data); // Lưu dữ liệu vào state
    } catch (err) {
      console.error("Lỗi khi gọi API:", err); // Log lỗi chi tiết
      setError("Không thể tải danh sách mã giảm giá.");
    } finally {
      setLoading(false); // Kết thúc tải
    }
  };

  // Gọi API khi component được render
  useEffect(() => {
    fetchCoupons();
  }, []);

  // Hiển thị loading
  if (loading) return <CircularProgress style={{ display: "block", margin: "20px auto" }} />;

  // Hiển thị lỗi
  if (error) return <Alert severity="error" style={{ margin: "20px" }}>{error}</Alert>;

  // Hàm xử lý thay đổi giá trị của form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCoupon({
      ...newCoupon,
      [name]: value,
    });
  };

  // Hàm gửi yêu cầu thêm mã giảm giá
  const handleAddCoupon = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/Coupons`, newCoupon, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      alert("Mã giảm giá đã được thêm thành công!");
      setOpenDialog(false); // Đóng form sau khi thêm thành công
      fetchCoupons(); // Cập nhật lại danh sách mã giảm giá
    } catch (err) {
      console.error("Lỗi khi thêm mã giảm giá:", err);
      alert("Lỗi khi thêm mã giảm giá.");
    }
  };

  // Hàm gửi yêu cầu cập nhật mã giảm giá
  const handleUpdateCoupon = async () => {
    try {
      const response = await axios.put(`${API_BASE_URL}/Coupons/${editingCoupon.Id}`, editingCoupon, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      alert("Mã giảm giá đã được cập nhật thành công!");
      setOpenEditDialog(false); // Đóng form sau khi cập nhật thành công
      fetchCoupons(); // Cập nhật lại danh sách mã giảm giá
    } catch (err) {
      console.error("Lỗi khi cập nhật mã giảm giá:", err);
      alert("Lỗi khi cập nhật mã giảm giá.");
    }
  };

  // Hàm gửi yêu cầu xóa mã giảm giá
  const handleDeleteCoupon = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/Coupons/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      alert("Mã giảm giá đã được xóa thành công!");
      fetchCoupons(); // Cập nhật lại danh sách mã giảm giá
    } catch (err) {
      console.error("Lỗi khi xóa mã giảm giá:", err);
      alert("Lỗi khi xóa mã giảm giá.");
    }
  };

  return (
    <div style={{ margin: "20px", marginTop: "40px", marginBottom: "20px" }}>
      <Typography variant="h4" align="center" gutterBottom>
        Danh Sách Mã Giảm Giá
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenDialog(true)}
        style={{ marginBottom: "20px" }}
      >
        Thêm mã giảm giá
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tên mã</TableCell>
              <TableCell>Mã giảm giá</TableCell>
              <TableCell>Số tiền giảm</TableCell>
              <TableCell>% Giảm giá</TableCell>
              <TableCell>Giảm tối đa</TableCell>
              <TableCell>Ngày bắt đầu</TableCell>
              <TableCell>Ngày kết thúc</TableCell>
              <TableCell>Đơn hàng tối thiểu</TableCell>
              <TableCell>Số lượng còn lại</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.Id}>
                <TableCell>{coupon.Id}</TableCell>
                <TableCell>{coupon.Name}</TableCell>
                <TableCell>{coupon.Code}</TableCell>
                <TableCell>{coupon.DiscountAmount}</TableCell>
                <TableCell>{coupon.DiscountPercentage}</TableCell>
                <TableCell>{coupon.MaxDiscountAmount}</TableCell>
                <TableCell>{coupon.StartDate}</TableCell>
                <TableCell>{coupon.EndDate}</TableCell>
                <TableCell>{coupon.MinimumOrderAmount}</TableCell>
                <TableCell>{coupon.QuantityAvailable}</TableCell>
                <TableCell>{coupon.CreatedAt}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      setEditingCoupon(coupon);
                      setOpenEditDialog(true);
                    }}
                  >
                 Sửa
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleDeleteCoupon(coupon.Id)}
                    style={{ marginLeft: "10px" }}
                  >
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog to add a new coupon */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Thêm Mã Giảm Giá</DialogTitle>
        <DialogContent>
          <TextField
            label="Tên mã"
            name="Name"
            fullWidth
            value={newCoupon.Name}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            label="Mã giảm giá"
            name="Code"
            fullWidth
            value={newCoupon.Code}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            label="Số tiền giảm"
            name="DiscountAmount"
            type="number"
            fullWidth
            value={newCoupon.DiscountAmount}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            label="% Giảm giá"
            name="DiscountPercentage"
            type="number"
            fullWidth
            value={newCoupon.DiscountPercentage}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            label="Giảm tối đa"
            name="MaxDiscountAmount"
            type="number"
            fullWidth
            value={newCoupon.MaxDiscountAmount}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            label="Ngày bắt đầu"
            name="StartDate"
            type="date"
            fullWidth
            value={newCoupon.StartDate}
            onChange={handleInputChange}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="Ngày kết thúc"
            name="EndDate"
            type="date"
            fullWidth
            value={newCoupon.EndDate}
            onChange={handleInputChange}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="Đơn hàng tối thiểu"
            name="MinimumOrderAmount"
            type="number"
            fullWidth
            value={newCoupon.MinimumOrderAmount}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            label="Số lượng còn lại"
            name="QuantityAvailable"
            type="number"
            fullWidth
            value={newCoupon.QuantityAvailable}
            onChange={handleInputChange}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Hủy
          </Button>
          <Button onClick={handleAddCoupon} color="primary">
            Thêm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog to edit a coupon */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Cập nhật Mã Giảm Giá</DialogTitle>
        <DialogContent>
          <TextField
            label="Tên mã"
            name="Name"
            fullWidth
            value={editingCoupon?.Name || ""}
            onChange={(e) => setEditingCoupon({ ...editingCoupon, Name: e.target.value })}
            margin="normal"
          />
          <TextField
            label="Mã giảm giá"
            name="Code"
            fullWidth
            value={editingCoupon?.Code || ""}
            onChange={(e) => setEditingCoupon({ ...editingCoupon, Code: e.target.value })}
            margin="normal"
          />
          <TextField
            label="Số tiền giảm"
            name="DiscountAmount"
            type="number"
            fullWidth
            value={editingCoupon?.DiscountAmount || 0}
            onChange={(e) => setEditingCoupon({ ...editingCoupon, DiscountAmount: e.target.value })}
            margin="normal"
          />
          <TextField
            label="% Giảm giá"
            name="DiscountPercentage"
            type="number"
            fullWidth
            value={editingCoupon?.DiscountPercentage || 0}
            onChange={(e) => setEditingCoupon({ ...editingCoupon, DiscountPercentage: e.target.value })}
            margin="normal"
          />
          <TextField
            label="Giảm tối đa"
            name="MaxDiscountAmount"
            type="number"
            fullWidth
            value={editingCoupon?.MaxDiscountAmount || 0}
            onChange={(e) => setEditingCoupon({ ...editingCoupon, MaxDiscountAmount: e.target.value })}
            margin="normal"
          />
          <TextField
            label="Ngày bắt đầu"
            name="StartDate"
            type="date"
            fullWidth
            value={editingCoupon?.StartDate || ""}
            onChange={(e) => setEditingCoupon({ ...editingCoupon, StartDate: e.target.value })}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="Ngày kết thúc"
            name="EndDate"
            type="date"
            fullWidth
            value={editingCoupon?.EndDate || ""}
            onChange={(e) => setEditingCoupon({ ...editingCoupon, EndDate: e.target.value })}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="Đơn hàng tối thiểu"
            name="MinimumOrderAmount"
            type="number"
            fullWidth
            value={editingCoupon?.MinimumOrderAmount || 0}
            onChange={(e) => setEditingCoupon({ ...editingCoupon, MinimumOrderAmount: e.target.value })}
            margin="normal"
          />
          <TextField
            label="Số lượng còn lại"
            name="QuantityAvailable"
            type="number"
            fullWidth
            value={editingCoupon?.QuantityAvailable || 0}
            onChange={(e) => setEditingCoupon({ ...editingCoupon, QuantityAvailable: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} color="secondary">
            Hủy
          </Button>
          <Button onClick={handleUpdateCoupon} color="primary">
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CouponsManagement;
