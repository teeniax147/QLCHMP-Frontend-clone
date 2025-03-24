import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaStar } from 'react-icons/fa';
import { API_BASE_URL } from '../config';
import './OrderDetails.css';

const OrderDetails = () => {
    const { orderId } = useParams();
    const [orderInfo, setOrderInfo] = useState(null);
    const [orderDetails, setOrderDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Review state
    const [reviewedProducts, setReviewedProducts] = useState([]); // List of product IDs with reviews

    // Review modal state
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [submitStatus, setSubmitStatus] = useState({ loading: false, error: '', success: false });
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentFeedbackId, setCurrentFeedbackId] = useState(null);

    const token = localStorage.getItem('token');

    const fetchOrderInfo = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/Orders/customer/orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data && response.data.$values) {
                const foundOrder = response.data.$values.find(order => order.Id === parseInt(orderId));
                setOrderInfo(foundOrder || {});
            }
        } catch (err) {
            setError("Có lỗi xảy ra khi lấy thông tin đơn hàng.");
        }
    };

    // Fetch order details but don't try to fetch reviewed products
    const fetchOrderDetails = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/Orders/orders/${orderId}/details`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Clean and handle the product image URL
            const cleanedOrderDetails = response.data.$values.map(item => ({
                ...item,
                ProductImage: item.ProductImage
                    ? `https://api.cutexiu.teeniax.io.vn/${item.ProductImage}` // Append base URL for product image
                    : "default-image.jpg", // Fallback image if no image URL
            }));

            setOrderDetails(cleanedOrderDetails);
        } catch (err) {
            setError("Có lỗi xảy ra khi lấy chi tiết đơn hàng.");
        } finally {
            setLoading(false);
        }
    };

    // Remove the function completely
    // We're not using this anymore

    useEffect(() => {
        if (orderId) {
            fetchOrderInfo();
            fetchOrderDetails();
        }
    }, [orderId]);

    const openReviewModal = (product, isEdit = false, feedbackId = null) => {
        setSelectedProduct(product);
        setIsEditMode(isEdit);
        setCurrentFeedbackId(feedbackId);

        // Reset form
        setRating(0);
        setReviewText('');
        setSubmitStatus({ loading: false, error: '', success: false });
        setShowReviewModal(true);
    };

    const closeReviewModal = () => {
        setShowReviewModal(false);
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            setSubmitStatus({ loading: false, error: 'Vui lòng chọn số sao đánh giá', success: false });
            return;
        }

        setSubmitStatus({ loading: true, error: '', success: false });

        try {
            if (isEditMode) {
                // Edit existing review
                await axios.put(
                    `${API_BASE_URL}/ProductFeedbacks/edit/${currentFeedbackId}`,
                    {
                        rating: rating,
                        reviewText: reviewText
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
            } else {
                // Add new review
                const response = await axios.post(
                    `${API_BASE_URL}/ProductFeedbacks/add`,
                    {
                        productId: selectedProduct.ProductId,
                        rating: rating,
                        reviewText: reviewText
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                // Lưu lại feedback ID nếu cần để sửa/xóa sau này
                if (response.data && response.data.FeedbackId) {
                    setCurrentFeedbackId(response.data.FeedbackId);
                    // Chuyển sang chế độ sửa sau khi đã đánh giá thành công
                    setIsEditMode(true);
                }
            }

            setSubmitStatus({ loading: false, error: '', success: true });

            // Close modal after successful submission
            setTimeout(() => {
                closeReviewModal();
                // Refresh reviewed products
                fetchReviewedProducts();
            }, 1500);

        } catch (error) {
            let errorMessage = 'Đã xảy ra lỗi khi gửi đánh giá.';

            if (error.response) {
                errorMessage = error.response.data || errorMessage;
            }

            setSubmitStatus({ loading: false, error: errorMessage, success: false });
        }
    };

    const handleDeleteReview = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này không? Bạn sẽ cần mua sản phẩm lần nữa để có thể đánh giá lại.')) {
            return;
        }

        setSubmitStatus({ loading: true, error: '', success: false });

        try {
            await axios.delete(
                `${API_BASE_URL}/ProductFeedbacks/delete/${currentFeedbackId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Remove from reviewed products not needed anymore

            setSubmitStatus({ loading: false, error: '', success: true, message: 'Đã xóa đánh giá thành công!' });

            // Close modal after successful deletion
            setTimeout(() => {
                closeReviewModal();
            }, 1500);
        } catch (error) {
            let errorMessage = 'Đã xảy ra lỗi khi xóa đánh giá.';

            if (error.response) {
                errorMessage = error.response.data || errorMessage;
            }

            setSubmitStatus({ loading: false, error: errorMessage, success: false });
        }
    };

    // Don't need to check if product has been reviewed since we don't track that anymore
    // This simplifies the component

    // Check if order is completed (delivered)
    const isOrderCompleted = () => {
        // Kiểm tra cả Status và StatusText đề phòng API trả về dạng khác nhau
        return orderInfo && (orderInfo.Status === "Đã Giao" ||
            orderInfo.StatusText === "Đã Giao" ||
            orderInfo.Status === "Đã giao" ||
            orderInfo.StatusText === "Đã giao");
    };

    // Check if order is within the review period (10 days from delivery)
    const isWithinReviewPeriod = () => {
        if (!orderInfo || !orderInfo.OrderDate) return false;

        // Debug - in ra console thông tin ngày tháng
        console.log("OrderDate:", orderInfo.OrderDate);
        console.log("Current Date:", new Date().toISOString());

        // Xử lý đúng định dạng ngày tháng
        let orderDate;

        // Kiểm tra xem OrderDate là string hay đã là Date object
        if (typeof orderInfo.OrderDate === 'string') {
            // Kiểm tra định dạng ngày DD/MM/YYYY
            if (orderInfo.OrderDate.includes('/')) {
                const parts = orderInfo.OrderDate.split(' ')[0].split('/');
                if (parts.length === 3) {
                    // Format: DD/MM/YYYY
                    const day = parseInt(parts[0]);
                    const month = parseInt(parts[1]) - 1; // Tháng trong JS bắt đầu từ 0
                    const year = parseInt(parts[2]);
                    orderDate = new Date(year, month, day);
                } else {
                    // Định dạng khác, thử parse thông thường
                    orderDate = new Date(orderInfo.OrderDate);
                }
            } else {
                // Định dạng ISO hoặc định dạng khác
                orderDate = new Date(orderInfo.OrderDate);
            }
        } else {
            // Nếu đã là Date object
            orderDate = orderInfo.OrderDate;
        }

        const currentDate = new Date();

        // Kiểm tra xem orderDate có hợp lệ không
        if (isNaN(orderDate.getTime())) {
            console.error("Ngày đặt hàng không hợp lệ:", orderInfo.OrderDate);
            return true; // Mặc định cho phép đánh giá nếu có lỗi
        }

        // Tính số ngày giữa hai mốc thời gian
        const diffTime = currentDate - orderDate; // Milliseconds
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        console.log("Số ngày đã qua:", diffDays);

        // Mặc định cho phép đánh giá trong vòng 10 ngày
        return diffDays <= 10;
    };

    // Just use one button for all products, no review state needed
    const handleReviewClick = (product) => {
        // Always open in add mode, we don't track previous review state
        openReviewModal(product, false);
    };

    if (loading) return <div>Đang tải chi tiết đơn hàng...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div className="order-details-container">
            <h2>Đơn hàng #{orderId}</h2>

            {/* Thông tin đơn hàng */}
            <div className="order-summary">
                <h3>Thông tin nhận hàng</h3>
                <div className="order-summary-info">
                    <div>
                        <p>Ngày đặt: {orderInfo?.OrderDate || 'Chưa có dữ liệu'}</p>
                        <p>Trạng thái: {orderInfo?.Status || 'Chưa có dữ liệu'}</p>
                        <p>Phương thức thanh toán: {orderInfo?.PaymentMethod?.Name || orderInfo?.PaymentMethodName || 'Chưa có dữ liệu'}</p>
                    </div>
                    <div>
                        <p>Khách hàng: {orderInfo?.CustomerName || 'Chưa có dữ liệu'}</p>
                        <p>Địa chỉ giao hàng: {orderInfo?.ShippingAddress || 'Chưa có dữ liệu'}</p>
                        <p>Phương thức vận chuyển: {orderInfo?.ShippingCompany?.Name || orderInfo?.ShippingCompanyName || 'Chưa có dữ liệu'}</p>
                    </div>
                </div>
            </div>

            <h3>Đơn Hàng</h3>

            {/* Danh sách sản phẩm */}
            <div className="product-list">
                {orderDetails.length > 0 ? (
                    orderDetails.map((product) => (
                        <div key={product.ProductId} className="product-item">
                            <div className="product-info-left">
                                <div className="product-image">
                                    <img src={product.ProductImage} alt={product.ProductName} />
                                </div>
                                <div className="product-name">
                                    <p><strong>{product.ProductName}</strong></p>
                                    <p>x {product.Quantity}</p>

                                    {/* Review button for individual product */}
                                    {isOrderCompleted() && (
                                        isWithinReviewPeriod() ? (
                                            <button
                                                className="review-product-btn"
                                                onClick={() => handleReviewClick(product)}
                                            >
                                                Đánh giá
                                            </button>
                                        ) : (
                                            <button
                                                className="expired-review-btn"
                                                disabled
                                                title="Chỉ có thể đánh giá trong vòng 10 ngày sau khi nhận hàng"
                                            >
                                                Quá Hạn Đánh Giá
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                            <div className="product-info-right">
                                <p>{product.UnitPrice?.toLocaleString()}đ</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>Không có sản phẩm trong đơn hàng này.</p>
                )}
            </div>

            <hr className="footer-divider" />
            <div className="pricing-details">
                <div>
                    <p>Tạm tính: {orderInfo?.TotalAmount?.toLocaleString() || 'Chưa có dữ liệu'}đ</p>
                    <p>Giảm giá: {orderInfo?.DiscountApplied?.toLocaleString() || 'Chưa có dữ liệu'}đ</p>
                    <p>Phí giao hàng: {orderInfo?.ShippingCost?.toLocaleString() || 'Chưa có dữ liệu'}đ</p>
                    <p>Tổng: {(orderInfo?.TotalAmount - (orderInfo?.DiscountApplied || 0) + (orderInfo?.ShippingCost || 0))?.toLocaleString() || 'Chưa có dữ liệu'}đ</p>
                </div>
            </div>

            {/* Nút Quay lại */}
            <div className="action-buttons">
                <button
                    className="back-button"
                    onClick={() => window.history.back()}
                >
                    Quay lại
                </button>
            </div>

            {/* Review Modal */}
            {showReviewModal && selectedProduct && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{isEditMode ? 'Sửa đánh giá sản phẩm' : 'Đánh giá sản phẩm'}</h3>

                        <div className="review-product-info">
                            <div className="review-product-image">
                                <img src={selectedProduct.ProductImage} alt={selectedProduct.ProductName} />
                            </div>
                            <div className="review-product-name">
                                <p>{selectedProduct.ProductName}</p>
                            </div>
                        </div>

                        <div className="rating-container">
                            <p>Đánh giá của bạn:</p>
                            <div className="star-rating">
                                {[...Array(5)].map((_, index) => {
                                    const starValue = index + 1;
                                    return (
                                        <FaStar
                                            key={index}
                                            className={`rating-star ${starValue <= (hover || rating) ? "selected" : ""}`}
                                            onClick={() => setRating(starValue)}
                                            onMouseEnter={() => setHover(starValue)}
                                            onMouseLeave={() => setHover(0)}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <p>Nhận xét của bạn (không bắt buộc):</p>
                            <textarea
                                className="review-textarea"
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                                rows={4}
                                maxLength={1000}
                            ></textarea>
                            <small>{reviewText.length}/1000 ký tự</small>
                        </div>

                        {isEditMode && (
                            <div className="edit-warning">
                                <p>Lưu ý: Bạn chỉ được phép sửa đánh giá một lần trong vòng 10 ngày sau khi đánh giá.</p>
                            </div>
                        )}

                        {submitStatus.error && <p className="error-message">{submitStatus.error}</p>}
                        {submitStatus.success && <p className="success-message">
                            {submitStatus.message || (isEditMode ? 'Đánh giá của bạn đã được cập nhật thành công!' : 'Đánh giá của bạn đã được gửi thành công!')}
                        </p>}

                        <div className="modal-buttons">
                            <button
                                className="cancel-button"
                                onClick={closeReviewModal}
                                disabled={submitStatus.loading}
                            >
                                Hủy
                            </button>

                            {isEditMode && (
                                <button
                                    className="delete-btn"
                                    onClick={handleDeleteReview}
                                    disabled={submitStatus.loading || submitStatus.success}
                                >
                                    {submitStatus.loading ? 'Đang xử lý...' : 'Xóa đánh giá'}
                                </button>
                            )}

                            <button
                                className="submit-btn"
                                onClick={handleSubmitReview}
                                disabled={submitStatus.loading || submitStatus.success}
                            >
                                {submitStatus.loading ? 'Đang xử lý...' : isEditMode ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetails;