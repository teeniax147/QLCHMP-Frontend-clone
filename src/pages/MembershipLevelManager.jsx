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
    backgroundColor: theme.palette.primary.main,
}));

const HeaderTableCell = styled(TableCell)(({ theme }) => ({
    textAlign: "center",
    fontWeight: "600",
    fontSize: "15px",
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(1.5),
    whiteSpace: 'nowrap',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: alpha(theme.palette.primary.light, 0.05),
    },
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.light, 0.1),
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

const AddLevelButton = styled(Button)(({ theme }) => ({
    backgroundColor: theme.palette.success.main,
    color: theme.palette.common.white,
    borderRadius: 8,
    padding: '8px 16px',
    fontWeight: 500,
    textTransform: 'none',
    boxShadow: 'none',
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: theme.palette.success.dark,
        boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`,
    },
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
        color: theme.palette.primary.main,
    }
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
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
        color: theme.palette.primary.main,
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
                <AddLevelButton
                    startIcon={<AddCircleIcon />}
                    onClick={() => setOpenAddDialog(true)}
                    size="large"
                >
                    Thêm Cấp Độ Mới
                </AddLevelButton>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Alerts */}
            {snackbar.open && (
                <Alert
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    {snackbar.message}
                </Alert>
            )}

            {/* Loading State */}
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" py={5}>
                    <CircularProgress />
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
                                            <Chip
                                                icon={<CardMembershipIcon />}
                                                label={level.LevelName}
                                                color="primary"
                                                variant="outlined"
                                                size="small"
                                            />
                                        </BodyTableCell>
                                        <BodyTableCell>
                                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <AttachMoneyIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
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
                                                <RedeemIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                                                <Typography noWrap>
                                                    {level.Benefits || "Không có quyền lợi"}
                                                </Typography>
                                            </Box>
                                        </BodyTableCell>

                                        <BodyTableCell>
                                            <Chip
                                                icon={<DiscountIcon />}
                                                label={`${level.DiscountRate}%`}
                                                color="secondary"
                                                variant="outlined"
                                                size="small"
                                            />
                                        </BodyTableCell>
                                        <ActionButtonsCell>
                                            <Box display="flex" justifyContent="center" gap={2}>
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleEditClick(level)}
                                                    sx={{
                                                        border: '1px solid #2196f3',
                                                        p: 1,
                                                        '&:hover': {
                                                            backgroundColor: alpha('#2196f3', 0.1),
                                                        }
                                                    }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDelete(level.MembershipLevelId)}
                                                    sx={{
                                                        border: '1px solid #f44336',
                                                        p: 1,
                                                        '&:hover': {
                                                            backgroundColor: alpha('#f44336', 0.1),
                                                        }
                                                    }}
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
                                    startAdornment: <CardMembershipIcon color="primary" sx={{ mr: 1 }} />,
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
                                    startAdornment: <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />,
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
                                    startAdornment: <LocalOfferIcon color="primary" sx={{ mr: 1 }} />,
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
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button
                        onClick={() => setOpenAddDialog(false)}
                        variant="outlined"
                        color="inherit"
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleAddNewLevel}
                        variant="contained"
                        color="primary"
                        startIcon={<AddCircleIcon />}
                    >
                        Thêm Cấp Độ
                    </Button>
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
                                    startAdornment: <CardMembershipIcon color="primary" sx={{ mr: 1 }} />,
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
                                    startAdornment: <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />,
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
                                    startAdornment: <LocalOfferIcon color="primary" sx={{ mr: 1 }} />,
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
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button
                        onClick={() => setOpenEditDialog(false)}
                        variant="outlined"
                        color="inherit"
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSaveChanges}
                        variant="contained"
                        color="primary"
                        startIcon={<EditIcon />}
                    >
                        Lưu Thay Đổi
                    </Button>
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
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default MembershipLevelManager;