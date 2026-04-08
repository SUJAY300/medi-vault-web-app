// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Login      from './pages/Login';
import Dashboard  from './pages/Dashboard';
import Documents  from './pages/Documents';
import Upload     from './pages/Upload';
import Verify     from './pages/Verify';
import Access     from './pages/Access';
import Users      from './pages/Users';
import Blockchain from './pages/Blockchain';
import Layout     from './components/Layout';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function RoleRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <PrivateRoute><Layout /></PrivateRoute>
        }>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard"  element={<Dashboard />} />
          <Route path="documents"  element={<Documents />} />
          <Route path="verify"     element={<Verify />} />
          <Route path="blockchain" element={<Blockchain />} />

          <Route path="upload" element={
            <RoleRoute allowedRoles={['doctor', 'admin']}>
              <Upload />
            </RoleRoute>
          } />

          <Route path="access" element={
            <RoleRoute allowedRoles={['patient']}>
              <Access />
            </RoleRoute>
          } />

          <Route path="users" element={
            <RoleRoute allowedRoles={['admin']}>
              <Users />
            </RoleRoute>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}