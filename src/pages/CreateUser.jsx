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
  Container,
  Paper,
  Grid,
  Divider,
  styled,
  InputAdornment,
  IconButton,
  alpha,
  Chip
} from "@mui/material";
import { API_BASE_URL } from '../config';

// Import Icons
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import HomeIcon from '@mui/icons-material/Home';
import LockIcon from '@mui/icons-material/Lock';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// Styled Components
const PageTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.8rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& svg': {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  }
}));

const StyledFormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  borderRadius: 12,
  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  '& svg': {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  }
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  padding: '12px',
  borderRadius: 8,
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  boxShadow: 'none',
  marginTop: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 0,
    fontWeight: 500,
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
}));

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
  const [showPassword, setShowPassword] = useState(false);

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

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
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

      // Reset form after successful submission
      setFormData({
        username: "",
        email: "",
        phone: "",
        firstName: "",
        lastName: "",
        address: "",
        password: "",
        role: "Staff",
      });
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
    <Container maxWidth="md">
      <PageTitle variant="h4" marginTop={'30px'}>
        <PersonAddIcon fontSize="large" />
        Phân Quyền Người Dùng
      </PageTitle>

      <StyledFormContainer elevation={3}>
        {message.text && (
          <Alert
            severity={message.type}
            sx={{
              mb: 3,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              '& .MuiAlert-icon': {
                fontSize: '1.5rem'
              }
            }}
            icon={message.type === 'success' ? <CheckCircleOutlineIcon fontSize="inherit" /> : undefined}
          >
            <Typography variant="body1">{message.text}</Typography>
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <SectionTitle variant="h6">
                <AccountCircleIcon />
                Thông tin tài khoản
              </SectionTitle>

              <StyledTextField
                fullWidth
                label="Tên tài khoản"
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={Boolean(errors.username)}
                helperText={errors.username}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircleIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />

              <StyledTextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={Boolean(errors.email)}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />

              <StyledTextField
                fullWidth
                label="Số điện thoại"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={Boolean(errors.phone)}
                helperText={errors.phone}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <SectionTitle variant="h6">
                <BadgeIcon />
                Thông tin cá nhân
              </SectionTitle>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    fullWidth
                    label="Họ"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    error={Boolean(errors.firstName)}
                    helperText={errors.firstName}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    fullWidth
                    label="Tên"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    error={Boolean(errors.lastName)}
                    helperText={errors.lastName}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <StyledTextField
                fullWidth
                label="Địa chỉ"
                name="address"
                value={formData.address}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HomeIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <SectionTitle variant="h6">
                <LockIcon />
                Bảo mật & Phân quyền
              </SectionTitle>

              <StyledTextField
                fullWidth
                type={showPassword ? "text" : "password"}
                label="Mật khẩu"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={Boolean(errors.password)}
                helperText={errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <StyledFormControl fullWidth>
                <InputLabel id="role-label">Vai trò</InputLabel>
                <Select
                  labelId="role-label"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  error={Boolean(errors.role)}
                  startAdornment={
                    <InputAdornment position="start" sx={{ ml: 1 }}>
                      <AdminPanelSettingsIcon color="primary" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="Admin">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AdminPanelSettingsIcon sx={{ mr: 1, color: 'error.main' }} />
                      <Typography>Admin</Typography>
                      <Chip
                        label="Toàn quyền"
                        size="small"
                        color="error"
                        variant="outlined"
                        sx={{ ml: 1, height: 20 }}
                      />
                    </Box>
                  </MenuItem>
                  <MenuItem value="Staff">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AdminPanelSettingsIcon sx={{ mr: 1, color: 'info.main' }} />
                      <Typography>Staff</Typography>
                      <Chip
                        label="Hạn chế"
                        size="small"
                        color="info"
                        variant="outlined"
                        sx={{ ml: 1, height: 20 }}
                      />
                    </Box>
                  </MenuItem>
                </Select>
              </StyledFormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <SubmitButton
                variant="contained"
                fullWidth
                type="submit"
                startIcon={<PersonAddIcon />}
              >
                Tạo Người Dùng
              </SubmitButton>
            </Grid>
          </Grid>
        </Box>
      </StyledFormContainer>
    </Container>
  );
};

export default CreateUser;