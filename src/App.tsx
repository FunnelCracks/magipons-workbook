import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { WorkbookPage } from "./pages/WorkbookPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminUserSelectPage } from "./pages/AdminUserSelectPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/workbook/day0"
          element={
            <ProtectedRoute>
              <WorkbookPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/select" element={<AdminUserSelectPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
