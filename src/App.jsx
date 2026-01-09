// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";

/* ---------- SUPERADMIN PAGES ---------- */
import Dashboard from "./superadmin/Dashboard";
import Products from "./superadmin/Products";
import Orders from "./superadmin/Orders";
import Promotions from "./superadmin/Promotions";
import FabricCalculator from "./superadmin/FabricCalculator";
import Logs from "./superadmin/Logs";

/* ----------  FRONT / STAFF PAGES ---------- */
import StaffNewOrder from "./admin/NewOrder";
import SearchProducts from "./admin/SearchProducts";
import StaffCheckOrders from "./admin/CheckOrders";
import SalesReport from "./admin/SalesReport";

import Login from "./pages/Login";
import { useAuth } from "./context/AuthContext";

// ทำเหมือนเดิม แต่อยู่ใต้ AuthProvider ที่ประกาศใน main.jsx
function PrivateRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  const role = user?.role || localStorage.getItem("role");

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === "staff") return <Navigate to="/" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      {/* public */}
      <Route path="/login" element={<Login />} />

      {/* layout + protected */}
      <Route
        path="/"
        element={
          <PrivateRoute allowedRoles={["superadmin", "staff"]}>
            <Layout />
          </PrivateRoute>
        }
      >
        {/* dashboard */}
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* superadmin only */}
        <Route
          path="products"
          element={
            <PrivateRoute allowedRoles={["superadmin"]}>
              <Products />
            </PrivateRoute>
          }
        />
        <Route
          path="orders"
          element={
            <PrivateRoute allowedRoles={["superadmin"]}>
              <Orders />
            </PrivateRoute>
          }
        />
        <Route
          path="promotions"
          element={
            <PrivateRoute allowedRoles={["superadmin"]}>
              <Promotions />
            </PrivateRoute>
          }
        />
        <Route
          path="fabriccalc"
          element={
            <PrivateRoute allowedRoles={["superadmin"]}>
              <FabricCalculator />
            </PrivateRoute>
          }
        />
        <Route
          path="logs"
          element={
            <PrivateRoute allowedRoles={["superadmin"]}>
              <Logs />
            </PrivateRoute>
          }
        />

        {/* staff + superadmin ใช้ร่วมกัน */}
        <Route
          path="staff/neworder"
          element={
            <PrivateRoute allowedRoles={["superadmin", "staff"]}>
              <StaffNewOrder />
            </PrivateRoute>
          }
        />
        <Route
          path="staff/search-products"
          element={
            <PrivateRoute allowedRoles={["superadmin", "staff"]}>
              <SearchProducts />
            </PrivateRoute>
          }
        />
        <Route
          path="staff/checkorders"
          element={
            <PrivateRoute allowedRoles={["superadmin", "staff"]}>
              <StaffCheckOrders />
            </PrivateRoute>
          }
        />
        <Route
          path="staff/sales-report"
          element={
            <PrivateRoute allowedRoles={["superadmin", "staff"]}>
              <SalesReport />
            </PrivateRoute>
          }
        />
      </Route>

      {/* path แปลก ๆ → เด้งไป login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}