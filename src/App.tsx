import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { WorkbookPage } from "./pages/WorkbookPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminUserSelectPage } from "./pages/AdminUserSelectPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { WorkbookDetailsPage } from "./pages/WorkbookDetailsPage";
import { MapaIntroPage } from "./pages/MapaIntroPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PageTransition } from "./components/PageTransition";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
      <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
      <Route path="/onboarding" element={<PageTransition><OnboardingPage /></PageTransition>} />
      <Route path="/intro" element={<PageTransition><MapaIntroPage /></PageTransition>} />
      <Route
        path="/workbook/day0"
        element={
          <ProtectedRoute>
            <PageTransition><WorkbookPage /></PageTransition>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <PageTransition><DashboardPage /></PageTransition>
          </ProtectedRoute>
        }
      />
      <Route path="/admin" element={<PageTransition><AdminLoginPage /></PageTransition>} />
      <Route path="/admin/select" element={<AdminUserSelectPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="/admin/workbook/:workbookId" element={<WorkbookDetailsPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
