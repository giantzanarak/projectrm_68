import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

// Pages
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Employees from "./pages/Employees";
import Settings from "./pages/Settings";
import Promotions from "./pages/Promotions";
import FabricCalculator from "./pages/FabricCalculator";
import CheckOrders from "./pages/CheckOrders";
import Logs from "./pages/Logs";
import NewOrder from "./pages/NewOrder";

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