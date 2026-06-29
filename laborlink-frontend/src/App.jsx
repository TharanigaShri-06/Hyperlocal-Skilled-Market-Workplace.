import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CustomerDashboard from "./pages/CustomerDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import WorkerProfilePage from "./pages/WorkerProfilePage";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<HomePage />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/worker-profile" element={<WorkerProfilePage />} />

        <Route
          path="/customer"
          element={<CustomerDashboard />}
        />

        <Route
          path="/worker"
          element={<WorkerDashboard />}
        />

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;