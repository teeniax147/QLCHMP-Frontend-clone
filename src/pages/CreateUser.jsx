import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Alert,
} from "@mui/material";
import { API_BASE_URL } from '../config'
const CreateUser = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    address: "",
    password: "",
    role: "Staff",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let formErrors = {};
    const { email, username, password, firstName, lastName, phone, role } = formData;

    // Email validation
    if (!email) {
      formErrors.email = "Vui lòng cung cấp email.";
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      formErrors.email = "Email phải hợp lệ, bao gồm '@' và tên miền.";
    }

    // Username validation
    if (!username) {
      formErrors.username = "Tên đăng nhập là bắt buộc.";
    } else if (username.length < 6 || username.length > 24) {
      formErrors.username = "Tên đăng nhập phải từ 6 đến 24 ký tự.";
    } else if (!/^[a-zA-Z0-9]{6,24}$/.test(username)) {
      formErrors.username = "Tên đăng nhập không được có khoảng trắng, ký tự đặc biệt, dấu chấm hoặc dấu gạch dưới.";
    }

    // Password validation
    if (!password) {
      formErrors.password = "Mật khẩu là bắt buộc.";
    } else if (password.length < 8 || password.length > 32) {
      formErrors.password = "Vui lòng nhập mật khẩu dài 8-32 ký tự.";
    } else if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/.test(password)) {
      formErrors.password = "Mật khẩu phải có ít nhất một ký tự hoa, một chữ số và một ký tự đặc biệt.";
    }

    // Last name validation
    if (!lastName) {
      formErrors.lastName = "Họ là bắt buộc.";
    } else if (lastName.length < 2 || lastName.length > 40) {
      formErrors.lastName = "Họ phải từ 2 đến 40 ký tự.";
    }

    // First name validation
    if (!firstName) {
      formErrors.firstName = "Tên là bắt buộc.";
    } else if (firstName.length < 2 || firstName.length > 40) {
      formErrors.firstName = "Tên phải từ 2 đến 40 ký tự.";
    }

    // Phone number validation
    if (!phone) {
      formErrors.phone = "Số điện thoại là bắt buộc.";
    } else if (!/^[0-9]{10}$/.test(phone)) {
      formErrors.phone = "Số điện thoại phải gồm 10 chữ số từ 0 đến 9.";
    }

    // Role validation
    if (!role) {
      formErrors.role = "Vai trò là bắt buộc.";
    } else if (!/^(Admin|Staff)$/.test(role)) {
      formErrors.role = "Vai trò chỉ có thể là 'Admin' hoặc 'Staff'.";
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/Users/create-user`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Response:", response);
      setMessage({ type: "success", text: "Người dùng đã được tạo thành công." });
    } catch (error) {
      console.error("Error:", error);

      // Kiểm tra lỗi từ API
      if (error.response && error.response.data) {
        const apiErrors = error.response.data.errors || {};
        let formErrors = {};

        // Xử lý lỗi trả về từ API và gán chúng cho từng trường
        for (const field in apiErrors) {
          formErrors[field] = apiErrors[field].join(", ");
        }

        setErrors(formErrors);
        setMessage({ type: "error", text: "Đã xảy ra lỗi khi tạo người dùng." });
      } else {
        // Xử lý lỗi không xác định từ hệ thống
        setMessage({ type: "error", text: "Đã xảy ra lỗi không xác định từ hệ thống." });
      }
    }
  };


  return (
    <Box
      component="form"
      sx={{
        maxWidth: 500,
        mx: "auto",
        mt: 5,
        p: 3,
        border: "1px solid #ccc",
        borderRadius: 2,
      }}
      onSubmit={handleSubmit}
    >
      <Typography variant="h5" sx={{ mb: 3, textAlign: "center" }}>
        Phân Quyền Người Dùng
      </Typography>
      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}
      <TextField
        fullWidth
        label="Tên tài khoản"
        name="username"
        value={formData.username}
        onChange={handleChange}
        error={Boolean(errors.username)}
        helperText={errors.username}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={Boolean(errors.email)}
        helperText={errors.email}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Số điện thoại"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        error={Boolean(errors.phone)}
        helperText={errors.phone}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Họ"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        error={Boolean(errors.firstName)}
        helperText={errors.firstName}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Tên"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        error={Boolean(errors.lastName)}
        helperText={errors.lastName}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Địa chỉ"
        name="address"
        value={formData.address}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        type="password"
        label="Mật khẩu"
        name="password"
        value={formData.password}
        onChange={handleChange}
        error={Boolean(errors.password)}
        helperText={errors.password}
        sx={{ mb: 2 }}
      />
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="role-label">Vai trò</InputLabel>
        <Select
          labelId="role-label"
          name="role"
          value={formData.role}
          onChange={handleChange}
        >
          <MenuItem value="Admin">Admin</MenuItem>
          <MenuItem value="Staff">Staff</MenuItem>
        </Select>
      </FormControl>
      <Button variant="contained" color="primary" fullWidth type="submit">
        Tạo Người Dùng
      </Button>
    </Box>
  );
};

export default CreateUser;
