import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Snackbar } from "@mui/material";

const MembershipLevelManager = () => {
    const [membershipLevels, setMembershipLevels] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "" });
    const [newLevel, setNewLevel] = useState({ LevelName: "", MinimumSpending: 0, Benefits: "", DiscountRate: 0 });

    useEffect(() => {
        fetchMembershipLevels();
    }, []);

    const fetchMembershipLevels = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/MembershipLevels`);
            console.log("Dữ liệu từ API:", response.data);
            setMembershipLevels(response.data?.$values || []);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
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
            setSnackbar({ open: true, message: "Cập nhật thành công!" });
            setOpenEditDialog(false);
            fetchMembershipLevels();
        } catch (error) {
            console.error("Lỗi khi cập nhật cấp độ thành viên:", error.response?.data || error.message);
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

            setSnackbar({ open: true, message: "Thêm cấp độ thành viên thành công!" });
            setOpenAddDialog(false);
            fetchMembershipLevels();
        } catch (error) {
            console.error("Lỗi khi thêm cấp độ thành viên:", error.response?.data || error.message);
            if (error.response?.data?.errors) {
                console.error("Chi tiết lỗi từ API:", error.response.data.errors);
            }
            setSnackbar({ open: true, message: "Lỗi khi thêm cấp độ thành viên! Kiểm tra dữ liệu đầu vào." });
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/MembershipLevels/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setSnackbar({ open: true, message: "Xóa cấp độ thành viên thành công!" });
            fetchMembershipLevels();
        } catch (error) {
            console.error("Lỗi khi xóa cấp độ thành viên:", error.response?.data || error.message);
        }
    };

    return (
        <div>
            <h2>Quản lý Cấp độ Thành viên</h2>
            <Button variant="contained" style={{ backgroundColor: "#007BFF", color: "white" }} onClick={() => setOpenAddDialog(true)}>Thêm</Button>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>STT</TableCell>
                            <TableCell>Tên cấp độ</TableCell>
                            <TableCell>Mức chi tiêu tối thiểu</TableCell>
                            <TableCell>Quyền lợi</TableCell>
                            <TableCell>Ngày tạo</TableCell>
                            <TableCell>Giảm giá</TableCell>
                            <TableCell>Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {membershipLevels.length > 0 ? (
                            membershipLevels.map((level, index) => (
                                <TableRow key={level.MembershipLevelId}>
                                    <TableCell>{index + 1}</TableCell>
                              
                                    <TableCell>{level.LevelName}</TableCell>
                                    <TableCell>{level.MinimumSpending}</TableCell>
                                    <TableCell>{level.Benefits}</TableCell>
                                    <TableCell>{level.CreatedAt}</TableCell>
                                    <TableCell>{level.DiscountRate}</TableCell>
                                    <TableCell>
                                        <Button variant="contained" style={{ backgroundColor: "transparent", color: "#FFA500", border: "1px solid #FFA500"  }} onClick={() => handleEditClick(level)}>Sửa</Button>
                                        <Button variant="contained" style={{ backgroundColor: "#DC3545", color: "white", marginLeft: "8px" }} onClick={() => handleDelete(level.MembershipLevelId)}>Xóa</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} style={{ textAlign: "center" }}>Không có dữ liệu</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Hộp thoại thêm mới */}
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
                <DialogTitle>Thêm cấp độ thành viên</DialogTitle>
                <DialogContent>
                    <TextField fullWidth label="Tên cấp độ" value={newLevel.LevelName} onChange={(e) => setNewLevel({ ...newLevel, LevelName: e.target.value })} margin="normal" />
                    <TextField fullWidth label="Mức chi tiêu tối thiểu" type="number" value={newLevel.MinimumSpending} onChange={(e) => setNewLevel({ ...newLevel, MinimumSpending: e.target.value })} margin="normal" />
                    <TextField fullWidth label="Quyền lợi" value={newLevel.Benefits} onChange={(e) => setNewLevel({ ...newLevel, Benefits: e.target.value })} margin="normal" />
                    <TextField fullWidth label="Giảm giá" type="number" value={newLevel.DiscountRate} onChange={(e) => setNewLevel({ ...newLevel, DiscountRate: e.target.value })} margin="normal" />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddDialog(false)} color="secondary">Hủy</Button>
                    <Button onClick={handleAddNewLevel} color="primary">Thêm</Button>
                </DialogActions>
            </Dialog>
            {/* Modal Chỉnh Sửa */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
                <DialogTitle>Chỉnh sửa Cấp độ Thành viên</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Tên cấp độ"
                        value={selectedLevel?.LevelName || ""}
                        onChange={(e) => setSelectedLevel({ ...selectedLevel, LevelName: e.target.value })}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Mức chi tiêu tối thiểu"
                        type="number"
                        value={selectedLevel?.MinimumSpending || ""}
                        onChange={(e) => setSelectedLevel({ ...selectedLevel, MinimumSpending: e.target.value })}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Quyền lợi"
                        value={selectedLevel?.Benefits || ""}
                        onChange={(e) => setSelectedLevel({ ...selectedLevel, Benefits: e.target.value })}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Giảm giá"
                        type="number"
                        value={selectedLevel?.DiscountRate || ""}
                        onChange={(e) => setSelectedLevel({ ...selectedLevel, DiscountRate: e.target.value })}
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)} color="secondary">Hủy</Button>
                    <Button onClick={handleSaveChanges} color="primary">Lưu</Button>
                </DialogActions>
            </Dialog>
            {/* Thông báo Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={3000} message={snackbar.message} onClose={() => setSnackbar({ ...snackbar, open: false })} />
        </div>
    );
};

export default MembershipLevelManager;
