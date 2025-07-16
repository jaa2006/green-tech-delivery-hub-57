
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster"
import Index from './pages/Index';
import Onboarding from './pages/Onboarding';
import Register from './pages/Register';
import Auth from './pages/Auth';
import LoginUser from './pages/LoginUser';
import RegisterUser from './pages/RegisterUser';
import LoginDriver from './pages/LoginDriver';
import RegisterDriver from './pages/RegisterDriver';
import LoginSeller from './pages/LoginSeller';
import RegisterSeller from './pages/RegisterSeller';
import UserDashboard from './pages/UserDashboard';
import DriverDashboard from './pages/DriverDashboard';
import SellerDashboard from './pages/SellerDashboard';
import NotFound from './pages/NotFound';
import HabiRide from './pages/HabiRide';
import HabiFood from './pages/HabiFood';
import Restaurant from './pages/Restaurant';
import FoodDetail from './pages/FoodDetail';
import Search from './pages/Search';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import AntarPenumpang from './pages/AntarPenumpang';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { OrderProvider } from './contexts/OrderContext';
import { OrderStateProvider } from './contexts/OrderStateContext';
import { CartProvider } from './contexts/CartContext';
import { NavigationProvider } from './contexts/NavigationContext';
import SellerProducts from './pages/SellerProducts';
import SellerOrders from './pages/SellerOrders';
import SellerStatistics from './pages/SellerStatistics';
import SellerProfile from './pages/SellerProfile';
import AddEditProduct from './pages/AddEditProduct';
import DriverProfile from './pages/DriverProfile';
import DriverSettings from './pages/DriverSettings';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRouteV2 from './components/auth/ProtectedRouteV2';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <OrderProvider>
            <OrderStateProvider>
              <CartProvider>
                <Router>
                  <NavigationProvider>
                    <div className="App">
                      <Toaster />
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Index />} />
                        <Route path="/onboarding" element={<Onboarding />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/login-user" element={<LoginUser />} />
                        <Route path="/register-user" element={<RegisterUser />} />
                        <Route path="/login-driver" element={<LoginDriver />} />
                        <Route path="/register-driver" element={<RegisterDriver />} />
                        <Route path="/login-seller" element={<LoginSeller />} />
                        <Route path="/register-seller" element={<RegisterSeller />} />
                        
                        {/* Protected User Routes */}
                        <Route 
                          path="/user-dashboard" 
                          element={
                            <ProtectedRouteV2 requiredRole="user">
                              <UserDashboard />
                            </ProtectedRouteV2>
                          } 
                        />
                        <Route 
                          path="/habiride" 
                          element={
                            <ProtectedRouteV2 requiredRole="user">
                              <HabiRide />
                            </ProtectedRouteV2>
                          } 
                        />
                        <Route 
                          path="/habifood" 
                          element={
                            <ProtectedRouteV2 requiredRole="user">
                              <HabiFood />
                            </ProtectedRouteV2>
                          } 
                        />
                        <Route 
                          path="/search" 
                          element={
                            <ProtectedRouteV2 requiredRole="user">
                              <Search />
                            </ProtectedRouteV2>
                          } 
                        />
                        <Route 
                          path="/cart" 
                          element={
                            <ProtectedRouteV2 requiredRole="user">
                              <Cart />
                            </ProtectedRouteV2>
                          } 
                        />
                        <Route 
                          path="/orders" 
                          element={
                            <ProtectedRouteV2 requiredRole="user">
                              <Orders />
                            </ProtectedRouteV2>
                          } 
                        />
                        <Route 
                          path="/profile" 
                          element={
                            <ProtectedRouteV2 requiredRole="user">
                              <Profile />
                            </ProtectedRouteV2>
                          } 
                        />
                        <Route 
                          path="/checkout" 
                          element={
                            <ProtectedRouteV2 requiredRole="user">
                              <Checkout />
                            </ProtectedRouteV2>
                          } 
                        />
                        
                        {/* Restaurant and Food Detail Routes */}
                        <Route 
                          path="/restaurant/:id" 
                          element={
                            <ProtectedRouteV2 requiredRole="user">
                              <Restaurant />
                            </ProtectedRouteV2>
                          } 
                        />
                        <Route 
                          path="/food/:id" 
                          element={
                            <ProtectedRouteV2 requiredRole="user">
                              <FoodDetail />
                            </ProtectedRouteV2>
                          } 
                        />
                        
                        {/* Protected Driver Routes */}
                        <Route 
                          path="/driver-dashboard" 
                          element={
                            <ProtectedRouteV2 requiredRole="driver">
                              <DriverDashboard />
                            </ProtectedRouteV2>
                          } 
                        />
                        <Route 
                          path="/antar-penumpang" 
                          element={
                            <ProtectedRouteV2 requiredRole="driver">
                              <AntarPenumpang />
                            </ProtectedRouteV2>
                          } 
                        />
                        <Route 
                          path="/driver-profile" 
                          element={
                            <ProtectedRouteV2 requiredRole="driver">
                              <DriverProfile />
                            </ProtectedRouteV2>
                          } 
                        />
                        <Route 
                          path="/driver-settings" 
                          element={
                            <ProtectedRouteV2 requiredRole="driver">
                              <DriverSettings />
                            </ProtectedRouteV2>
                          } 
                        />
                        
                        {/* Protected Seller Routes */}
                        <Route 
                          path="/seller-dashboard" 
                          element={
                            <ProtectedRouteV2 requiredRole="seller">
                              <SellerDashboard />
                            </ProtectedRouteV2>
                          } 
                        />
                        <Route 
                          path="/seller/products" 
                          element={
                            <ProtectedRouteV2 requiredRole="seller">
                              <SellerProducts />
                            </ProtectedRouteV2>
                          } 
                        />
                        <Route 
                          path="/seller/products/add" 
                          element={
                            <ProtectedRouteV2 requiredRole="seller">
                              <AddEditProduct />
                            </ProtectedRouteV2>
                          } 
                        />
                        <Route 
                          path="/seller/products/edit/:productId" 
                          element={
                            <ProtectedRouteV2 requiredRole="driver">
                              <AddEditProduct />
                            </ProtectedRouteV2>
                          } 
                        />
                        <Route 
                          path="/seller/orders" 
                          element={
                            <ProtectedRouteV2 requiredRole="seller">
                              <SellerOrders />
                            </ProtectedRouteV2>
                          } 
                        />
                        <Route 
                          path="/seller/statistics" 
                          element={
                            <ProtectedRouteV2 requiredRole="seller">
                              <SellerStatistics />
                            </ProtectedRouteV2>
                          } 
                        />
                        <Route 
                          path="/seller/profile" 
                          element={
                            <ProtectedRouteV2 requiredRole="seller">
                              <SellerProfile />
                            </ProtectedRouteV2>
                          } 
                        />
                        
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </div>
                  </NavigationProvider>
                </Router>
              </CartProvider>
            </OrderStateProvider>
          </OrderProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
