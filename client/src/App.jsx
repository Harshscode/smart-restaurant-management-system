
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate
} from 'react-router-dom';

import SiteLayout from './components/layout/SiteLayout.jsx';
import Home from './pages/customer/Home.jsx';
import About from './pages/customer/About.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
