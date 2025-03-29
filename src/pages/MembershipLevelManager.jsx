import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Snackbar,
    Container,
    Typography,
    Box,
    Divider,
    IconButton,
    Grid,
    styled,
    alpha,
    Alert,
    CircularProgress,
    Chip
} from "@mui/material";

// Import icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PeopleIcon from '@mui/icons-material/People';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import RedeemIcon from '@mui/icons-material/Redeem';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DiscountIcon from '@mui/icons-material/Discount';

// Styled Components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
    marginTop: theme.spacing(3),
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
    backgroundColor: '#e91e63',
}));

const HeaderTableCell = styled(TableCell)(({ theme }) => ({
    textAlign: "center",
    fontWeight: "600",
    fontSize: "15px",
    color: "white",
    padding: theme.spacing(1.5),
    whiteSpace: 'nowrap',
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
    padding: theme.spacing(1.5),
    fontSize: '14px',
}));

const ActionButtonsCell = styled(TableCell)(({ theme }) => ({
    textAlign: "center",
    padding: theme.spacing(1),
    whiteSpace: 'nowrap',
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

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    backgroundColor: '#e91e63',
    color: 'white',
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    '& svg': {
        marginRight: theme.spacing(1),
    }
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

const MembershipChip = styled(Chip)(({ theme }) => ({
    borderColor: '#e91e63',
    color: '#e91e63',
    '& .MuiChip-icon': {
        color: '#e91e63',
    }
}));

const DiscountChip = styled(Chip)(({ theme }) => ({
    borderColor: '#e91e63',
    color: '#e91e63',
    '& .MuiChip-icon': {
        color: '#e91e63',
    }
}));

const MembershipLevelManager = () => {
    const [membershipLevels, setMembershipLevels] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const [newLevel, setNewLevel] = useState({ LevelName: "", MinimumSpending: 0, Benefits: "", DiscountRate: 0 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMembershipLevels();
    }, []);

    const fetchMembershipLevels = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/MembershipLevels`);
            console.log("Dữ liệu từ API:", response.data);
            setMembershipLevels(response.data?.$values || []);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
            setSnackbar({
                open: true,
                message: "Không thể tải dữ liệu cấp độ thành viên. Vui lòng thử lại!",
                severity: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (level) => {
        setSelectedLevel(level);
        setOpenEditDialog(true);
    };

    const handleSaveChanges = async () => {
        if (!selectedLevel) return;
        try {
            await axios.put(`${API_BASE_URL}/MembershipLevels/${selectedLevel.MembershipLevelId}`, selectedLevel, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setSnackbar({ open: true, message: "Cập nhật thành công!", severity: "success" });
            setOpenEditDialog(false);
            fetchMembershipLevels();
        } catch (error) {
            console.error("Lỗi khi cập nhật cấp độ thành viên:", error.response?.data || error.message);
            setSnackbar({
                open: true,
                message: "Lỗi khi cập nhật cấp độ thành viên!",
                severity: "error"
            });
        }
    };

    const handleAddNewLevel = async () => {
        try {
            const payload = {
                LevelName: newLevel.LevelName.trim(),
                MinimumSpending: parseFloat(newLevel.MinimumSpending) || 0,
                Benefits: newLevel.Benefits.trim(),
                DiscountRate: parseFloat(newLevel.DiscountRate) || 0
            };

            console.log("Dữ liệu gửi lên API:", JSON.stringify(payload, null, 2));

            const response = await axios.post(`${API_BASE_URL}/MembershipLevels`, payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });

            console.log("Phản hồi từ API:", response.data);

            setSnackbar({ open: true, message: "Thêm cấp độ thành viên thành công!", severity: "success" });
            setOpenAddDialog(false);
            setNewLevel({ LevelName: "", MinimumSpending: 0, Benefits: "", DiscountRate: 0 });
            fetchMembershipLevels();
        } catch (error) {
            console.error("Lỗi khi thêm cấp độ thành viên:", error.response?.data || error.message);
            if (error.response?.data?.errors) {
                console.error("Chi tiết lỗi từ API:", error.response.data.errors);
            }
            setSnackbar({
                open: true,
                message: "Lỗi khi thêm cấp độ thành viên! Kiểm tra dữ liệu đầu vào.",
                severity: "error"
            });
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/MembershipLevels/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setSnackbar({ open: true, message: "Xóa cấp độ thành viên thành công!", severity: "success" });
            fetchMembershipLevels();
        } catch (error) {
            console.error("Lỗi khi xóa cấp độ thành viên:", error.response?.data || error.message);
            setSnackbar({
                open: true,
                message: "Lỗi khi xóa cấp độ thành viên!",
                severity: "error"
            });
        }
    };

    // Format date function
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Page Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <PageTitle variant="h4">
                    <CardMembershipIcon fontSize="large" />
                    Cấp Độ Thành Viên
                </PageTitle>
                <StyledButton
                    customvariant="add"
                    startIcon={<AddCircleIcon />}
                    onClick={() => setOpenAddDialog(true)}
                    size="large"
                >
                    Thêm Cấp Độ Mới
                </StyledButton>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Alerts */}
            {snackbar.open && (
                <Alert
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{
                        mb: 2,
                        borderRadius: 2,
                        boxShadow: 2,
                        backgroundColor: '#e91e63'
                    }}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    {snackbar.message}
                </Alert>
            )}

            {/* Loading State */}
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" py={5}>
                    <CircularProgress sx={{ color: '#e91e63' }} />
                    <Typography ml={2} variant="body1" color="text.secondary">
                        Đang tải dữ liệu cấp độ thành viên...
                    </Typography>
                </Box>
            ) : (
                <StyledTableContainer component={Paper}>
                    <Table>
                        <StyledTableHead>
                            <TableRow>
                                <HeaderTableCell>STT</HeaderTableCell>
                                <HeaderTableCell>Tên Cấp Độ</HeaderTableCell>
                                <HeaderTableCell>Mức Chi Tiêu Tối Thiểu</HeaderTableCell>
                                <HeaderTableCell>Quyền Lợi</HeaderTableCell>
                                <HeaderTableCell>Tỷ Lệ Giảm Giá</HeaderTableCell>
                                <HeaderTableCell>Hành Động</HeaderTableCell>
                            </TableRow>
                        </StyledTableHead>
                        <TableBody>
                            {membershipLevels.length > 0 ? (
                                membershipLevels.map((level, index) => (
                                    <StyledTableRow key={level.MembershipLevelId}>
                                        <BodyTableCell>{index + 1}</BodyTableCell>
                                        <BodyTableCell>
                                            <MembershipChip
                                                icon={<CardMembershipIcon />}
                                                label={level.LevelName}
                                                variant="outlined"
                                                size="small"
                                            />
                                        </BodyTableCell>
                                        <BodyTableCell>
                                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <AttachMoneyIcon fontSize="small" sx={{ mr: 0.5, color: '#e91e63' }} />
                                                {level.MinimumSpending.toLocaleString()}đ
                                            </Typography>
                                        </BodyTableCell>
                                        <BodyTableCell
                                            sx={{
                                                maxWidth: '200px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                            title={level.Benefits}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <RedeemIcon fontSize="small" sx={{ mr: 0.5, color: '#e91e63' }} />
                                                <Typography noWrap>
                                                    {level.Benefits || "Không có quyền lợi"}
                                                </Typography>
                                            </Box>
                                        </BodyTableCell>

                                        <BodyTableCell>
                                            <DiscountChip
                                                icon={<DiscountIcon />}
                                                label={`${level.DiscountRate}%`}
                                                variant="outlined"
                                                size="small"
                                            />
                                        </BodyTableCell>
                                        <ActionButtonsCell>
                                            <Box display="flex" justifyContent="center" gap={2}>
                                                <IconButton
                                                    size="small"
                                                    sx={{
                                                        border: '1px solid #e91e63',
                                                        color: '#e91e63',
                                                        p: 1,
                                                        '&:hover': {
                                                            backgroundColor: alpha('#e91e63', 0.1),
                                                        }
                                                    }}
                                                    onClick={() => handleEditClick(level)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    sx={{
                                                        border: '1px solid #e91e63',
                                                        color: '#e91e63',
                                                        p: 1,
                                                        '&:hover': {
                                                            backgroundColor: alpha('#e91e63', 0.1),
                                                        }
                                                    }}
                                                    onClick={() => handleDelete(level.MembershipLevelId)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </ActionButtonsCell>
                                    </StyledTableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} sx={{ textAlign: "center", py: 3 }}>
                                        <Typography variant="body1" color="text.secondary">
                                            Không có dữ liệu cấp độ thành viên
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </StyledTableContainer>
            )}

            {/* Hộp thoại thêm mới */}
            <Dialog
                open={openAddDialog}
                onClose={() => setOpenAddDialog(false)}
                maxWidth="md"
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: 24,
                    }
                }}
            >
                <StyledDialogTitle>
                    <AddCircleIcon />
                    Thêm cấp độ thành viên mới
                </StyledDialogTitle>
                <DialogContent sx={{ p: 3, minWidth: 500 }}>
                    <Grid container spacing={3} sx={{ mt: 0 }}>
                        <Grid item xs={12}>
                            <FormSectionTitle>
                                <CardMembershipIcon />
                                Thông tin cấp độ
                            </FormSectionTitle>
                            <TextField
                                fullWidth
                                label="Tên cấp độ"
                                value={newLevel.LevelName}
                                onChange={(e) => setNewLevel({ ...newLevel, LevelName: e.target.value })}
                                margin="normal"
                                InputProps={{
                                    startAdornment: <CardMembershipIcon sx={{ mr: 1, color: '#e91e63' }} />,
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            borderColor: '#e91e63'
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#e91e63'
                                        }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#e91e63'
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Mức chi tiêu tối thiểu"
                                type="number"
                                value={newLevel.MinimumSpending}
                                onChange={(e) => setNewLevel({ ...newLevel, MinimumSpending: e.target.value })}
                                margin="normal"
                                InputProps={{
                                    startAdornment: <AttachMoneyIcon sx={{ mr: 1, color: '#e91e63' }} />,
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            borderColor: '#e91e63'
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#e91e63'
                                        }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#e91e63'
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Tỷ lệ giảm giá (%)"
                                type="number"
                                value={newLevel.DiscountRate}
                                onChange={(e) => setNewLevel({ ...newLevel, DiscountRate: e.target.value })}
                                margin="normal"
                                InputProps={{
                                    startAdornment: <LocalOfferIcon sx={{ mr: 1, color: '#e91e63' }} />,
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            borderColor: '#e91e63'
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#e91e63'
                                        }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#e91e63'
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                            <FormSectionTitle>
                                <RedeemIcon />
                                Chi tiết quyền lợi
                            </FormSectionTitle>
                            <TextField
                                fullWidth
                                label="Quyền lợi"
                                value={newLevel.Benefits}
                                onChange={(e) => setNewLevel({ ...newLevel, Benefits: e.target.value })}
                                margin="normal"
                                multiline
                                rows={3}
                                placeholder="Mô tả chi tiết các quyền lợi của cấp độ thành viên này"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            borderColor: '#e91e63'
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#e91e63'
                                        }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#e91e63'
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <StyledButton
                        customvariant="cancel"
                        onClick={() => setOpenAddDialog(false)}
                    >
                        Hủy
                    </StyledButton>
                    <StyledButton
                        customvariant="save"
                        onClick={handleAddNewLevel}
                        startIcon={<AddCircleIcon />}
                    >
                        Thêm Cấp Độ
                    </StyledButton>
                </DialogActions>
            </Dialog>

            {/* Modal Chỉnh Sửa */}
            <Dialog
                open={openEditDialog}
                onClose={() => setOpenEditDialog(false)}
                maxWidth="md"
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: 24,
                    }
                }}
            >
                <StyledDialogTitle>
                    <EditIcon />
                    Chỉnh sửa Cấp độ Thành viên
                </StyledDialogTitle>
                <DialogContent sx={{ p: 3, minWidth: 500 }}>
                    <Grid container spacing={3} sx={{ mt: 0 }}>
                        <Grid item xs={12}>
                            <FormSectionTitle>
                                <CardMembershipIcon />
                                Thông tin cấp độ
                            </FormSectionTitle>
                            <TextField
                                fullWidth
                                label="Tên cấp độ"
                                value={selectedLevel?.LevelName || ""}
                                onChange={(e) => setSelectedLevel({ ...selectedLevel, LevelName: e.target.value })}
                                margin="normal"
                                InputProps={{
                                    startAdornment: <CardMembershipIcon sx={{ mr: 1, color: '#e91e63' }} />,
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            borderColor: '#e91e63'
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#e91e63'
                                        }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#e91e63'
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Mức chi tiêu tối thiểu"
                                type="number"
                                value={selectedLevel?.MinimumSpending || ""}
                                onChange={(e) => setSelectedLevel({ ...selectedLevel, MinimumSpending: e.target.value })}
                                margin="normal"
                                InputProps={{
                                    startAdornment: <AttachMoneyIcon sx={{ mr: 1, color: '#e91e63' }} />,
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            borderColor: '#e91e63'
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#e91e63'
                                        }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#e91e63'
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Tỷ lệ giảm giá (%)"
                                type="number"
                                value={selectedLevel?.DiscountRate || ""}
                                onChange={(e) => setSelectedLevel({ ...selectedLevel, DiscountRate: e.target.value })}
                                margin="normal"
                                InputProps={{
                                    startAdornment: <LocalOfferIcon sx={{ mr: 1, color: '#e91e63' }} />,
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            borderColor: '#e91e63'
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#e91e63'
                                        }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#e91e63'
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                            <FormSectionTitle>
                                <RedeemIcon />
                                Chi tiết quyền lợi
                            </FormSectionTitle>
                            <TextField
                                fullWidth
                                label="Quyền lợi"
                                value={selectedLevel?.Benefits || ""}
                                onChange={(e) => setSelectedLevel({ ...selectedLevel, Benefits: e.target.value })}
                                margin="normal"
                                multiline
                                rows={3}
                                placeholder="Mô tả chi tiết các quyền lợi của cấp độ thành viên này"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            borderColor: '#e91e63'
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#e91e63'
                                        }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#e91e63'
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <StyledButton
                        customvariant="cancel"
                        onClick={() => setOpenEditDialog(false)}
                    >
                        Hủy
                    </StyledButton>
                    <StyledButton
                        customvariant="save"
                        onClick={handleSaveChanges}
                        startIcon={<EditIcon />}
                    >
                        Lưu Thay Đổi
                    </StyledButton>
                </DialogActions>
            </Dialog>

            {/* Thông báo Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ backgroundColor: '#e91e63' }}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default MembershipLevelManager;