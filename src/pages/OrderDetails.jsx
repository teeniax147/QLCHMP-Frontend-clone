import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaStar } from 'react-icons/fa'; // Import sao từ react-icons
import { API_BASE_URL } from '../config';
import './OrderDetails.css';

const OrderDetails = () => {
    const { orderId } = useParams();
    const [orderInfo, setOrderInfo] = useState(null);
    const [orderDetails, setOrderDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
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

    const fetchOrderDetails = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/Orders/orders/${orderId}/details`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setOrderDetails(response.data.$values || []);
        } catch (err) {
            setError("Có lỗi xảy ra khi lấy chi tiết đơn hàng.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orderId) {
            fetchOrderInfo();
            fetchOrderDetails();
        }
    }, [orderId]);

    const handleOpenModal = (product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    const handleSubmitReview = async () => {
        if (!selectedProduct) return;

        const requestData = {
            ProductId: selectedProduct.ProductId,
            Rating: rating,
            ReviewText: reviewText,
        };

        try {
            const response = await axios.post(`${API_BASE_URL}/ProductFeedback/add`, requestData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Kiểm tra kết quả trả về từ API
            if (response.data && response.data.message) {
                alert(response.data.message);  // Thông báo người dùng nếu có lỗi từ backend
            } else {
                alert("Đánh giá đã được gửi thành công!");
                setShowModal(false);
            }
        } catch (error) {
            console.error("Lỗi gửi đánh giá:", error);
            // Kiểm tra lỗi trả về từ backend
            if (error.response && error.response.data) {
                alert("Lỗi khi gửi đánh giá: " + error.response.data);  // Hiển thị lỗi từ backend
            } else {
                alert("Lỗi không xác định khi gửi đánh giá.");
            }
        }
    };

    if (loading) return <div>Đang tải chi tiết đơn hàng...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    // Phần sao có thể chọn
    const StarRating = ({ rating, onRatingChange }) => {
        const stars = [1, 2, 3, 4, 5];
        return (
            <div className="rating-container">
                {stars.map((star) => (
                    <FaStar
                        key={star}
                        className={`rating-star ${rating >= star ? 'selected' : ''}`}
                        onClick={() => onRatingChange(star)}
                    />
                ))}
            </div>
        );
    };

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
                    </div>
                    <div>
                        <p>Khách hàng: {orderInfo?.CustomerName || 'Chưa có dữ liệu'}</p>
                        <p>Địa chỉ giao hàng: {orderInfo?.ShippingAddress || 'Chưa có dữ liệu'}</p>
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
                                </div>
                            </div>
                            <div className="product-info-right">
                                <p>{product.UnitPrice?.toLocaleString()}đ</p>
                            </div>
                            <button onClick={() => handleOpenModal(product)}>Đánh giá</button>
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

            {/* Modal đánh giá */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Đánh giá sản phẩm</h3>
                        <p>{selectedProduct?.ProductName}</p>
                        <label>Chọn số sao:</label>
                        <StarRating rating={rating} onRatingChange={setRating} />
                        <textarea
                            placeholder="Nhập đánh giá của bạn"
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                        ></textarea>
                        <div className="modal-buttons">
                            <button
                                onClick={handleSubmitReview}
                                disabled={reviewText.trim() === ""}
                            >
                                Gửi đánh giá
                            </button>
                            <button onClick={() => setShowModal(false)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Nút Quay lại */}
            <div className="action-buttons">
                <button onClick={() => window.history.back()}>Quay lại</button>
            </div>
        </div>
    );
};

export default OrderDetails;
