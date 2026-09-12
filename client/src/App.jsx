import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import { UploadPage } from './components/UploadPage';
import { ShailiLandingPage } from './components/ShailiLandingPage';

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner-large"></div>
        <p>Verifying Authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route wrapper for /login and /register
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner-large"></div>
        <p>Verifying Authentication...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Main Shaili Animated Opening & Landing Page */}
          <Route path="/" element={<ShailiLandingPage />} />
          <Route path="/landing" element={<ShailiLandingPage />} />

          {/* Login route: /login */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <AuthForm initialSignUp={false} />
              </PublicRoute>
            }
          />

          {/* Sign up / Register route: /register */}
          <Route
            path="/register"
            element={
              <PublicRoute>
                <AuthForm initialSignUp={true} />
              </PublicRoute>
            }
          />

          {/* Dashboard route: /home */}
          <Route
            path="/home"
            element={<ShailiLandingPage />}
          />

          {/* Upload route: /upload */}
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
