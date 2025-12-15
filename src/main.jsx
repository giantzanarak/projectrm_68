import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import Login from "./pages/Login.jsx";

// Staff Layout + Pages
import StaffTopbar from "./components/StaffTopbar.jsx";
import StaffLayout from "./components/StaffSidebar.jsx";
import DashboardStaff from "./admin/DashboardStaff.jsx";
import SearchProducts from "./admin/SearchProducts.jsx";
import NewOrder from "./admin/NewOrder.jsx";
import CheckOrders from "./admin/CheckOrders.jsx";
import SalesReport from "./admin/SalesReport.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
  <StaffTopbar/>
    <Routes>

      {/* ===========================
            Login Page
      ============================ */}
      <Route path="/login" element={<Login />} />

      {/* ===========================
            Staff Pages + Layout
      ============================ */}
      <Route path="/admin" element={<StaffLayout />}>
        <Route path="dashboard" element={<DashboardStaff />} />
        <Route path="search" element={<SearchProducts />} />
        <Route path="neworder" element={<NewOrder />} />
        <Route path="checkorders" element={<CheckOrders />} />
         <Route path="salesreport" element={<SalesReport/>} />
      </Route>

      {/* DEFAULT → redirect ไป login */}
      <Route path="/" element={<Login />} />
    </Routes>
  </BrowserRouter>
);
