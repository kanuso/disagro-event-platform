import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Services from "./pages/Services";
import Products from "./pages/Products";
import Attendances from "./pages/Attendances";
import Reports from "./pages/Reports";
import PublicAttendanceForm from "./pages/PublicAttendanceForm";
import Portfolio from "./pages/Portfolio";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ========== RUTAS PÚBLICAS (sin layout admin) ========== */}
        <Route path="/evento" element={<PublicAttendanceForm />} />
        <Route path="/evento/confirmacion/:id" element={<Portfolio />} />

        {/* ========== RUTAS ADMIN (con layout) ========== */}
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/services" element={<Services />} />
          <Route path="/products" element={<Products />} />
          <Route path="/attendances" element={<Attendances />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/evento" element={<PublicAttendanceForm />} />
          <Route path="/evento/confirmacion/:id" element={<Portfolio />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;