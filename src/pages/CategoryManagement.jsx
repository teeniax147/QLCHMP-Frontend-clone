import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from '../config';
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
  Paper,
  Typography,
  Container,
  Box,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CategoryIcon from '@mui/icons-material/Category';
import DescriptionIcon from '@mui/icons-material/Description';

// Styled components
const StyledTableContainer = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(3),
  borderRadius: 12,
  overflow: 'hidden',
  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: '#e91e63',
}));

const HeaderTableCell = styled(TableCell)(({ theme }) => ({
  textAlign: "center",
  fontWeight: "600",
  fontSize: "16px",
  color: "white",
  padding: theme.spacing(2),
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: alpha('#e91e63', 0.05),
  },
  '&:hover': {
    backgroundColor: alpha('#e91e63', 0.1),
    transition: 'all 0.2s ease',
  },
  transition: 'all 0.2s ease',
}));

const BodyTableCell = styled(TableCell)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(2),
  fontSize: '15px',
}));

const ActionButtonsCell = styled(TableCell)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(1),
}));

const StyledButton = styled(Button)(({ theme, customvariant }) => ({
  borderRadius: 8,
  padding: '8px 16px',
  fontWeight: 500,
  textTransform: 'none',
  boxShadow: 'none',
  transition: 'all 0.2s ease',

  ...(customvariant === "add" && {
    backgroundColor: '#e91e63',
    color: 'white',
    '&:hover': {
      backgroundColor: '#c2185b',
      boxShadow: `0 4px 12px ${alpha('#e91e63', 0.3)}`,
    },
  }),
  ...(customvariant === "edit" && {
    color: '#e91e63',
    border: `1px solid #e91e63`,
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: alpha('#e91e63', 0.05),
    },
  }),
  ...(customvariant === "delete" && {
    color: '#e91e63',
    border: `1px solid #e91e63`,
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: alpha('#e91e63', 0.05),
    },
  }),
  ...(customvariant === "save" && {
    backgroundColor: '#e91e63',
    color: 'white',
    '&:hover': {
      backgroundColor: '#c2185b',
      boxShadow: `0 4px 12px ${alpha('#e91e63', 0.3)}`,
    },
  }),
  ...(customvariant === "cancel" && {
    color: '#9e9e9e',
    border: `1px solid #9e9e9e`,
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: alpha('#9e9e9e', 0.05),
    },
  }),
  '&:focus': {
    outline: "none",
  },
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.8rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  '& svg': {
    marginRight: theme.spacing(1),
    color: '#e91e63',
  }
}));

const SubCategoryChip = styled(Chip)(({ theme }) => ({
  margin: '2px',
  backgroundColor: alpha('#e91e63', 0.1),
  border: `1px solid ${alpha('#e91e63', 0.3)}`,
  fontSize: '0.8rem',
  color: '#e91e63',
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme, color }) => ({
  backgroundColor: '#e91e63',
  color: 'white',
  padding: theme.spacing(2),
}));

const FormSectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  '& svg': {
    marginRight: theme.spacing(1),
    color: '#e91e63',
  }
}));

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    Name: "",
    Description: "",
    ParentId: ""
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const flattenCategories = (categories) => {
    let flatList = [];
    categories.forEach((category) => {
      if (category?.Id && category?.Name) {
        flatList.push({
          Id: category.Id,
          Name: category.Name,
          Description: category?.Description || "",
          ParentName: category?.Parent?.Name || "",
          ParentId: category?.Parent?.Id || null,
          SubCategories: category?.InverseParent?.$values?.map((sub) => sub.Name).join(", ") || "",
          SubCategoriesArray: category?.InverseParent?.$values?.map(sub => sub.Name) || []
        });
      }

      if (category?.InverseParent?.$values?.length > 0) {
        flatList = flatList.concat(flattenCategories(category.InverseParent.$values));
      }
    });
    return flatList;
  };

  // Format categories for parent dropdown
  const flattenNestedCategories = (categories, level = 0) => {
    let flatList = [];
    categories.forEach((category) => {
      if (category?.Id && category?.Name) {
        flatList.push({
          Id: category.Id,
          Name: `${"-".repeat(level)} ${category.Name}`,
        });

        if (category?.InverseParent?.$values?.length > 0) {
          flatList = flatList.concat(
            flattenNestedCategories(category.InverseParent.$values, level + 1)
          );
        }
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
        const flatCategories = flattenCategories(response.data.$values || []);
        setCategories(flatCategories);

        // Also prepare a list for parent categories dropdown
        const parentCategoriesList = flattenNestedCategories(response.data.$values || []);
        setParentCategories(parentCategoriesList);
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

      // Gửi đúng định dạng dữ liệu mà API yêu cầu
      const categoryData = {
        Id: selectedCategory.Id,
        Name: selectedCategory.Name,
        Description: selectedCategory.Description,
        ParentId: selectedCategory.ParentId === "" ? null : selectedCategory.ParentId
      };

      await axios.put(
        `${API_BASE_URL}/Categories/${selectedCategory.Id}`,
        categoryData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setShowEditModal(false);
      fetchCategories();

      setSuccessMessage("Cập nhật danh mục thành công!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Lỗi khi cập nhật danh mục:", err.response?.data || err.message);
      setErrorMessage(err.response?.data || "Lỗi khi cập nhật danh mục.");
      setTimeout(() => setErrorMessage(""), 3000);
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

      setShowDeleteModal(false);
      fetchCategories();

      setSuccessMessage("Xóa danh mục thành công!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setErrorMessage("Lỗi khi xóa danh mục.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.Name) {
      setErrorMessage("Vui lòng nhập tên danh mục");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token không tồn tại.");

      const categoryData = {
        Name: newCategory.Name,
        Description: newCategory.Description || "",
        ParentId: newCategory.ParentId === "" ? null : newCategory.ParentId
      };

      await axios.post(
        `${API_BASE_URL}/Categories`,
        categoryData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setShowAddModal(false);
      setNewCategory({ Name: "", Description: "", ParentId: "" });
      fetchCategories();

      setSuccessMessage("Thêm danh mục thành công!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Lỗi khi thêm danh mục:", err.response?.data || err.message);
      setErrorMessage(err.response?.data || "Lỗi khi thêm danh mục. Vui lòng thử lại.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const renderCategories = () => {
    if (!categories || categories.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} sx={{ textAlign: "center", padding: 3 }}>
            <Typography variant="body1" color="text.secondary">
              Không có danh mục nào để hiển thị
            </Typography>
          </TableCell>
        </TableRow>
      );
    }

    return categories.map((category, index) => (
      <StyledTableRow key={index}>
        <BodyTableCell>{index + 1}</BodyTableCell>
        <BodyTableCell>
          <Typography fontWeight={500}>{category.Name}</Typography>
        </BodyTableCell>
        <BodyTableCell>{category.Description || "Không có mô tả"}</BodyTableCell>
        <BodyTableCell>
          {category.SubCategoriesArray && category.SubCategoriesArray.length > 0 ? (
            <Box display="flex" flexWrap="wrap" justifyContent="center" gap={0.5}>
              {category.SubCategoriesArray.map((subCategory, idx) => (
                <SubCategoryChip key={idx} label={subCategory} size="small" />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">Không có</Typography>
          )}
        </BodyTableCell>
        <ActionButtonsCell>
          <Box display="flex" justifyContent="center" gap={1}>
            <Tooltip title="Chỉnh sửa">
              <IconButton
                size="small"
                sx={{
                  border: '1px solid #e91e63',
                  color: '#e91e63',
                  '&:hover': { backgroundColor: alpha('#e91e63', 0.1) }
                }}
                onClick={() => handleEdit(category)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Xóa">
              <IconButton
                size="small"
                sx={{
                  border: '1px solid #e91e63',
                  color: '#e91e63',
                  '&:hover': { backgroundColor: alpha('#e91e63', 0.1) }
                }}
                onClick={() => {
                  setSelectedCategory(category);
                  setShowDeleteModal(true);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </ActionButtonsCell>
      </StyledTableRow>
    ));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <PageTitle variant="h4">
          <CategoryIcon fontSize="large" />
          Quản Lý Danh Mục Sản Phẩm
        </PageTitle>
        <StyledButton
          customvariant="add"
          startIcon={<AddCircleIcon />}
          onClick={() => setShowAddModal(true)}
          size="large"
        >
          Thêm Danh Mục
        </StyledButton>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Alerts */}
      {successMessage && (
        <Alert
          severity="success"
          variant="filled"
          sx={{
            mb: 2,
            borderRadius: 2,
            boxShadow: 2,
            backgroundColor: '#e91e63'
          }}
          onClose={() => setSuccessMessage("")}
        >
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert
          severity="error"
          variant="filled"
          sx={{
            mb: 2,
            borderRadius: 2,
            boxShadow: 2,
            backgroundColor: '#e91e63'
          }}
          onClose={() => setErrorMessage("")}
        >
          {errorMessage}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={5}>
          <CircularProgress sx={{ color: '#e91e63' }} />
          <Typography ml={2} variant="body1" color="text.secondary">
            Đang tải danh mục...
          </Typography>
        </Box>
      ) : error ? (
        <Alert
          severity="error"
          sx={{
            mt: 2,
            borderRadius: 2,
            backgroundColor: 'rgba(233, 30, 99, 0.1)',
            color: '#e91e63',
            '& .MuiAlert-icon': {
              color: '#e91e63'
            }
          }}
        >
          {error}
        </Alert>
      ) : (
        <StyledTableContainer>
          <Table>
            <StyledTableHead>
              <TableRow>
                <HeaderTableCell>STT</HeaderTableCell>
                <HeaderTableCell>Tên danh mục</HeaderTableCell>
                <HeaderTableCell>Mô tả</HeaderTableCell>
                <HeaderTableCell>Danh mục con</HeaderTableCell>
                <HeaderTableCell>Hành động</HeaderTableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>{renderCategories()}</TableBody>
          </Table>
        </StyledTableContainer>
      )}

      {/* Modal thêm danh mục mới */}
      <Dialog
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 2, overflow: 'hidden' }
        }}
      >
        <StyledDialogTitle>
          <Box display="flex" alignItems="center">
            <AddCircleIcon sx={{ mr: 1 }} />
            Thêm Danh Mục Mới
          </Box>
        </StyledDialogTitle>
        <DialogContent sx={{ pt: 3, pb: 1 }}>
          <Box mb={2}>
            <FormSectionTitle>
              <CategoryIcon />
              Thông tin danh mục
            </FormSectionTitle>

            <TextField
              label="Tên danh mục"
              value={newCategory.Name}
              onChange={(e) => setNewCategory({ ...newCategory, Name: e.target.value })}
              fullWidth
              margin="dense"
              variant="outlined"
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#e91e63',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#e91e63',
                },
              }}
              required
            />

            <TextField
              label="Mô tả"
              value={newCategory.Description}
              onChange={(e) => setNewCategory({ ...newCategory, Description: e.target.value })}
              fullWidth
              margin="dense"
              multiline
              rows={3}
              variant="outlined"
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#e91e63',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#e91e63',
                },
              }}
            />

            <Divider sx={{ my: 2 }} />

            <FormSectionTitle>
              <CategoryIcon />
              Danh mục cha
            </FormSectionTitle>

            <FormControl fullWidth margin="dense">
              <InputLabel sx={{
                '&.Mui-focused': {
                  color: '#e91e63',
                },
              }}>Danh mục cha</InputLabel>
              <Select
                value={newCategory.ParentId}
                onChange={(e) => setNewCategory({ ...newCategory, ParentId: e.target.value })}
                label="Danh mục cha"
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    '&.Mui-focused': {
                      borderColor: '#e91e63',
                    },
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e91e63',
                  },
                }}
              >
                <MenuItem value="">-- Không có --</MenuItem>
                {parentCategories.map((cat) => (
                  <MenuItem key={cat.Id} value={cat.Id}>
                    {cat.Name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <StyledButton customvariant="cancel" onClick={() => setShowAddModal(false)}>
            Hủy
          </StyledButton>
          <StyledButton customvariant="save" onClick={handleAddCategory} startIcon={<AddCircleIcon />}>
            Thêm Danh Mục
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Modal chỉnh sửa */}
      <Dialog
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 2, overflow: 'hidden' }
        }}
      >
        <StyledDialogTitle>
          <Box display="flex" alignItems="center">
            <EditIcon sx={{ mr: 1 }} />
            Chỉnh sửa danh mục
          </Box>
        </StyledDialogTitle>
        <DialogContent sx={{ pt: 3, pb: 1 }}>
          <Box mb={2}>
            <FormSectionTitle>
              <CategoryIcon />
              Thông tin danh mục
            </FormSectionTitle>

            <TextField
              label="Tên danh mục"
              value={selectedCategory?.Name || ""}
              onChange={(e) => setSelectedCategory({ ...selectedCategory, Name: e.target.value })}
              fullWidth
              margin="dense"
              variant="outlined"
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#e91e63',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#e91e63',
                },
              }}
              required
            />

            <TextField
              label="Mô tả"
              value={selectedCategory?.Description || ""}
              onChange={(e) => setSelectedCategory({ ...selectedCategory, Description: e.target.value })}
              fullWidth
              margin="dense"
              multiline
              rows={3}
              variant="outlined"
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#e91e63',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#e91e63',
                },
              }}
            />

            <Divider sx={{ my: 2 }} />

            <FormSectionTitle>
              <CategoryIcon />
              Danh mục cha
            </FormSectionTitle>

            <FormControl fullWidth margin="dense">
              <InputLabel sx={{
                '&.Mui-focused': {
                  color: '#e91e63',
                },
              }}>Danh mục cha</InputLabel>
              <Select
                value={selectedCategory?.ParentId || ""}
                onChange={(e) => setSelectedCategory({ ...selectedCategory, ParentId: e.target.value })}
                label="Danh mục cha"
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    '&.Mui-focused': {
                      borderColor: '#e91e63',
                    },
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e91e63',
                  },
                }}
              >
                <MenuItem value="">-- Không có --</MenuItem>
                {parentCategories.map((cat) => (
                  <MenuItem key={cat.Id} value={cat.Id}>
                    {cat.Name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <StyledButton customvariant="cancel" onClick={() => setShowEditModal(false)}>
            Hủy
          </StyledButton>
          <StyledButton customvariant="save" onClick={handleSave} startIcon={<EditIcon />}>
            Lưu thay đổi
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Modal xác nhận xóa */}
      <Dialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        PaperProps={{
          sx: { borderRadius: 2, overflow: 'hidden' }
        }}
      >
        <StyledDialogTitle>
          <Box display="flex" alignItems="center">
            <DeleteIcon sx={{ mr: 1 }} />
            Xác nhận xóa
          </Box>
        </StyledDialogTitle>
        <DialogContent sx={{ pt: 3, minWidth: '400px' }}>
          <Typography variant="body1">
            Bạn có chắc muốn xóa danh mục: <Box component="span" fontWeight="bold">{selectedCategory?.Name}</Box>?
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: '#e91e63' }}>
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <StyledButton customvariant="cancel" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </StyledButton>
          <StyledButton customvariant="delete" onClick={handleDelete} startIcon={<DeleteIcon />}>
            Xác nhận xóa
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CategoryManagement;