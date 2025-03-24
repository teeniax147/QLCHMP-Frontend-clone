import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import {
    Box,
    Typography,
    Paper,
    Button,
    CircularProgress,
    Divider,
    Alert,
    Fade,
    Container,
    Grid,
    styled,
    alpha,
    LinearProgress
} from '@mui/material';
// Import icon đúng cách
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentIcon from '@mui/icons-material/Payment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';


// Styled Components
const PageContainer = styled(Container)(({ theme }) => ({
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
}));

const ResultCard = styled(Paper)(({ theme }) => ({
    borderRadius: 16,
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    width: '100%',
    position: 'relative',
}));

const CardHeader = styled(Box)(({ theme, success }) => ({
    padding: theme.spacing(4),
    background: success
        ? 'linear-gradient(135deg,rgb(244, 86, 152) 0%, rgb(244, 86, 152)  100%)'
        : 'linear-gradient(135deg, #F44336 0%, #C62828 100%)',
    color: theme.palette.common.white,
    textAlign: 'center',
}));

const CardContent = styled(Box)(({ theme }) => ({
    padding: theme.spacing(4),
}));

const StatusIcon = styled(Box)(({ theme }) => ({
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: theme.palette.common.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    marginBottom: theme.spacing(2),
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
}));

const InfoItem = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
}));

const InfoIcon = styled(Box)(({ theme }) => ({
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: alpha(theme.palette.primary.main, 0.1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing(2),
    color: theme.palette.primary.main,
}));

const ActionButton = styled(Button)(({ theme, success }) => ({
    borderRadius: 8,
    padding: '10px 20px',
    fontWeight: 600,
    boxShadow: 'none',
    textTransform: 'none',
    '&.MuiButton-contained': {
        backgroundColor: success ? 'rgb(244, 86, 152)' : theme.palette.primary.main,
        '&:hover': {
            backgroundColor: success ? 'rgb(220, 70, 130)' : theme.palette.primary.dark,
            boxShadow: `0 6px 12px ${alpha(success ? 'rgb(244, 86, 152)' : theme.palette.primary.main, 0.2)}`,
        }
    },
    '&.MuiButton-outlined': {
        borderColor: theme.palette.primary.main,
        color: theme.palette.primary.main,
        '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            borderColor: theme.palette.primary.dark,
        }
    }
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
    height: 6,
    borderRadius: 3,
    width: '100%',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    '& .MuiLinearProgress-barColorPrimary': {
        backgroundColor: 'rgb(244, 86, 152)',
    },
    '& .MuiLinearProgress-barColorSuccess': {
        backgroundColor: 'rgb(244, 86, 152)',
    },
}));

const LoadingSpinner = styled(CircularProgress)(({ theme }) => ({
    color: 'rgb(244, 86, 152)',
}));

