import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import { useAuth } from "./context/AuthContext";

import Dashboard from "./superadmin/Dashboard";
import Products from "./superadmin/Product";
import Orders from "./superadmin/Orders";
import Promotions from "./superadmin/Promotions";
import FabricCalculator from "./superadmin/FabricCalculator";
import OutfitFormulas from "./superadmin/OutfitFormulas";
import SetPrice from "./superadmin/SetPrice";
import Logs from "./superadmin/Logs";
import Fabric from "./superadmin/Fabric";
import FabricDetail from "./superadmin/FabricDetail";
import Manageusers from "./superadmin/Manageusers";
import EditFabric from "./superadmin/EditFabric";
import RecordFabricUsage from "./superadmin/RecordFabricUsage";
import AddFabric from "./superadmin/AddFabric";
import Supplier from "./superadmin/Supplier";
import AddSupplier from "./superadmin/AddSupplier";
import EditSupplier from "./superadmin/EditSupplier";
import SupplierDetail from "./superadmin/SupplierDetail";
import AddOrders from "./superadmin/AddOrders";
import OrderDetail from "./superadmin/OrderDetail";
import EditOrders from "./superadmin/EditOrders";
import TailoringOrders from "./admin/TailoringOrders";
import AddTailoringOrders from "./admin/AddTailoringOrders";
import TailoringOrderDetail from "./admin/TailoringOrderDetail";
import TailoringCalendar from "./admin/TailoringCalendar";
import CustomerOrderDetail from "./admin/OrderDetail";


import StaffNewOrder from "./admin/NewOrder";
import StaffCheckOrders from "./admin/CheckOrders";
import SalesReport from "./admin/SalesReport";

import Login from "./pages/Login";
import Register from "./pages/Register";

import "./styles/match-fabric.css";
function getRoleFromStorage() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    return u?.role || localStorage.getItem("role") || "";
  } catch {
    return localStorage.getItem("role") || "";
  }
}

function PrivateRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  const role = (user?.role || getRoleFromStorage() || "").toLowerCase();

  if (!role) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.map((r) => r.toLowerCase()).includes(role)) {
    if (role === "staff") return <Navigate to="/staff/neworder" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <PrivateRoute allowedRoles={["superadmin", "staff"]}>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />

        <Route
          path="products"
          element={
            <PrivateRoute allowedRoles={["superadmin"]}>
              <Products />
            </PrivateRoute>
          }
        />

        <Route
          path="Fabric"
          element={
            <PrivateRoute allowedRoles={["superadmin"]}>
              <Fabric />
            </PrivateRoute>
          }
        />

       <Route
          path="Fabric/detail/:id"
          element={
            <PrivateRoute allowedRoles={["superadmin"]}>
              <FabricDetail />
            </PrivateRoute>
          }
        />

         <Route
          path="Fabric/edit/:id"
          element={
            <PrivateRoute allowedRoles={["superadmin"]}>
              <EditFabric />
            </PrivateRoute>
          }
        />

        <Route
          path="Fabric/usage-record/:id"
          element={
            <PrivateRoute allowedRoles={["superadmin"]}>
              <RecordFabricUsage />
            </PrivateRoute>
          }
        />

        <Route
          path="Fabric/add"
          element={
            <PrivateRoute allowedRoles={["superadmin"]}>
              <AddFabric />
            </PrivateRoute>
          }
        />

         <Route
          path="Supplier"
          element={
            <PrivateRoute allowedRoles={["superadmin"]}>
              <Supplier />
            </PrivateRoute>
          }
        />

        <Route
          path="Supplier/add/"
          element={
            <PrivateRoute allowedRoles={["superadmin"]}>
              <AddSupplier />
            </PrivateRoute>
          }
        />

        <Route
          path="Supplier/edit/:id"
          element={
            <PrivateRoute allowedRoles={["superadmin"]}>
              <EditSupplier />
            </PrivateRoute>
          }
        />

         <Route
          path="Supplier/detail/:id"
          element={
            <PrivateRoute allowedRoles={["superadmin"]}>
              <SupplierDetail />
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
          path="orders/add"
          element={
            <PrivateRoute allowedRoles={["superadmin"]}>
              <AddOrders />
            </PrivateRoute>
          }
        />
        <Route
          path="orders/detail/:id"
          element={
            <PrivateRoute allowedRoles={["superadmin"]}>
              <OrderDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="orders/edit/:id"
          element={
            <PrivateRoute allowedRoles={["superadmin"]}>
              <EditOrders />
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
          path="outfit-formulas"
          element={
            <PrivateRoute allowedRoles={["superadmin"]}>
              <OutfitFormulas />
            </PrivateRoute>
          }
        />

        <Route
          path="set-price"
          element={
            <PrivateRoute allowedRoles={["superadmin"]}>
              <SetPrice />
            </PrivateRoute>
          }
        />

         <Route
          path="manageusers"
          element={
            <PrivateRoute allowedRoles={["superadmin"]}>
              <Manageusers />
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

        <Route
          path="staff/neworder"
          element={
            <PrivateRoute allowedRoles={["superadmin", "staff"]}>
              <StaffNewOrder />
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
         <Route
          path="staff/tailoringorders"
          element={
            <PrivateRoute allowedRoles={["superadmin", "staff"]}>
              <TailoringOrders />
            </PrivateRoute>
          }
        />
        <Route
          path="staff/tailoringcalendar"
          element={
            <PrivateRoute allowedRoles={["superadmin", "staff"]}>
              <TailoringCalendar />
            </PrivateRoute>
          }
        />
        <Route
          path="Order/add"
          element={
            <PrivateRoute allowedRoles={["superadmin", "staff"]}>
              <AddTailoringOrders />
            </PrivateRoute>
          }
        />
        <Route
          path="staff/order/:billId"
          element={
            <PrivateRoute allowedRoles={["superadmin", "staff"]}>
              <CustomerOrderDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="Order/detail/:id"
          element={
            <PrivateRoute allowedRoles={["superadmin", "staff"]}>
              <TailoringOrderDetail />
            </PrivateRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
