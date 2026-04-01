import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@hooks/useStore.js';
import { useAuth } from '@hooks/useAuth.js';
import { BaseLayout } from '@layouts/BaseLayout.jsx';
import { LoginPage } from '@pages/LoginPage.jsx';
import { SignupPage } from '@pages/SignupPage.jsx';
import { DashboardPage } from '@pages/DashboardPage.jsx';
import { ClientsPage } from '@pages/ClientsPage.jsx';
import { ProjectsPage } from '@pages/ProjectsPage.jsx';
import { TasksPage } from '@pages/TasksPage.jsx';
import { AnalyticsPage } from '@pages/AnalyticsPage.jsx';
import { PaymentsPage } from '@pages/PaymentsPage.jsx';
import '@/index.css';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

const AuthRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

function App() {
  useAuth();

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <AuthRoute>
              <LoginPage />
            </AuthRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthRoute>
              <SignupPage />
            </AuthRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <BaseLayout>
                <DashboardPage />
              </BaseLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <BaseLayout>
                <ClientsPage />
              </BaseLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <BaseLayout>
                <ProjectsPage />
              </BaseLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <BaseLayout>
                <TasksPage />
              </BaseLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <BaseLayout>
                <AnalyticsPage />
              </BaseLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <BaseLayout>
                <PaymentsPage />
              </BaseLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
