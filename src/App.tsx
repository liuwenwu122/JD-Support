import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ForgotPassword from './components/Auth/ForgotPassword';
import UpdatePassword from './components/Auth/UpdatePassword';
import UserProfile from './components/UserProfile';
import MainLayout from './components/MainLayout';

import { AIProvider } from './contexts/AIContext';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AIProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<MainLayout />} />
              <Route path="/profile" element={<UserProfile />} />
            </Route>
          </Routes>
        </AIProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
