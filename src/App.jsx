import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import StaffLayout from "./staff/StaffLayout";
import DashboardStaff from "./staffpages/DashboardStaff";
import SearchProducts from "./staffpages/SearchProducts";
import NewOrder from "./staffpages/NewOrder";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/staff" element={<StaffLayout />}>
          <Route path="dashboard" element={<DashboardStaff />} />
          <Route path="search" element={<SearchProducts />} />
          <Route path="neworder" element={<NewOrder />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
