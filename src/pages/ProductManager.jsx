import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  styled,
  Modal,
  Box,
  TextField,
  Typography,
} from "@mui/material";
import { API_BASE_URL } from '../config'
// Styled Components
const StyledTableCell = styled(TableCell)({
  textAlign: "center",
  fontWeight: "bold",
  fontSize: "16px",
});
const searchProducts = location.state?.products || [];
const StyledButton = styled(Button)(({ color }) => ({
  color: color,
  borderColor: color,
  margin: "0 5px",
  "&:hover": {
    borderColor: color,
    backgroundColor: "transparent",
  },
  "&:focus": {
    outline: "none",
  },
}));

const AddButton = styled(Button)({
  backgroundColor: "blue",
  color: "white",
  "&:hover": {
    backgroundColor: "#0056b3",
  },
  "&:focus": {
    outline: "none",
  },
});

// Modal Style
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const ProductManager = () => {
  const location = useLocation(); // Sử dụng useLocation
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]); // Đảm bảo là mảng
  const [selectedCategories, setSelectedCategories] = useState([]); // Đảm bảo là mảng
  const [currentProduct, setCurrentProduct] = useState({
    Name: "",
    Price: "",
    OriginalPrice: "",
    Description: "",
    ImageFile: "",
  });

  const pageSize = 10;
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
  useEffect(() => {
    fetchCategories();
  }, []);


  const fetchProducts = async (page) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Products/danh-sach`,
        { params: { pageNumber: page, pageSize: pageSize } }
      );

      // Log dữ liệu trả về từ API để kiểm tra
      console.log('Dữ liệu sản phẩm trả về:', response.data?.DanhSachSanPham?.$values);

      setProducts(response.data?.DanhSachSanPham?.$values || []);
      setTotalProducts(response.data?.TongSoSanPham || 0);
      setCurrentPage(page);
    } catch (error) {
      setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  // Hàm mở modal
  const openModal = (type, product = null) => {
    setModalType(type);
    setCurrentProduct(
      product || {
        Name: "",
        Price: "",
        OriginalPrice: "",
        Description: "",
        ImageFile: "",
        Brand: "",
        Categories:"",
      }
    );
    setPreviewImage(null); // Reset ảnh xem trước
    setSelectedBrands([]); // Reset lựa chọn thương hiệu
    setSelectedCategories([]); // Reset lựa chọn danh mục
    setModalVisible(true);
  };


  const handleAddProduct = async () => {
    console.log('Adding product with the following data:');
    console.log({
      Name: currentProduct.Name,
      Price: currentProduct.Price,
      OriginalPrice: currentProduct.OriginalPrice,
      Description: currentProduct.Description,
      selectedBrands,
      selectedCategories,
      selectedFile,
    });

    const formData = new FormData();
    formData.append("Name", currentProduct.Name);
    formData.append("Price", currentProduct.Price);
    formData.append("OriginalPrice", currentProduct.OriginalPrice);
    formData.append("Description", currentProduct.Description);
    formData.append("BrandIds", JSON.stringify(selectedBrands));
    formData.append("Categories", JSON.stringify(selectedCategories));
    if (selectedFile) {
      formData.append("ImageFile", selectedFile);
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_BASE_URL}/Products/them-moi`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Response Data:", response.data);
      fetchProducts(currentPage);
      alert("Thêm sản phẩm thành công!");
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error.response?.data || error.message);
      alert("Lỗi khi thêm sản phẩm. Vui lòng kiểm tra lại!");
    

    } finally {
      setModalVisible(false);
    }
  };




  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);  // Hiển thị ảnh xem trước
      };
      reader.readAsDataURL(file);
    }
  };



  // Hàm xử lý cập nhật sản phẩm
  const handleEditProduct = async () => {
    console.log("Dữ liệu gửi đi:", currentProduct); // Log để kiểm tra dữ liệu trước khi gửi
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/Products/cap-nhat/${currentProduct.Id}`,
        currentProduct,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchProducts(currentPage);
      alert("Cập nhật sản phẩm thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error.response?.data || error.message);
      alert("Lỗi khi cập nhật sản phẩm.");
    } finally {
      setModalVisible(false);
    }
  };

  // Hàm xử lý xóa sản phẩm
  const handleDeleteProduct = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_BASE_URL}/Products/xoa/${currentProduct.Id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchProducts(currentPage);
      alert("Xóa sản phẩm thành công!");
    } catch (error) {
      alert("Lỗi khi xóa sản phẩm.");
    } finally {
      setModalVisible(false);
    }
  };

  // Tổng số trang
  const totalPages = Math.ceil(totalProducts / pageSize);

  return (
    <div style={{ padding: "5px 0 0", marginTop: "40px", marginBottom: "20px" }}>
      <Typography variant="h4" align="center" gutterBottom>
        Danh Mục Sản Phẩm
      </Typography>
      <AddButton
        variant="contained"
        onClick={() => openModal("add")}
        style={{ marginBottom: "20px" }}
      >
        Thêm sản phẩm
      </AddButton>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <TableContainer
       
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <StyledTableCell>STT</StyledTableCell>
              <StyledTableCell>Tên sản phẩm</StyledTableCell>
              <StyledTableCell>Giá bán</StyledTableCell>
              <StyledTableCell>Giá gốc</StyledTableCell>
              <StyledTableCell>Mô tả</StyledTableCell>
              <StyledTableCell>Thương hiệu</StyledTableCell>
              <StyledTableCell>Danh mục</StyledTableCell>
              <StyledTableCell>Hình ảnh</StyledTableCell>
              <StyledTableCell>Hành động</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Không có sản phẩm nào!
                </TableCell>
              </TableRow>
            ) : (
              products.map((product, index) => (
                <TableRow key={product.Id}>
                  <TableCell align="center">{index + 1}</TableCell>
                  <TableCell align="center">{product.Name}</TableCell>
                  <TableCell align="center">{product.Price.toLocaleString()} VND</TableCell>
                  <TableCell align="center">{product.OriginalPrice.toLocaleString()} VND</TableCell>
                  <TableCell align="justify">{product.Description || "Không có mô tả"}</TableCell>
                  <TableCell align="center">{product.BrandName || "Không có thương hiệu"}</TableCell>
                  <TableCell align="center">
                    {product.Categories && product.Categories.$values && product.Categories.$values.length > 0
                      ? product.Categories.$values.join(", ")
                      : "Không có danh mục"}
                  </TableCell>




                 

                  <TableCell align="center">
                    <img src={product.ImageUrl} alt={product.Name || "Hình ảnh sản phẩm"} style={{ width: "50px", height: "50px" }} />
                  </TableCell>
                  <TableCell align="center">
                    <StyledButton
                      variant="outlined"
                      color="green"
                      onClick={() => openModal("edit", product)}
                    >
                      Sửa
                    </StyledButton>
                    <StyledButton
                      variant="outlined"
                      color="red"
                      onClick={() => openModal("delete", product)}
                    >
                      Xóa
                    </StyledButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>

        </Table>
      </TableContainer>
      {/* Phân trang */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "contained" : "outlined"}
            onClick={() => setCurrentPage(page)}
            style={{
              margin: "0 5px",
            }}
          >
            {page}
          </Button>
        ))}
      </div>

      <Modal
        open={modalVisible}
        onClose={() => setModalVisible(false)}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={modalStyle}>
          <Typography
            id="modal-title"
            variant="h6"
            component="h2"
            sx={{ marginBottom: 2 }}
          >
            {modalType === "add"
              ? "Thêm sản phẩm"
              : modalType === "edit"
                ? "Sửa sản phẩm"
                : "Xóa sản phẩm"}
          </Typography>
          {modalType === "delete" ? (
            <Typography id="modal-description" sx={{ mb: 2 }}>
              Bạn có chắc chắn muốn xóa sản phẩm này không?
            </Typography>
          ) : (
            <>
              <TextField
                label="Tên sản phẩm"
                fullWidth
                sx={{ mb: 2 }}
                value={currentProduct.Name}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    Name: e.target.value,
                  })
                }
              />
              <TextField
                label="Giá bán"
                fullWidth
                sx={{ mb: 2 }}
                value={currentProduct.Price}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    Price: e.target.value,
                  })
                }
              />
              <TextField
                label="Giá gốc"
                fullWidth
                sx={{ mb: 2 }}
                value={currentProduct.OriginalPrice}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    OriginalPrice: e.target.value,
                  })
                }
              />
              <TextField
                label="Mô tả"
                fullWidth
                sx={{ mb: 2 }}
                value={currentProduct.Description}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    Description: e.target.value,
                  })
                }
              />
               

               

              {/* Xem trước ảnh */}
              {previewImage && (
                <img src={previewImage} alt="Hình ảnh xem trước" style={{ width: "30%", height: "auto", marginBottom: "10px", borderRadius: "5px" }} />
              )}
              <TextField fullWidth type="file" onChange={handleImageChange} style={{ marginBottom: "10px" }} />
            </>
          )}
            
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={
                modalType === "add"
                  ? handleAddProduct
                  : modalType === "edit"
                    ? handleEditProduct
                    : handleDeleteProduct
              }
            >
              {modalType === "delete" ? "Xóa" : "Lưu"}
            </Button>
            <Button
              variant="outlined"
              color="warning"
              onClick={() => setModalVisible(false)}
            >
              Hủy
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default ProductManager;
