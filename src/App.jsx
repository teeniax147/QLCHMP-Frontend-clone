import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CouponList from './pages/CouponList';
import ProductDetail from "./pages/ProductDetail";
import OtpVerification from './pages/OtpVerification';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import BeautyBlog from './pages/BeautyBlog';
import ProductList from './pages/ProductList';
import AllProductsList from './pages/AllProductsList';
import BrandProducts from './pages/BrandProducts';
import CartPage from "./pages/CartPage";
import UserProfile from './pages/UserProfile';
import UserProfileAdmin from './pages/UserProfileAdmin';
import FavoritesPage from "./pages/FavoritesPage";
import CartPreviewPage from './pages/CartPreviewPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import AdminLayout from './AdminLayout';
import HomeAdmin from './pages/HomeAdmin';
import ProductManager from './pages/ProductManager';
import CategoryManagement from './pages/CategoryManagement';
import OrderManager from './pages/OrderManager';
import OrderList from "./pages/OrderList";
import AddCategory from './pages/AddCategory';
import BrandManagement from './pages/BrandManagement';
import CouponsManagement from "./pages/CouponsManagement";
import InventoryManagement from "./pages/InventoryManagement";
import RevenueReport from './pages/RevenueReport';
import BlogManager from './pages/BlogManager';
import CreateUser from "./pages/CreateUser";
import CustomerList from "./pages/CustomerList";
import { Provider } from "react-redux"
import { store } from "./redux/store";
import OrderDetails from "./pages/OrderDetails";
import MembershipLevelManager from './pages/MembershipLevelManager';
function App() {



    // const isLoggedIn = !!localStorage.getItem('token'); // Kiểm tra token đăng nhập
    // const roles = JSON.parse(localStorage.getItem('roles') || '[]');

    // // Đảm bảo rằng `roles` là một mảng
    // const userRoles = Array.isArray(roles) ? roles : [];

    // const isAdmin = userRoles.includes('Admin');
    // const isStaff = userRoles.includes('Staff');
    // const isCustomer = userRoles.includes('Customer');
    // // Điều hướng mặc định theo quyền
    // const defaultRoute = () => {
    //     if (isAdmin) {
    //         return <Navigate to="/admin" />;
    //     } else if (isStaff) {
    //         return <Navigate to="/staff" />;
    //     } else if (isCustomer) {
    //         return <Navigate to="/" />;
    //     } else {
    //         return <Navigate to="/login" />;
    //     }
    // };
    return (
        <Provider store={store}>
            <Router>
                <Routes>
                    {/* Điều hướng mặc định dựa trên quyền */}
                    {/* <Route path="/" element={defaultRoute()} /> */}
                    {/* Layout chính */}
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="user-profile" element={<UserProfile />} />
                        <Route path="coupons" element={<CouponList />} />
                        <Route path="/product-detail/:id" element={<ProductDetail />} />
                        <Route path="/beauty-blog" element={<BeautyBlog />} />
                        <Route path="products/:categoryId" element={<ProductList />} />
                        <Route path="all-products" element={<AllProductsList />} />
                        <Route path="/brand/:brandId" element={<BrandProducts />} />
                        <Route path="/CartPage" element={<CartPage />} />
                        <Route path="/favorites" element={<FavoritesPage />} />
                        <Route path="/cart-preview" element={<CartPreviewPage />} />
                        <Route path="/order-success" element={<OrderSuccessPage />} />
                        <Route path="/orders/customer/:customerId" element={<OrderList />} />
                        <Route path="/order-details/:orderId" element={<OrderDetails />} />

                    </Route>

                    {/* Route cho admin */}
                    <Route
                        path="/admin"
                        element={<AdminLayout />}
                    >
                        <Route index element={<UserProfileAdmin />} />
                        <Route path="users" element={<div>Quản lí người dùng</div>} />
                        <Route path="user-profile-admin" element={<UserProfileAdmin />} />
                        <Route path="orders" element={<OrderManager />} />
                        <Route path="products" element={<ProductManager />} />
                        <Route path="categories" element={<CategoryManagement />} />
                        <Route path="add-category" element={<AddCategory />} />
                        <Route path="brands" element={<BrandManagement />} />
                        <Route path="coupons" element={<CouponsManagement />} />
                        <Route path="inventory" element={<InventoryManagement />} />
                        <Route path="revenue-report" element={<RevenueReport />} />
                        <Route path="blogs" element={<BlogManager />} />
                        <Route path="create-user" element={<CreateUser />} />
                        <Route path="customers" element={<CustomerList />} />
                        <Route path="membershiplevel" element={<MembershipLevelManager />} />
                    </Route>

                    {/* Route cho staff */}
                    {/* <Route
                    path="/staff"
                    element={
                        isLoggedIn && isStaff ? (
                            <StaffLayout />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                >
                    <Route index element={<HomeStaff />} />
                    <Route path="tasks" element={<div>Công việc của tôi</div>} />
                    <Route path="customers" element={<div>Khách hàng</div>} />

                </Route> */}

                    {/* Điều hướng mặc định cho customer */}


                    {/* Các route khác */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/otp" element={<OtpVerification />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                </Routes>
            </Router>
        </Provider>
    );
}

export default App;
