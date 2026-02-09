// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import { useAuth } from "./context/AuthContext";

// ---------- SUPERADMIN PAGES ----------
import Dashboard from "./superadmin/Dashboard";
import Products from "./superadmin/Products";
import Orders from "./superadmin/Orders";
import Promotions from "./superadmin/Promotions";
import FabricCalculator from "./superadmin/FabricCalculator";
import Logs from "./superadmin/Logs";

// ---------- STAFF PAGES ----------
import StaffNewOrder from "./admin/NewOrder";
import SearchProducts from "./admin/SearchProducts";
import StaffCheckOrders from "./admin/CheckOrders";
import SalesReport from "./admin/SalesReport";

// ---------- AUTH ----------
import Login from "./pages/Login";
import Register from "./pages/Register";

// ✅ helper: อ่าน role ให้ชัวร์ (รองรับทั้ง context + localStorage)
function getRoleFromStorage() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    return u?.role || localStorage.getItem("role") || "";
  } catch {
    return localStorage.getItem("role") || "";
  }
}

// ✅ Route guard
function PrivateRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  const role = (user?.role || getRoleFromStorage() || "").toLowerCase();

  // ยังไม่ login
  if (!role) return <Navigate to="/login" replace />;

  // มีการกำหนด allowedRoles แล้ว role ไม่ผ่าน
  if (allowedRoles && !allowedRoles.map((r) => r.toLowerCase()).includes(role)) {
    // staff ถูกกันจาก superadmin -> ส่งไปหน้า staff
    if (role === "staff") return <Navigate to="/staff/neworder" replace />;
    // อื่น ๆ ส่งไป login
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      {/* ---------- PUBLIC ---------- */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ---------- PROTECTED LAYOUT ---------- */}
      <Route
        path="/"
        element={
          <PrivateRoute allowedRoles={["superadmin", "staff"]}>
            <Layout />
          </PrivateRoute>
        }
      >
        {/* ✅ หน้าแรกของ "/" ให้เป็น Dashboard (ตามเดิม) */}
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* ---------- SUPERADMIN ONLY ---------- */}
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

        {/* ---------- STAFF + SUPERADMIN ---------- */}
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

      {/* ---------- FALLBACK ---------- */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}