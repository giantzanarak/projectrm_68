import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

// Pages
import Dashboard from "./superadmin/Dashboard";
import Products from "./superadmin/Products";
import Orders from "./superadmin/Orders";
import Employees from "./pages/Employees";
import Settings from "./pages/Settings";
import Promotions from "./superadmin/Promotions";
import FabricCalculator from "./superadmin/FabricCalculator";
import CheckOrders from "./superadmin/CheckOrders";
import Logs from "./superadmin/Logs";
import NewOrder from "./superadmin/NewOrder";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/fabriccalc" element={<FabricCalculator />} />
          <Route path="/salesrecord" element={<NewOrder />} />
          <Route path="/checkorders" element={<CheckOrders />} />
          <Route path="/logs" element={<Logs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;