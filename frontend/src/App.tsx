import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOTP from "./pages/VerifyOTP";
import NotFound from "./pages/NotFound";

// Customer Portal Pages
import CustomerDashboard from "./pages/customer/Dashboard";
import CustomerAccounts from "./pages/customer/Accounts";
import CustomerTransactions from "./pages/customer/Transactions";
import CustomerCards from "./pages/customer/Cards";
import CustomerTransfer from "./pages/customer/Transfer";
import CustomerDeposits from "./pages/customer/Deposits";
import CustomerProfile from "./pages/customer/Profile";

// Banker Portal Pages
import BankerDashboard from "./pages/banker/Dashboard";
import BankerCustomers from "./pages/banker/Customers";
import BankerAccounts from "./pages/banker/Accounts";
import BankerVerification from "./pages/banker/Verification";
import BankerReports from "./pages/banker/Reports";
import BankerSettings from "./pages/banker/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />

          {/* Customer Portal Routes */}
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/accounts" element={<CustomerAccounts />} />
          <Route path="/customer/transactions" element={<CustomerTransactions />} />
          <Route path="/customer/cards" element={<CustomerCards />} />
          <Route path="/customer/transfer" element={<CustomerTransfer />} />
          <Route path="/customer/deposits" element={<CustomerDeposits />} />
          <Route path="/customer/profile" element={<CustomerProfile />} />

          {/* Banker Portal Routes */}
          <Route path="/banker/dashboard" element={<BankerDashboard />} />
          <Route path="/banker/customers" element={<BankerCustomers />} />
          <Route path="/banker/accounts" element={<BankerAccounts />} />
          <Route path="/banker/verification" element={<BankerVerification />} />
          <Route path="/banker/reports" element={<BankerReports />} />
          <Route path="/banker/settings" element={<BankerSettings />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
