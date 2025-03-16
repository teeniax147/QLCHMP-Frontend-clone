import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx'; // Đảm bảo rằng đường dẫn đúng với file App.jsx
import './index.css'; // Import file CSS chung

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App /> {/* Hiển thị toàn bộ ứng dụng */}
  </StrictMode>
);
