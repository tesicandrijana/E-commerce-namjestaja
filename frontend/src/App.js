import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";

// Layouts and wrappers
import Header from "./components/Header";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Pages (Customer)
import Home from "./pages/customer/Home";
import About from "./pages/customer/About";
import Contact from "./pages/customer/Contact";
import ProductList from "./pages/customer/ProductList";
import ProductDetails from "./pages/customer/ProductDetails";
import CustomerTest from "./pages/customer/CustomerTest";

// Pages (Admin)
import NewEmployee from "./components/admin/NewEmployee"; // ✅ UPDATED
import Employees from "./components/admin/Employees";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Pages (Manager)
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ProductForm from "./components/product/ProductForm";

// Pages (Support & Delivery)
import SupportDashboard from "./pages/support/SupportDashboard";
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";

function App() {
  return (
    <CartProvider>
      <Router>
        <Header />
        <Routes>
          {/* Shared Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<ProductList />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetails />} />

          {/* Customer Pages */}
          <Route element={<ProtectedRoute allowedRoles={"customer"} />}>
            <Route path="/customerTest" element={<CustomerTest />} />
          </Route>

          {/* Admin Pages */}
          <Route element={<ProtectedRoute allowedRoles={"administrator"} />}>
            <Route path="/adminTest" element={<CustomerTest />} />
            <Route path="/new-employee" element={<NewEmployee />} /> {/* ✅ UPDATED */}
            <Route path="/employees" element={<Employees />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Manager Pages */}
          <Route element={<ProtectedRoute allowedRoles={"manager"} />}>
            <Route path="/manager-dashboard" element={<ManagerDashboard />} />
            <Route path="/products/:id/edit" element={<ProductForm mode="edit" />} />
            <Route path="/products/create" element={<ProductForm mode="create" />} />
          </Route>

          {/* Support Pages */}
          <Route element={<ProtectedRoute allowedRoles={"support"} />}>
            <Route path="/support-dashboard" element={<SupportDashboard />} />
          </Route>

          {/* Delivery Pages */}
          <Route element={<ProtectedRoute allowedRoles={"delivery"} />}>
            <Route path="/delivery-dashboard" element={<DeliveryDashboard />} />
          </Route>
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
