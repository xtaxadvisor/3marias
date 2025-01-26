import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { UnauthorizedPage } from '../components/shared/UnauthorizedPage';
import { NotFoundPage } from '../components/shared/NotFoundPage';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

// Lazy load components
const Home = React.lazy(() => import('../pages/Home'));
const LoginPage = React.lazy(() => import('../pages/LoginPage'));
const RegisterPage = React.lazy(() => import('../pages/RegisterPage'));
const ConsultationPage = React.lazy(() => import('../pages/consultation/ConsultationPage'));
const ServiceCatalog = React.lazy(() => import('../pages/services/ServiceCatalog'));
const SameDayServices = React.lazy(() => import('../pages/services/SameDayServices'));
const VideoLibrary = React.lazy(() => import('../pages/videos/VideoLibrary'));
const VideoDetail = React.lazy(() => import('../pages/videos/VideoDetail'));
const AdminPortal = React.lazy(() => import('../pages/admin/AdminPortal'));
const InvestorPortal = React.lazy(() => import('../pages/investor/InvestorPortal'));
const StudentPortal = React.lazy(() => import('../pages/student/StudentPortal'));
const ProfessionalPortal = React.lazy(() => import('../pages/ProfessionalPortal'));

// Admin routes only in development
const TestRunner = process.env.NODE_ENV === 'development' 
  ? React.lazy(() => import('../components/testing/TestRunner').then(module => ({ 
      default: module.TestRunner 
    })))
  : null;

export function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/services" element={<ServiceCatalog />} />
      <Route path="/same-day-services" element={<SameDayServices />} />
      <Route path="/browse-videos" element={<VideoLibrary />} />
      <Route path="/browse-videos/:videoId" element={<VideoDetail />} />
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />} 
      />

      {/* Protected Routes */}
      <Route
        path="/consultation/*"
        element={
          <ProtectedRoute>
            <ConsultationPage />
          </ProtectedRoute>
        }
      />

      {/* Portal Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole={['admin']}>
            <AdminPortal />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/investor/*"
        element={
          <ProtectedRoute requiredRole={['investor']}>
            <InvestorPortal />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/*"
        element={
          <ProtectedRoute requiredRole={['student']}>
            <StudentPortal />
          </ProtectedRoute>
        }
      />

      <Route
        path="/professional/*"
        element={
          <ProtectedRoute requiredRole={['professional']}>
            <ProfessionalPortal />
          </ProtectedRoute>
        }
      />

      {/* Development Only Routes */}
      {process.env.NODE_ENV === 'development' && TestRunner && (
        <Route 
          path="/test" 
          element={
            <ProtectedRoute requiredRole={['admin']}>
              <TestRunner />
            </ProtectedRoute>
          } 
        />
      )}

      {/* Error Pages */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/not-found" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  );
}