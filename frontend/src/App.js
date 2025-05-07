import React from "react";
import HomePage from "./pages/home/HomePage";
import EmployeeForm from "./components/admin/EmployeeForm";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import CustomerTest from "./pages/customer/CustomerTest";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<HomePage />} />
          <Route path="/about" element={<HomePage />} />
          <Route path="/employeeForm" element={<EmployeeForm />} />

          <Route element={<ProtectedRoute allowedRoles={"customer"} />}>
            <Route path="/customerTest" element={<CustomerTest />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={"administrator"} />}>
            <Route path="/adminTest" element={<CustomerTest />} />
          </Route>
        </Route>
      </Routes>

    </BrowserRouter>
  );
}

export default App;
