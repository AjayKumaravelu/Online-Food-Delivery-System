import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import LandingPage from './pages/LandingPage.jsx';
import CustomerLogin from './pages/CustomerLogin.jsx';
import CustomerRegister from './pages/CustomerRegister.jsx';
import RestaurantLogin from './pages/RestaurantLogin.jsx';
import RestaurantRegister from './pages/RestaurantRegister.jsx';
import RestaurantDashboard from './pages/RestaurantDashboard.jsx';
import MainPage from './pages/MainPage.jsx';
import RestaurantPage from './pages/RestaurantPage.jsx';
import CartPage from './pages/CartPage.jsx';
import PaymentPage from './pages/PaymentPage.jsx';
import PaymentSuccess from './pages/PaymentSuccess.jsx';
import UserProfile from './pages/UserProfile.jsx';

 
function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/customer/login" element={<CustomerLogin />} />
          <Route path="/customer/register" element={<CustomerRegister />} />
          <Route path="/restaurant/login" element={<RestaurantLogin />} />
          <Route path="/restaurant/register" element={<RestaurantRegister />} />
          <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
          <Route path="/main" element={<MainPage />} />
          <Route path="/restaurant/:id" element={<RestaurantPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </div>
    </AppProvider>
  );
}

export default App;