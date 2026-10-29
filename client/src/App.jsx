import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import SiteLayout from './components/layout/SiteLayout.jsx';
import Home from './pages/customer/Home.jsx';

// Stage 3: only the homepage is registered. More routes are introduced
// in later frontend branches (about, menu, cart, bookings and staff).
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
