import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { useTaskNotifications } from './hooks/useTaskNotifications';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Expenses } from './pages/Expenses';
import { Meals } from './pages/Meals';
import { Tasks } from './pages/Tasks';
import { CalendarPage } from './pages/CalendarPage';
import { LoginPage } from './pages/LoginPage';

function AppContent() {
  useTaskNotifications();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/expenses" element={
        <ProtectedRoute>
          <MainLayout>
            <Expenses />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/meals" element={
        <ProtectedRoute>
          <MainLayout>
            <Meals />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/tasks" element={
        <ProtectedRoute>
          <MainLayout>
            <Tasks />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/calendar" element={
        <ProtectedRoute>
          <MainLayout>
            <CalendarPage />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
