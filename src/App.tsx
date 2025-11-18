import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import AdminLayout from './components/AdminLayout';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import UsersManagement from './pages/admin/UsersManagement';
import DoctorVerification from './pages/admin/DoctorVerification';
import ArticlesManagement from './pages/admin/ArticlesManagement';
import AppointmentsManagement from './pages/admin/AppointmentsManagement';
import './App.css';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/login" />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
          <Route path="/admin/users" element={<AdminLayout><UsersManagement /></AdminLayout>} />
          <Route path="/admin/doctors" element={<AdminLayout><DoctorVerification /></AdminLayout>} />
          <Route path="/admin/articles" element={<AdminLayout><ArticlesManagement /></AdminLayout>} />
          <Route path="/admin/appointments" element={<AdminLayout><AppointmentsManagement /></AdminLayout>} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
