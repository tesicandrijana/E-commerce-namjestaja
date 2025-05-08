import React from "react";
import HomePage from "./pages/home/HomePage";
import EmployeeForm from "./components/admin/EmployeeForm";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import CustomerTest from "./pages/customer/CustomerTest";
import Dashboard from "./pages/manager/Dashboard";
import ProductForm from "./components/manager/ProductForm";
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
            <Route path="/manager-dashboard" element={<Dashboard />} />
            <Route path="/add-product" element={<ProductForm/>}/>
        </Route>
      </Routes>

    </BrowserRouter>
  );
}

export default App;
