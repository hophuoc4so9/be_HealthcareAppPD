import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import AdminLayout from './components/AdminLayout';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import UsersManagement from './pages/admin/UsersManagement';
import DoctorVerification from './pages/admin/DoctorVerification';
import ArticlesManagement from './pages/admin/ArticlesManagement';
import AppointmentsManagement from './pages/admin/AppointmentsManagement';
import DoctorLogin from './pages/doctor/Login';
import DoctorRegister from './pages/doctor/Register';
import DoctorDashboard from './pages/doctor/Dashboard';
import PatientDetail from './pages/doctor/PatientDetail';
import ChatPage from './pages/doctor/ChatPage';
import ScheduleManagement from './pages/doctor/ScheduleManagement';
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
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/users" element={<AdminLayout><UsersManagement /></AdminLayout>} />
          <Route path="/admin/doctors" element={<AdminLayout><DoctorVerification /></AdminLayout>} />
          <Route path="/admin/articles" element={<AdminLayout><ArticlesManagement /></AdminLayout>} />
          <Route path="/admin/appointments" element={<AdminLayout><AppointmentsManagement /></AdminLayout>} />

          {/* Doctor Routes */}
          <Route path="/doctor/login" element={<DoctorLogin />} />
          <Route path="/doctor/register" element={<DoctorRegister />} />
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/patients/:id" element={<PatientDetail />} />
          <Route path="/doctor/chat" element={<ChatPage />} />
          <Route path="/doctor/schedule" element={<ScheduleManagement />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
