import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, RequireAuth } from "@/contexts/AuthContext";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import AuthCallbackPage from "./pages/AuthCallback";
import PricingPage from "./pages/PricingPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import Dashboard from "./pages/Dashboard";
import GeneratePage from "./pages/GeneratePage";
import PromoPage from "./pages/PromoPage";
import StylePage from "./pages/StylePage";
import MascotPage from "./pages/MascotPage";
import FoodPage from "./pages/FoodPage";
import HistoryPage from "./pages/HistoryPage";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminReferrals from "./pages/admin/AdminReferrals";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            
            {/* Protected Routes */}
            <Route path="/payment/success" element={
              <RequireAuth><PaymentSuccessPage /></RequireAuth>
            } />
            <Route path="/dashboard" element={
              <RequireAuth><Dashboard /></RequireAuth>
            } />
            <Route path="/dashboard/generate" element={
              <RequireAuth><GeneratePage /></RequireAuth>
            } />
            <Route path="/dashboard/promo" element={
              <RequireAuth><PromoPage /></RequireAuth>
            } />
            <Route path="/dashboard/style" element={
              <RequireAuth><StylePage /></RequireAuth>
            } />
            <Route path="/dashboard/mascot" element={
              <RequireAuth><MascotPage /></RequireAuth>
            } />
            <Route path="/dashboard/food" element={
              <RequireAuth><FoodPage /></RequireAuth>
            } />
            <Route path="/dashboard/history" element={
              <RequireAuth><HistoryPage /></RequireAuth>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="transactions" element={<AdminTransactions />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="referrals" element={<AdminReferrals />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            
            {/* Redirect old routes to dashboard */}
            <Route path="/generate" element={<Navigate to="/dashboard/generate" replace />} />
            <Route path="/promo" element={<Navigate to="/dashboard/promo" replace />} />
            <Route path="/style" element={<Navigate to="/dashboard/style" replace />} />
            <Route path="/mascot" element={<Navigate to="/dashboard/mascot" replace />} />
            <Route path="/food" element={<Navigate to="/dashboard/food" replace />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
