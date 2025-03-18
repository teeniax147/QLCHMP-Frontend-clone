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

// Update the modalStyle object to handle overflow properly
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  maxHeight: "80vh", // Set maximum height to 80% of viewport height
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  overflow: "auto", // Enable scrolling for the modal content
  borderRadius: "8px", // Optional: makes the modal look nicer
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
  const [categories, setCategories] = useState([]); // Khai báo categories

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
      if (category?.Name && category?.Name !== "Không có tên") { // Filter out invalid categories
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

      // Process and clean the products data
      const productsData = response.data?.DanhSachSanPham?.$values || [];
      const cleanedProducts = productsData.map((product) => ({
        ...product, // Keep existing product data
        ImageUrl: product.ImageUrl
          ? `https://localhost:5001/${product.ImageUrl}`  // Ensure image URL is correct
          : "default-image.jpg",  // Provide a default image if not available
      }));

      // Set the cleaned product data to state
      setProducts(cleanedProducts);
      setTotalProducts(response.data?.TongSoSanPham || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error("Lỗi khi tải danh sách sản phẩm:", error);
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
        Categories: "",
      }
    );
    setPreviewImage(null); // Reset ảnh xem trước
    setSelectedBrands([]); // Reset lựa chọn thương hiệu
    setSelectedCategories([]); // Reset lựa chọn danh mục
    setModalVisible(true);
  };


  const handleAddProduct = async () => {
    const formData = new FormData();

    // Basic validation
    if (!currentProduct.Name || !currentProduct.Price) {
      alert("Vui lòng nhập đầy đủ thông tin sản phẩm");
      return;
    }

    // Check if categories are valid
    if (!selectedCategories || selectedCategories.length === 0) {
      alert("Vui lòng chọn ít nhất một danh mục");
      return;
    }

    // Add text fields
    formData.append("Name", currentProduct.Name);
    formData.append("Price", parseFloat(currentProduct.Price));
    formData.append("OriginalPrice", parseFloat(currentProduct.OriginalPrice));
    formData.append("Description", currentProduct.Description);

    // Add arrays properly - important fix
    selectedBrands.forEach(brandId => {
      formData.append("BrandIds", brandId);
    });

    selectedCategories.forEach(categoryId => {
      formData.append("Categories", categoryId);
    });

    // Add image if selected
    if (selectedFile) {
      formData.append("ImageFile", selectedFile);
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token không tồn tại.");

      const response = await axios.post(`${API_BASE_URL}/Products/them-moi`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Thêm sản phẩm thành công!");
      fetchProducts(currentPage);
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      alert(`Lỗi khi thêm sản phẩm: ${error.response?.data?.message || error.message}`);
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
        setPreviewImage(reader.result); // Show image preview
      };
      reader.readAsDataURL(file);
    }
  };



  


  const handleEditProduct = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token không tồn tại.");

      // Create FormData for multipart submission
      const formData = new FormData();

      // Add basic product fields
      formData.append("Id", currentProduct.Id);
      formData.append("Name", currentProduct.Name);
      formData.append("Price", parseFloat(currentProduct.Price));
      formData.append("OriginalPrice", parseFloat(currentProduct.OriginalPrice));
      formData.append("Description", currentProduct.Description);

      // Add selected brands
      selectedBrands.forEach(brandId => {
        formData.append("BrandIds", brandId);
      });

      // Add selected categories
      selectedCategories.forEach(categoryId => {
        formData.append("Categories", categoryId);
      });

      // Add image if a new one was selected
      if (selectedFile) {
        formData.append("ImageFile", selectedFile);
      }

      // Make the PUT request with FormData
      const response = await axios.put(
        `${API_BASE_URL}/Products/cap-nhat/${currentProduct.Id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchProducts(currentPage);
      alert("Cập nhật sản phẩm thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error.response?.data || error.message);
      alert(`Lỗi khi cập nhật sản phẩm: ${error.response?.data?.message || error.message}`);
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
                  <TableCell align="center">{product.Price.toLocaleString()}đ</TableCell>
                  <TableCell align="center">{product.OriginalPrice.toLocaleString()}đ</TableCell>
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
          <Typography id="modal-title" variant="h6" component="h2" sx={{ marginBottom: 2 }}>
            {modalType === "add" ? "Thêm sản phẩm" : modalType === "edit" ? "Sửa sản phẩm" : "Xóa sản phẩm"}
          </Typography>

          <Box sx={{ overflowY: "auto" }}> {/* This inner box will handle scrolling for form content */}
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
                  onChange={(e) => setCurrentProduct({ ...currentProduct, Name: e.target.value })}
                />
                <TextField
                  label="Giá bán"
                  fullWidth
                  sx={{ mb: 2 }}
                  value={currentProduct.Price}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, Price: e.target.value })}
                />
                <TextField
                  label="Giá gốc"
                  fullWidth
                  sx={{ mb: 2 }}
                  value={currentProduct.OriginalPrice}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, OriginalPrice: e.target.value })}
                />
                <TextField
                  label="Mô tả"
                  fullWidth
                  sx={{ mb: 2 }}
                  value={currentProduct.Description}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, Description: e.target.value })}
                />

                <div style={{ marginBottom: "16px" }}>
                  <Typography variant="subtitle1" gutterBottom>Chọn Thương Hiệu:</Typography>
                  <select
                    multiple
                    style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                    onChange={(e) => setSelectedBrands([...e.target.selectedOptions].map(opt => parseInt(opt.value)))}
                  >
                    {brands.map(brand => (
                      <option key={brand.Id} value={brand.Id}>{brand.Name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <Typography variant="subtitle1" gutterBottom>Chọn Danh Mục:</Typography>
                  <select
                    multiple
                    size={5} // Reduced size to fit better in the modal
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ccc",
                      borderRadius: "4px"
                    }}
                    onChange={(e) => {
                      const selectedValues = [...e.target.selectedOptions].map(opt => {
                        return parseInt(opt.value);
                      }).filter(id => !isNaN(id));
                      console.log("Selected categories:", selectedValues);
                      setSelectedCategories(selectedValues);
                    }}
                  >
                    {categories && categories.length > 0 ? (
                      categories.map((category) => (
                        <option key={category.Id} value={category.Id}>
                          {category.Name}
                        </option>
                      ))
                    ) : (
                      <option value="">Không có danh mục</option>
                    )}
                  </select>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <Typography variant="subtitle1" gutterBottom>Hình ảnh sản phẩm:</Typography>
                  <input type="file" onChange={handleImageChange} />
                  {previewImage && <img src={previewImage} alt="Preview" style={{ width: '100%', marginTop: '10px' }} />}
                </div>
              </>
            )}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2, pt: 2, borderTop: "1px solid #eee" }}>
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
            <Button variant="outlined" color="warning" onClick={() => setModalVisible(false)}>
              Hủy
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default ProductManager;
