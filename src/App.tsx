import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Categories from "./pages/Categories";
import Warehouses from "./pages/Warehouses";
import AuditLog from "./pages/AuditLog";
import Users from "./pages/Users";
import Login from "./pages/Login";
import Checkout from "./pages/Checkout";
import Receipt from "./pages/Receipt";
import NotFound from "./pages/NotFound";

import { CheckoutProvider } from "./context/CheckoutContext";
import { InventoryProvider } from "./context/InventoryContext";
import { HistoryProvider } from "./context/HistoryContext";
import { ThemeProvider } from "./context/ThemeContext";

// Admin auth check
const PrivateRoute = ({ children, superOnly = false }: { children: React.ReactNode, superOnly?: boolean }) => {
  const userRole = localStorage.getItem('user_role');
  const hasToken = localStorage.getItem(`auth_token_${userRole}`) === 'mock_token' || localStorage.getItem('auth_token') === 'mock_token';

  if (!hasToken) return <Navigate to="/login" />;
  if (superOnly && userRole !== 'SuperAdmin') return <Navigate to="/products" />;

  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => {
  const userRole = localStorage.getItem('user_role');
  const defaultRoute = userRole === 'SuperAdmin' ? "/admin" : "/products";

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            <HistoryProvider>
              <InventoryProvider>
                <CheckoutProvider>
                  <Toaster />
                  <Sonner />
                  <Routes>
                    {/* Admin Routes */}
                    <Route path="/" element={<Navigate to={defaultRoute} replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin" element={
                      <PrivateRoute superOnly>
                        <Dashboard />
                      </PrivateRoute>
                    } />
                    <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
                    <Route path="/categories" element={<PrivateRoute><Categories /></PrivateRoute>} />
                    <Route path="/inventory" element={<PrivateRoute><Inventory /></PrivateRoute>} />
                    <Route path="/warehouses" element={<PrivateRoute><Warehouses /></PrivateRoute>} />
                    <Route path="/audit" element={<PrivateRoute><AuditLog /></PrivateRoute>} />
                    <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
                    <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                    <Route path="/receipt" element={<PrivateRoute><Receipt /></PrivateRoute>} />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </CheckoutProvider>
              </InventoryProvider>
            </HistoryProvider>
          </BrowserRouter>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
