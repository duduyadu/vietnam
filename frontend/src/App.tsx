import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import StudentEdit from './pages/StudentEdit';
import Consultations from './pages/Consultations';
import Reports from './pages/Reports';
import ReportDataEntry from './pages/ReportDataEntry';
import UserManagement from './pages/UserManagement';
import Agencies from './pages/Agencies';
import TopikScores from './pages/TopikScores';
import TopikScoresUpload from './components/TopikScoresUpload';
import './utils/i18n';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Noto Sans KR", "Noto Sans", sans-serif',
  },
});

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // 토큰이 없으면 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/students"
              element={
                <PrivateRoute>
                  <Students />
                </PrivateRoute>
              }
            />
            <Route
              path="/students/:id"
              element={
                <PrivateRoute>
                  <StudentDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/students/:id/edit"
              element={
                <PrivateRoute>
                  <StudentEdit />
                </PrivateRoute>
              }
            />
            <Route
              path="/consultations"
              element={
                <PrivateRoute>
                  <Consultations />
                </PrivateRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <PrivateRoute>
                  <Reports />
                </PrivateRoute>
              }
            />
            <Route
              path="/report-data-entry"
              element={
                <PrivateRoute>
                  <ReportDataEntry />
                </PrivateRoute>
              }
            />
            <Route
              path="/users"
              element={
                <PrivateRoute>
                  <UserManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/agencies"
              element={
                <PrivateRoute>
                  <Agencies />
                </PrivateRoute>
              }
            />
            <Route
              path="/topik-exam/:id"
              element={
                <PrivateRoute>
                  <TopikScores />
                </PrivateRoute>
              }
            />
            <Route
              path="/topik-scores-upload"
              element={
                <PrivateRoute>
                  <TopikScoresUpload />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;