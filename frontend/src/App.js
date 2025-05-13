import React from "react";
import HomePage from "./pages/home/HomePage";
import EmployeeForm from "./components/admin/EmployeeForm";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import CustomerTest from "./pages/customer/CustomerTest";
import Dashboard from "./pages/manager/Dashboard";
import ProductForm from "./components/product/ProductForm";
import ProductDetail from "./components/product/ProductDetail";
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

          <Route path="/manager-dashboard" element={<Dashboard />} />
          <Route path="/products/:id/edit" element={<ProductForm mode="edit"/>}/>
          <Route path="/products/create" element={<ProductForm mode="create"/>} />
    
          <Route path="/products/:id" element={<ProductDetail />} />
        </Route>
      </Routes>

    </BrowserRouter>
  );
}

export default App;
