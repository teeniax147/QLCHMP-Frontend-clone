import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import './StaffLayout.css'; // Đổi tên file CSS thành StaffLayout.css để tránh nhầm lẫn với AdminLayout.css

const StaffLayout = () => {
  const [userName, setUserName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [greeting, setGreeting] = useState('');

  const handleDropdownToggle = () => setShowDropdown(!showDropdown);

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }

    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting('Good morning 🌅');
    } else if (currentHour < 18) {
      setGreeting('Good afternoon ☀️');
    } else {
      setGreeting('Good evening 🌙');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userName');
    setUserName('');
    setShowDropdown(false);
  };

  return (
    <div className="staff-layout">
      <aside className="staff-sidebar">
        <h2>GLAMOUR COSMIC - Staff</h2>
        <nav>
          <ul>
            <li><Link to="/staff/tasks">Công việc của tôi</Link></li>
            <li><Link to="/staff/customers">Khách hàng</Link></li>
            <li><Link to="/staff/orders">Đơn hàng</Link></li>
          </ul>
        </nav>
      </aside>
      <main className="staff-content">
        <header className="staff-header">
          <input type="text" placeholder="Tìm kiếm..." />
          <span className="icon">
            {userName && (
              <div onClick={handleDropdownToggle} className="user-menu-trigger">
                <img src="src/assets/Icons/dangnhap.png" alt="User Icon" />
                <span>{userName}</span>
              </div>
            )}
            {userName && showDropdown && (
              <div className="staff-dropdown-menu">
                <p>{greeting} {userName}!</p>
                <ul>
                  <li>
                    <button onClick={handleLogout} className="logout-button">Đăng xuất</button>
                  </li>
                </ul>
              </div>
            )}
          </span>
        </header>
        <div className="staff-page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StaffLayout;
