import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from '../config'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Modal,
  Box,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import './BrandManagement.css';
const BrandManagement = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "add" | "edit" | "delete"
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logoFile: null, // Thay đổi từ logoUrl sang logoFile để phù hợp với API
  });

  const fetchBrands = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/thuong-hieu`, {
        headers: { Accept: "application/json" },
      });

      // Xử lý phản hồi chứa $values
      if (response.data && response.data.$values) {
        setBrands(response.data.$values);
      } else {
        console.error("Invalid data format:", response.data);
        setBrands([]); // Đặt danh sách thương hiệu là rỗng nếu dữ liệu không hợp lệ
      }
    } catch (error) {
      console.error("Failed to fetch brands:", error);
      setBrands([]); // Xử lý khi có lỗi
    } finally {
      setLoading(false); // Tắt trạng thái loading
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openModal = (type, brand = null) => {
    setModalType(type);
    setSelectedBrand(brand);
    setFormData(
      brand
        ? { name: brand.Name, description: brand.Description, logoFile: null }
        : { name: "", description: "", logoFile: null }
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBrand(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleAddBrand = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");

      // Tạo FormData để gửi file logo và thông tin thương hiệu
      const formDataToSend = new FormData();
      formDataToSend.append("Name", formData.name); // Đảm bảo đúng key "Name"
      formDataToSend.append("Description", formData.description);
      if (formData.logoFile) {
        formDataToSend.append("LogoFile", formData.logoFile); // Đính kèm logo nếu có
      }

      const response = await axios.post(
        `${API_BASE_URL}/thuong-hieu/them-moi`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data", // Định dạng gửi file
          },
        }
      );

      alert(response.data.message || "Thêm thương hiệu thành công.");
      fetchBrands(); // Reload danh sách thương hiệu
      closeModal(); // Đóng modal
    } catch (error) {
      console.error("Failed to add brand:", error);
      alert(
        error.response?.data?.message || "Có lỗi xảy ra khi thêm thương hiệu."
      );
    }
  };

  const handleUpdateBrand = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");

      const formDataObj = new FormData();
      formDataObj.append("Name", formData.name);
      formDataObj.append("Description", formData.description);
      if (formData.logoFile) formDataObj.append("LogoFile", formData.logoFile);

      const response = await axios.put(
        `${API_BASE_URL}/thuong-hieu/cap-nhat/${id}`,
        formDataObj,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(response.data.message || "Cập nhật thương hiệu thành công.");
      fetchBrands();
      closeModal();
    } catch (error) {
      console.error("Failed to update brand:", error);
      alert(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật thương hiệu."
      );
    }
  };

  const handleDeleteBrand = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");

      const response = await axios.delete(
        `${API_BASE_URL}/thuong-hieu/xoa/${selectedBrand.Id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(response.data.message || "Xóa thương hiệu thành công.");
      fetchBrands();
      closeModal();
    } catch (error) {
      console.error("Failed to delete brand:", error);
      alert(
        error.response?.data?.message || "Có lỗi xảy ra khi xóa thương hiệu."
      );
    }
  };

  if (loading) return <CircularProgress style={{ display: "block", margin: "20px auto" }} />;
  if (brands.length === 0) return <Alert severity="info">Không có thương hiệu nào</Alert>;

  return (
    <Box sx={{ padding: "5px 0 0", marginTop: "40px" }}>
      <Typography variant="h4" align="center" gutterBottom>
        Quản Lý Thương Hiệu
      </Typography>
      <Button
        className="brand-add-button"
        onClick={() => openModal("add")}
      >
        Thêm
      </Button>

      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ fontWeight: "bold", width: "5%", fontSize: "16px" }}>STT</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", width: "18%", fontSize: "16px" }}>Tên Thương Hiệu</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", width: "44%", fontSize: "16px" }}>Mô Tả</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", width: "15%", fontSize: "16px" }}>Logo</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", width: "18%", fontSize: "16px" }}>Hành Động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {brands.map((brand, index) => (
              <TableRow key={brand.Id}>
                <TableCell align="center">{index + 1}</TableCell>
                <TableCell align="center">{brand.Name}</TableCell>
                <TableCell align="left" sx={{ textAlign: "justify" }}>
                  {brand.Description || "Không có mô tả"}
                </TableCell>
                <TableCell align="center">
                  {brand.LogoUrl ? (
                    <img
                      src={brand.LogoUrl}
                      alt={brand.Name}
                      style={{ maxHeight: "50px", borderRadius: "4px" }}
                    />
                  ) : (
                    "Không có logo"
                  )}
                </TableCell>
                <TableCell align="center" className="brand-action-buttons">
                  <Button
                    className="brand-edit-button"
                    onClick={() => openModal("edit", brand)}
                  >
                    Sửa
                  </Button>
                  <Button
                    className="brand-delete-button"
                    onClick={() => openModal("delete", brand)}
                  >
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal
        open={isModalOpen}
        onClose={closeModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            maxHeight: "90vh",
           
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          {modalType === "delete" ? (
            <>
              <Typography id="modal-modal-title" variant="h6" component="h2" align="center">
                Xóa Thương Hiệu
              </Typography>
              <Typography color="error" sx={{ mt: 2, mb: 3 }}>
                Bạn có chắc chắn muốn xóa thương hiệu: <strong>{selectedBrand?.Name}</strong>?
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  className="brand-modal-delete-button"
                  onClick={handleDeleteBrand}
                  sx={{ marginRight: 1 }}
                >
                  Xóa
                </Button>
                <Button
                  className="brand-modal-cancel-button"
                  onClick={closeModal}
                >
                  Hủy
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Typography id="modal-modal-title" variant="h6" component="h2" align="center">
                {modalType === "add" ? "Thêm Thương Hiệu" : "Cập Nhật Thương Hiệu"}
              </Typography>
              <TextField
                label="Tên Thương Hiệu"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Mô Tả"
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={3}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    logoFile: e.target.files[0],
                  }));
                }}
                style={{ marginTop: "15px" }}
              />

              <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: 2 }}>
                <Button
                  className={modalType === "add" ? "brand-modal-add-button" : "brand-modal-edit-button"}
                  onClick={
                    modalType === "add" ? handleAddBrand : () => handleUpdateBrand(selectedBrand?.Id)
                  }
                  sx={{ marginRight: 1 }}
                >
                  {modalType === "add" ? "Thêm" : "Cập Nhật"}
                </Button>
                <Button
                  className="brand-modal-cancel-button"
                  onClick={closeModal}
                >
                  Hủy
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default BrandManagement;
