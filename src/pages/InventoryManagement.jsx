import React, { useState, useEffect } from "react";
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
import axios from "axios";
import { API_BASE_URL } from '../config'
const InventoryManagement = () => {
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "add" | "edit" | "delete"
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [formData, setFormData] = useState({
    ProductId: "",
    WarehouseLocation: "",
    QuantityInStock: "",
  });

  // Lấy danh sách kho hàng từ API
  const fetchInventories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/Inventories`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setInventories(response.data.$values || []);
    } catch (error) {
      setError("Không thể lấy danh sách kho hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventories();
  }, []);

  const openModal = (type, inventory = null) => {
    setModalType(type);
    setSelectedInventory(inventory);
    setFormData(
      inventory
        ? {
          ProductId: inventory.ProductId,
          WarehouseLocation: inventory.WarehouseLocation,
          QuantityInStock: inventory.QuantityInStock,
        }
        : {
          ProductId: "",
          WarehouseLocation: "",
          QuantityInStock: "",
        }
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInventory(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleAddInventory = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/Inventories`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const newInventory = response.data;
      setInventories((prevInventories) => [...prevInventories, newInventory]);
      alert("Thêm kho hàng thành công!");
      closeModal();
    } catch (error) {
      alert(error.response?.data || "Có lỗi xảy ra khi thêm kho hàng.");
    }
  };

  const handleEditInventory = async () => {
    try {
      const updatedInventory = {
        ...formData,
        InventoryId: selectedInventory.InventoryId,
      };

      await axios.put(
        `${API_BASE_URL}/Inventories/${selectedInventory.InventoryId}`,
        updatedInventory,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("Cập nhật kho hàng thành công!");
      fetchInventories();
      closeModal();
    } catch (error) {
      alert(error.response?.data || "Có lỗi xảy ra khi cập nhật kho hàng.");
    }
  };

  const handleDeleteInventory = async () => {
    if (!selectedInventory?.InventoryId) {
      alert("Không tìm thấy ID kho hàng để xóa.");
      return;
    }
    try {
      await axios.delete(
        `${API_BASE_URL}/Inventories/${selectedInventory.InventoryId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("Xóa kho hàng thành công!");
      fetchInventories();
      closeModal();
    } catch (error) {
      alert(error.response?.data || "Có lỗi xảy ra khi xóa kho hàng.");
    }
  };

  if (loading) return <CircularProgress style={{ display: "block", margin: "20px auto" }} />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ padding: "20px", marginTop: "30px", marginBottom: "20px" }}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom

      >
        Quản Lý Kho Hàng
      </Typography>
      <Button
        variant="contained"
        onClick={() => openModal("add")}
        sx={{ marginBottom: "20px", backgroundColor: "#007BFF", color: "#FFFFFF" }}
      >
        Thêm Kho Hàng
      </Button>
      <TableContainer component={Paper}>

        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ fontWeight: "bold", width: "5%", fontSize: "16px" }}>STT</TableCell> {/* Đổi từ ID thành STT */}
              <TableCell align="center" sx={{ fontWeight: "bold", width: "5%", fontSize: "16px" }}>Vị Trí Kho</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", width: "5%", fontSize: "16px" }}>Số Lượng</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", width: "5%", fontSize: "16px" }}>Hành Động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventories.map((inventory, index) => (
              <TableRow key={inventory.InventoryId}>
                <TableCell align="center">{index + 1}</TableCell> {/* Thêm số thứ tự thay vì InventoryId */}
                <TableCell align="center">{inventory.WarehouseLocation}</TableCell>
                <TableCell align="center">{inventory.QuantityInStock}</TableCell>
                <TableCell align="center">
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "20px",
                    }}
                  >
                    <Button
                      onClick={() => openModal("edit", inventory)}
                      sx={{
                        border: "1px solid #28A745",
                        color: "#28A745",
                        backgroundColor: "transparent",
                        "&:hover": {
                          borderColor: "#155D27", // Đổi màu viền khi hover
                        },
                        "&:focus": {
                          outline: "none", // Bỏ viền focus
                        },
                      }}
                    >
                      Sửa
                    </Button>
                    <Button
                      onClick={() => openModal("delete", inventory)}
                      sx={{
                        border: "1px solid #DC3545",
                        color: "#DC3545",
                        backgroundColor: "transparent",
                        "&:hover": {
                          borderColor: "#9A1E1E", // Đổi màu viền khi hover
                        },
                        "&:focus": {
                          outline: "none", // Bỏ viền focus
                        },
                      }}
                    >
                      Xóa
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

        </Table>
      </TableContainer>

      <Modal open={isModalOpen} onClose={closeModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: "8px",
            p: 4,
          }}
        >
          {modalType === "delete" ? (
            <>
              <Typography variant="h6" align="center">
                Xác Nhận Xóa
              </Typography>
              <Typography>
                Bạn có chắc chắn muốn xóa kho hàng này không?
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: 2 }}>
                <Button onClick={handleDeleteInventory} color="error" variant="contained">
                  Xóa
                </Button>
                <Button onClick={closeModal} variant="outlined" sx={{ marginLeft: 2 }}>
                  Hủy
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Typography variant="h6" align="center">
                {modalType === "add" ? "Thêm Kho Hàng" : "Sửa Kho Hàng"}
              </Typography>
              <TextField
                label="ID Sản Phẩm"
                name="ProductId"
                value={formData.ProductId}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Vị Trí Kho"
                name="WarehouseLocation"
                value={formData.WarehouseLocation}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Số Lượng Tồn Kho"
                name="QuantityInStock"
                value={formData.QuantityInStock}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: 2, gap: "10px" }}>
                <Button
                  onClick={modalType === "add" ? handleAddInventory : handleEditInventory}
                  sx={{
                    border: "1px solid #007BFF",
                    color: "#007BFF",
                    backgroundColor: "transparent",
                    "&:hover": {
                      borderColor: "#0056b3", // Đổi màu viền khi hover
                      backgroundColor: "transparent",
                    },
                    "&:focus": {
                      outline: "none", // Bỏ viền focus
                    },
                  }}
                >
                  {modalType === "add" ? "Thêm" : "Lưu"}
                </Button>
                <Button
                  onClick={closeModal}
                  sx={{
                    border: "1px solid #FFC107",
                    color: "#FFC107",
                    backgroundColor: "transparent",
                    "&:hover": {
                      borderColor: "#E0A800", // Đổi màu viền khi hover
                      backgroundColor: "transparent",
                    },
                    "&:focus": {
                      outline: "none", // Bỏ viền focus
                    },
                  }}
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

export default InventoryManagement;
