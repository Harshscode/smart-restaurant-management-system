import { Component } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import SiteLayout from './components/layout/SiteLayout.jsx';
import AdminLayout from './components/layout/AdminLayout.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

import Home from './pages/customer/Home.jsx';
import About from './pages/customer/About.jsx';
import Menu from './pages/customer/Menu.jsx';
import Cart from './pages/customer/Cart.jsx';
import Checkout from './pages/customer/Checkout.jsx';
import TrackOrder from './pages/customer/TrackOrder.jsx';
import Reservations from './pages/customer/Reservations.jsx';
import Events from './pages/customer/Events.jsx';
import Concierge from './pages/customer/Concierge.jsx';
import AccountLogin from './pages/customer/AccountLogin.jsx';
import Account from './pages/customer/Account.jsx';
import NotFound from './pages/customer/NotFound.jsx';

import AdminLogin from './pages/admin/AdminLogin.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import AdminMenu from './pages/admin/AdminMenu.jsx';
import AdminOrders from './pages/admin/AdminOrders.jsx';
import AdminReservations from './pages/admin/AdminReservations.jsx';
import AdminEvents from './pages/admin/AdminEvents.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error, info) { console.error('Application error:', error, info); }
  render() {
    return this.state.failed
      ? <div className="container section" role="alert"><h1>Something went wrong.</h1><p>Please refresh the page and try again.</p><a className="btn btn-primary" href="/">Back to home</a></div>
      : this.props.children;
  }
}

function RequireAdmin() {
  const { isAdmin } = useAuth();
  return isAdmin ? <Outlet /> : <Navigate to="/admin/login" replace />;
}

function RequireCustomer() {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/account/login" replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <Routes>
                <Route element={<SiteLayout />}>
                  <Route index element={<Home />} />
                  <Route path="about" element={<About />} />
                  <Route path="menu" element={<Menu />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="track" element={<TrackOrder />} />
                  <Route path="reservations" element={<Reservations />} />
                  <Route path="events" element={<Events />} />
                  <Route path="concierge" element={<Concierge />} />
                  <Route path="account/login" element={<AccountLogin />} />
                  <Route element={<RequireCustomer />}>
                    <Route path="account" element={<Account />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Route>
                <Route path="admin/login" element={<AdminLogin />} />
                <Route element={<RequireAdmin />}>
                  <Route path="admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="menu" element={<AdminMenu />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="reservations" element={<AdminReservations />} />
                    <Route path="events" element={<AdminEvents />} />
                    <Route path="users" element={<AdminUsers />} />
                  </Route>
                </Route>
              </Routes>
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