const VnpayCallback = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentResult, setPaymentResult] = useState(null);
    const [redirectCountdown, setRedirectCountdown] = useState(10);
    const navigate = useNavigate();
    const location = useLocation();

    // Xử lý callback khi component mount
    useEffect(() => {
        handleCallback();
    }, []);

    // Đếm ngược để chuyển hướng nếu thanh toán thành công
    useEffect(() => {
        let countdownTimer;
        if (paymentResult && paymentResult.isSuccess && redirectCountdown > 0) {
            countdownTimer = setInterval(() => {
                setRedirectCountdown(prev => prev - 1);
            }, 1000);
        } else if (redirectCountdown === 0) {
            navigate('/order-success');
        }

        return () => clearInterval(countdownTimer);
    }, [paymentResult, redirectCountdown, navigate]);

    // Lấy OrderId từ URL để hiển thị
    const getOrderIdFromUrl = () => {
        const params = new URLSearchParams(location.search);
        // VNPay sử dụng vnp_TxnRef để lưu orderId
        return params.get('vnp_TxnRef') || localStorage.getItem('lastOrderId') || 'N/A';
    };

    const handleCallback = async () => {
        setLoading(true);

        try {
            // Kiểm tra xem URL có chứa tham số VNPay không
            if (!location.search || !location.search.includes('vnp_')) {
                throw new Error("Không tìm thấy thông tin thanh toán trong URL.");
            }

            // Gọi API để xử lý callback
            const response = await axios.get(
                `${API_BASE_URL}/Vnpay/Callback${location.search}`,
                {
                    headers: {
                        'Accept': 'application/json'
                    }
                }
            );

            console.log("VNPAY Callback response:", response.data);

            // Log ra các key trong đối tượng để debug
            console.log("Response keys:", Object.keys(response.data));

            // Xử lý kết quả từ API - kiểm tra cả chữ hoa và chữ thường
            const isSuccess = response.data && (response.data.isSuccess === true || response.data.IsSuccess === true);

            // Lấy thông tin giao dịch, kiểm tra cả chữ hoa và chữ thường
            const transactionId = response.data?.VnpayTransactionId || response.data?.vnpayTransactionId ||
                response.data?.PaymentId || response.data?.paymentId || 'Unknown';

            const description = response.data?.Description || response.data?.description ||
                response.data?.Message || response.data?.message || "Không có thông tin";

            const amount = response.data?.Amount || response.data?.amount ||
                response.data?.Money || response.data?.money;

            if (isSuccess) {
                setPaymentResult({
                    isSuccess: true,
                    message: 'Thanh toán thành công!',
                    transactionId: transactionId,
                    orderId: getOrderIdFromUrl(),
                    amount: amount,
                    details: response.data
                });

                // Xóa lastOrderId khỏi localStorage vì đã xử lý xong
                localStorage.removeItem('lastOrderId');
            } else {
                // Thanh toán không thành công
                setPaymentResult({
                    isSuccess: false,
                    message: description || "Thanh toán không thành công.",
                    errorCode: response.data?.ResponseCode || response.data?.responseCode || "Unknown",
                    orderId: getOrderIdFromUrl()
                });
            }
        } catch (err) {
            console.error("VNPAY Callback Error:", err);

            // Hiển thị lỗi chi tiết từ response nếu có
            if (err.response && err.response.data) {
                setError(err.response.data.description || JSON.stringify(err.response.data));
            } else {
                setError(err.message || "Đã xảy ra lỗi khi xử lý kết quả thanh toán. Vui lòng liên hệ hỗ trợ khách hàng.");
            }
        } finally {
            setLoading(false);
        }
    };

    // UI khi đang loading
    if (loading) {
        return (
            <PageContainer maxWidth="md">
                <ResultCard elevation={0}>
                    <CardContent sx={{ py: 6 }}>
                        <Box textAlign="center">
                            <LoadingSpinner size={70} thickness={4} />
                            <Typography variant="h5" mt={4} mb={2} fontWeight={600}>
                                Đang xử lý kết quả thanh toán
                            </Typography>
                            <Typography color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
                                Vui lòng không đóng trang này. Hệ thống đang xác nhận giao dịch của bạn...
                            </Typography>
                        </Box>
                    </CardContent>
                </ResultCard>
            </PageContainer>
        );
    }

    // UI khi có lỗi
    if (error) {
        return (
            <PageContainer maxWidth="md">
                <ResultCard elevation={0}>
                    <CardHeader success={false}>
                        <StatusIcon>
                            <ErrorOutline sx={{ fontSize: 40, color: 'error.main' }} />
                        </StatusIcon>
                        <Typography variant="h4" fontWeight={600}>
                            Thanh toán không thành công
                        </Typography>
                    </CardHeader>

                    <CardContent>
                        <Alert
                            severity="error"
                            sx={{
                                mb: 3,
                                borderRadius: 2,
                                '& .MuiAlert-message': { fontWeight: 500 }
                            }}
                        >
                            {error}
                        </Alert>

                        <Typography sx={{ mb: 4, textAlign: 'center' }}>
                            Đơn hàng của bạn chưa được thanh toán. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
                        </Typography>

                        <Divider sx={{ mb: 4 }} />

                        <Box display="flex" justifyContent="center" gap={2}>
                            <ActionButton
                                variant="contained"
                                startIcon={<ShoppingCartIcon />}
                                onClick={() => navigate('/cart-preview')}
                            >
                                Thử lại thanh toán
                            </ActionButton>
                            <ActionButton
                                variant="outlined"
                                startIcon={<HomeIcon />}
                                onClick={() => navigate('/')}
                            >
                                Về trang chủ
                            </ActionButton>
                        </Box>
                    </CardContent>
                </ResultCard>
            </PageContainer>
        );
    }

    // UI khi có kết quả thanh toán
    if (paymentResult) {
        return (
            <PageContainer maxWidth="md">
                <ResultCard elevation={0}>
                    {paymentResult.isSuccess ? (
                        // UI thanh toán thành công
                        <>
                            <CardHeader success={true}>
                                <StatusIcon>
                                    <CheckCircleOutline sx={{ fontSize: 40, color: 'rgb(244, 86, 152)' }} />
                                </StatusIcon>
                                <Typography variant="h4" fontWeight={600}>
                                    Thanh toán thành công!
                                </Typography>
                            </CardHeader>

                            <CardContent>
                                <Alert
                                    severity="success"
                                    sx={{
                                        mb: 4,
                                        borderRadius: 2,
                                        '& .MuiAlert-message': { fontWeight: 500 },
                                        '&.MuiAlert-standardSuccess': {
                                            backgroundColor: 'rgba(244, 86, 152, 0.1)',
                                            color: 'rgb(244, 86, 152)'
                                        },
                                        '& .MuiAlert-icon': {
                                            color: 'rgb(244, 86, 152)'
                                        }
                                    }}
                                >
                                    Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được thanh toán thành công và đang được xử lý.
                                </Alert>

                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                        Thông tin thanh toán
                                    </Typography>

                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <InfoItem>
                                                <InfoIcon>
                                                    <ShoppingBagIcon />
                                                </InfoIcon>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Mã đơn hàng
                                                    </Typography>
                                                    <Typography variant="subtitle1" fontWeight={600}>
                                                        #{paymentResult.orderId}
                                                    </Typography>
                                                </Box>
                                            </InfoItem>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <InfoItem>
                                                <InfoIcon>
                                                    <PaymentIcon />
                                                </InfoIcon>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Mã giao dịch
                                                    </Typography>
                                                    <Typography variant="subtitle1" fontWeight={600}>
                                                        {paymentResult.transactionId}
                                                    </Typography>
                                                </Box>
                                            </InfoItem>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <InfoItem>
                                                <InfoIcon>
                                                    <CreditCardIcon />
                                                </InfoIcon>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Số tiền thanh toán
                                                    </Typography>
                                                    <Typography variant="subtitle1" fontWeight={600}>
                                                        {(() => {
                                                            // Lấy số tiền từ nhiều nguồn khác nhau
                                                            const amountFromResult = paymentResult.amount;
                                                            const amountFromStorage = localStorage.getItem('orderAmount');
                                                            const urlParams = new URLSearchParams(location.search);
                                                            const amountFromUrl = urlParams.get('vnp_Amount') ? (parseInt(urlParams.get('vnp_Amount')) / 100) : null;

                                                            const finalAmount = amountFromResult || amountFromStorage || amountFromUrl;

                                                            if (finalAmount) {
                                                                return `${Number(finalAmount).toLocaleString()}đ`;
                                                            } else {
                                                                return '600,000 VND';
                                                            }
                                                        })()}
                                                    </Typography>
                                                </Box>
                                            </InfoItem>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <InfoItem>
                                                <InfoIcon>
                                                    <AccessTimeIcon />
                                                </InfoIcon>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Thời gian thanh toán
                                                    </Typography>
                                                    <Typography variant="subtitle1" fontWeight={600}>
                                                        {new Date().toLocaleString('vi-VN')}
                                                    </Typography>
                                                </Box>
                                            </InfoItem>
                                        </Grid>
                                    </Grid>
                                </Box>

                                <Divider sx={{ mb: 3 }} />

                                <Box sx={{ mb: 4, textAlign: 'center' }}>
                                    <Typography variant="body1" sx={{ color: 'rgb(244, 86, 152)' }} fontWeight={500}>
                                        Bạn sẽ được chuyển hướng đến trang xác nhận đơn hàng sau {redirectCountdown} giây
                                    </Typography>
                                    <ProgressBar
                                        variant="determinate"
                                        value={(redirectCountdown / 10) * 100}
                                        color="success"
                                    />
                                </Box>

                                <Box display="flex" justifyContent="center" gap={2}>
                                    <ActionButton
                                        variant="contained"
                                        success={true}
                                        startIcon={<ReceiptIcon />}
                                        onClick={() => navigate('/order-success')}
                                    >
                                        Xem đơn hàng
                                    </ActionButton>
                                    <ActionButton
                                        variant="outlined"
                                        startIcon={<ShoppingCartIcon />}
                                        onClick={() => navigate('/')}
                                    >
                                        Tiếp tục mua sắm
                                    </ActionButton>
                                </Box>
                            </CardContent>
                        </>
                    ) : (
                        // UI thanh toán thất bại
                        <>
                            <CardHeader success={false}>
                                <StatusIcon>
                                    <ErrorOutline sx={{ fontSize: 40, color: 'error.main' }} />
                                </StatusIcon>
                                <Typography variant="h4" fontWeight={600}>
                                    Thanh toán không thành công
                                </Typography>
                            </CardHeader>

                            <CardContent>
                                <Alert
                                    severity="warning"
                                    sx={{
                                        mb: 3,
                                        borderRadius: 2,
                                        '& .MuiAlert-message': { fontWeight: 500 }
                                    }}
                                >
                                    {paymentResult.message}
                                </Alert>

                                <Box sx={{ mb: 4 }}>
                                    <InfoItem>
                                        <InfoIcon>
                                            <ShoppingBagIcon />
                                        </InfoIcon>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Mã đơn hàng
                                            </Typography>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                #{paymentResult.orderId}
                                            </Typography>
                                        </Box>
                                    </InfoItem>
                                </Box>

                                <Typography sx={{ mb: 4, textAlign: 'center' }}>
                                    Đơn hàng của bạn chưa được thanh toán. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
                                </Typography>

                                <Divider sx={{ mb: 4 }} />

                                <Box display="flex" justifyContent="center" gap={2}>
                                    <ActionButton
                                        variant="contained"
                                        startIcon={<ShoppingCartIcon />}
                                        onClick={() => navigate('/cart-preview')}
                                    >
                                        Thử lại thanh toán
                                    </ActionButton>
                                    <ActionButton
                                        variant="outlined"
                                        startIcon={<HomeIcon />}
                                        onClick={() => navigate('/')}
                                    >
                                        Về trang chủ
                                    </ActionButton>
                                </Box>
                            </CardContent>
                        </>
                    )}
                </ResultCard>
            </PageContainer>
        );
    }

    // UI Fallback
    return (
        <PageContainer maxWidth="md">
            <ResultCard elevation={0}>
                <CardContent sx={{ py: 5 }}>
                    <Box textAlign="center">
                        <ErrorOutline color="action" sx={{ fontSize: 70, mb: 3, opacity: 0.7 }} />
                        <Typography variant="h5" mb={3} fontWeight={600}>
                            Không tìm thấy thông tin thanh toán
                        </Typography>
                        <Typography color="text.secondary" mb={4}>
                            Không tìm thấy thông tin về giao dịch thanh toán của bạn.
                        </Typography>
                        <Box display="flex" justifyContent="center" gap={2}>
                            <ActionButton
                                variant="contained"
                                startIcon={<ShoppingCartIcon />}
                                onClick={() => navigate('/cart-preview')}
                            >
                                Quay lại giỏ hàng
                            </ActionButton>
                            <ActionButton
                                variant="outlined"
                                startIcon={<HomeIcon />}
                                onClick={() => navigate('/')}
                            >
                                Về trang chủ
                            </ActionButton>
                        </Box>
                    </Box>
                </CardContent>
            </ResultCard>
        </PageContainer>
    );
};

export default VnpayCallback;