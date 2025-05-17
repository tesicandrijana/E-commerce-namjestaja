import React from "react";
import HomePage from "./pages/home/HomePage";
import NewEmployee from "./components/admin/NewEmployee";
import Employees from "./components/admin/Employees";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import CustomerTest from "./pages/customer/CustomerTest";

import AdminDashboard from "./pages/admin/AdminDashboard"; // NOVO
import ManagerDashboard from "./pages/manager/ManagerDashboard"; // IZMJENA: Preimenovano sa Dashboard
import SupportDashboard from "./pages/support/SupportDashboard"; // IZMJENA: Preimenovano sa Dashboard
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard"; // IZMJENA: Preimenovano sa Dashboard

import ProductForm from "./components/manager/ProductForm";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<HomePage />} />
          <Route path="/about" element={<HomePage />} />
          <Route path="/NewEmployee" element={<NewEmployee />} />
          <Route path="/employees" element={<Employees />} />

          <Route element={<ProtectedRoute allowedRoles={"customer"} />}>
            <Route path="/customerTest" element={<CustomerTest />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={"admin"} />}>
            <Route path="/adminTest" element={<CustomerTest />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} /> {/* NOVO */}
          </Route>

          <Route element={<ProtectedRoute allowedRoles={"manager"} />}> {/* NOVO: Dodan ProtectedRoute za menadžera */}
            <Route path="/manager-dashboard" element={<ManagerDashboard />} /> {/* IZMJENA */}
            <Route path="/add-product" element={<ProductForm />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={"support"} />}> {/* NOVO: Dodan ProtectedRoute za menadžera */}
            <Route path="/support-dashboard" element={<SupportDashboard />} /> {/* IZMJENA */}
          </Route>

          <Route element={<ProtectedRoute allowedRoles={"delivery"} />}> {/* NOVO: Dodan ProtectedRoute za menadžera */}
            <Route path="/delivery-dashboard" element={<DeliveryDashboard />} /> {/* IZMJENA */}
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
