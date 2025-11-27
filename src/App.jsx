import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import StaffLayout from "./staff/StaffLayout";
import DashboardStaff from "./staffpages/DashboardStaff";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/staff" element={<StaffLayout />}>
          <Route path="dashboard" element={<DashboardStaff />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
