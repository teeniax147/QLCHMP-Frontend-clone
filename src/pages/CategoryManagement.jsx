import React, { useEffect, useState } from "react";
import axios from "axios";
import { styled } from "@mui/material/styles";
import { API_BASE_URL } from '../config'
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";


// Add a new styled component for the content cells with justify alignment
const StyledTableCell = styled(TableCell)({
  textAlign: "center", // This aligns text evenly on both sides
  fontSize: "16px",
 fontWeight: "bold",
});
const StyledButton = styled(Button)(({ variant }) => ({
  marginRight: "10px",
  ...(variant === "add" && {
    backgroundColor: "blue",
    color: "white",
    "&:hover": {
      borderColor: "blue",
    },
  }),
  ...(variant === "edit" && {
    border: "1px solid green",
    color: "green",
    backgroundColor: "transparent",
    "&:hover": {
      borderColor: "darkgreen",
    },
  }),
  ...(variant === "delete" && {
    border: "1px solid red",
    color: "red",
    backgroundColor: "transparent",
    "&:hover": {
      borderColor: "darkred",
    },
  }),
  ...(variant === "save" && {
    border: "1px solid blue",
    color: "blue",
    backgroundColor: "transparent",
    "&:hover": {
      borderColor: "darkblue",
    },
  }),
  ...(variant === "cancel" && {
    border: "1px solid orange",
    color: "orange",
    backgroundColor: "transparent",
    "&:hover": {
      borderColor: "darkorange",
    },
  }),
  "&:focus": {
    outline: "none",
  },
}));

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null); // Danh mục đang chọn
  const [showEditModal, setShowEditModal] = useState(false); // Hiển thị modal chỉnh sửa
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Hiển thị modal xóa

  const navigate = useNavigate();

  const flattenCategories = (categories) => {
    let flatList = [];
    categories.forEach((category) => {
      flatList.push({
        Id: category?.Id || "Không có ID",
        Name: category?.Name || "Không có tên",
        Description: category?.Description || "Không có mô tả",
        ParentName: category?.Parent?.Name || "Không có",
        SubCategories:
          category?.InverseParent?.$values
            ?.map((sub) => sub.Name)
            .join(", ") || "Không có",
      });

      if (category?.InverseParent?.$values?.length > 0) {
        flatList = flatList.concat(flattenCategories(category.InverseParent.$values));
      }
    });
    return flatList;
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
      }

      const response = await axios.get(`${API_BASE_URL}/Categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.status === 200 && response.data) {
        // console.log("Dữ liệu trả về từ API:", response.data);
        const flatCategories = flattenCategories(response.data.$values || []);
        setCategories(flatCategories);
      } else {
        throw new Error("Dữ liệu trả về không hợp lệ.");
      }
    } catch (err) {
      console.error("Lỗi API:", err);
      setError(
        err.response?.data?.message ||
        "Không thể lấy danh mục. Vui lòng kiểm tra lại API hoặc kết nối mạng."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token không tồn tại.");

      await axios.put(
        `${API_BASE_URL}/Categories/${selectedCategory.Id}`,
        selectedCategory,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Cập nhật danh mục thành công!");
      setShowEditModal(false);
      fetchCategories(); // Tải lại danh sách
    } catch (err) {
      alert("Lỗi khi cập nhật danh mục.");
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token không tồn tại.");

      await axios.delete(
        `${API_BASE_URL}/Categories/${selectedCategory.Id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Xóa danh mục thành công!");
      setShowDeleteModal(false);
      fetchCategories(); // Tải lại danh sách
    } catch (err) {
      alert("Lỗi khi xóa danh mục.");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const renderCategories = () => {
    if (!categories || categories.length === 0) {
      return (
        <tr>
          <td colSpan="6" style={{ textAlign: "center" }}>
            Không có danh mục nào để hiển thị
          </td>
        </tr>
      );
    }

    // Lọc các danh mục hợp lệ (có ID và tên)
    const validCategories = categories.filter(
      (category) => category.Id !== "Không có ID" && category.Name !== "Không có tên"
    );

    if (validCategories.length === 0) {
      return (
        <tr>
          <td colSpan="6" style={{ textAlign: "center" }}>
            Không có danh mục nào để hiển thị
          </td>
        </tr>
      );
    }

    return validCategories.map((category, index) => (
      <tr key={index}>
        <td >{index + 1}</td>
        <td>{category.Name}</td>
        <td>{category.Description}</td>
        <td>{category.SubCategories}</td>
        <td>
          <button onClick={() => handleEdit(category)}>Sửa</button>
          <button
            onClick={() => {
              setSelectedCategory(category);
              setShowDeleteModal(true);
            }}
          >
            Xóa
          </button>
        </td>
      </tr>
    ));
  };

  if (loading) return <p>Đang tải danh mục...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;



  return (
    <div style={{ padding: "5px 0 0", marginTop: "40px", marginBottom: "20px" }}>
      <h2>Quản Lý Danh Mục Sản Phẩm</h2>
      <StyledButton
        variant="add"
        onClick={() => navigate("/admin/add-category")}
      >
        Thêm
      </StyledButton>
      <Table>
        <TableHead>
          <TableRow>
            <StyledTableCell align="justify">STT</StyledTableCell>
            <StyledTableCell align="justify">Tên danh mục</StyledTableCell>
            <StyledTableCell align="justify">Mô tả</StyledTableCell>
            <StyledTableCell align="justify">Danh mục con</StyledTableCell>
            <StyledTableCell align="justify">Hành động</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>{renderCategories()}</TableBody>
      </Table>

      {/* Modal chỉnh sửa */}
      <Dialog open={showEditModal} onClose={() => setShowEditModal(false)}>
        <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
        <DialogContent>
          <TextField
            label="Tên danh mục"
            value={selectedCategory?.Name || ""}
            onChange={(e) =>
              setSelectedCategory({ ...selectedCategory, Name: e.target.value })
            }
            fullWidth
            margin="dense"
          />
          <TextField
            label="Mô tả"
            value={selectedCategory?.Description || ""}
            onChange={(e) =>
              setSelectedCategory({
                ...selectedCategory,
                Description: e.target.value,
              })
            }
            fullWidth
            margin="dense"
            multiline
          />
        </DialogContent>
        <DialogActions>
          <StyledButton variant="save" onClick={handleSave}>
            Lưu
          </StyledButton>
          <StyledButton variant="cancel" onClick={() => setShowEditModal(false)}>
            Hủy
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Modal xác nhận xóa */}
      <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          Bạn có chắc muốn xóa danh mục: <b>{selectedCategory?.Name}</b>?
        </DialogContent>
        <DialogActions>
          <StyledButton variant="delete" onClick={handleDelete}>
            Xóa
          </StyledButton>
          <StyledButton
            variant="cancel"
            onClick={() => setShowDeleteModal(false)}
          >
            Hủy
          </StyledButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CategoryManagement;