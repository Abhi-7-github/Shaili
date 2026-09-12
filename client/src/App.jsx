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
          {/* Main Shaili App protected routes: user must be logged in to enter */}
          <Route path="/" element={<ProtectedRoute><ShailiLandingPage /></ProtectedRoute>} />
          <Route path="/home" element={<ProtectedRoute><ShailiLandingPage /></ProtectedRoute>} />
          <Route path="/wardrobe" element={<ProtectedRoute><ShailiLandingPage /></ProtectedRoute>} />
          <Route path="/mywardrobe" element={<ProtectedRoute><ShailiLandingPage /></ProtectedRoute>} />
          <Route path="/aistyle" element={<ProtectedRoute><ShailiLandingPage /></ProtectedRoute>} />
          <Route path="/aistylist" element={<ProtectedRoute><ShailiLandingPage /></ProtectedRoute>} />
          <Route path="/stylist" element={<ProtectedRoute><ShailiLandingPage /></ProtectedRoute>} />
          <Route path="/studio" element={<ProtectedRoute><ShailiLandingPage /></ProtectedRoute>} />
          <Route path="/outfitstudio" element={<ProtectedRoute><ShailiLandingPage /></ProtectedRoute>} />
          <Route path="/insights" element={<ProtectedRoute><ShailiLandingPage /></ProtectedRoute>} />
          <Route path="/styleinsights" element={<ProtectedRoute><ShailiLandingPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><ShailiLandingPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ShailiLandingPage /></ProtectedRoute>} />

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
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
