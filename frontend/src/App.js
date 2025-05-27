import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthProvider from './components/auth/AuthProvider';
import { CartProvider } from './contexts/CartContext';

// Layouts and wrappers
import Header2 from "./components/Header2";
import Header from "./components/Header";
import Footer from "./components/Footer"; // ✅ Added Footer
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Pages (Customer)
import Home from "./pages/customer/Home";
import About from "./pages/customer/About";
import Contact from "./pages/customer/Contact";
import ProductList from "./pages/customer/ProductList";
import ProductDetails from "./pages/customer/ProductDetails";
import Cart from "./pages/customer/Cart";  

// Pages (Admin)
import NewEmployee from "./components/admin/NewEmployee";
import Employees from "./pages/admin/Employees";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ArchivedEmployees from "./pages/admin/ArchivedEmployees";

// Pages (Manager)
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ProductForm from "./components/product/ProductForm";

// Pages (Support)
import SupportDashboard from "./pages/support/SupportDashboard";
import ComplaintsList from "./pages/support/ComplaintsList";
import ComplaintDetails from "./pages/support/ComplaintDetails"


// Pages (Delivery)
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";

function App() {
  return (
  <AuthProvider>
      <CartProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Header />
        <Header2 />
        <Routes>
          {/* Shared Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<ProductList />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />  

          {/* Customer Pages */}
          <Route element={<ProtectedRoute allowedRoles={"customer"} />}>
          </Route>

          {/* Admin Pages */}
          <Route element={<ProtectedRoute allowedRoles={"admin"} />}>
            <Route path="/NewEmployee" element={<NewEmployee />} />
            <Route path="/Employees" element={<Employees />} />
            <Route path="/ArchivedEmployees" element={<ArchivedEmployees />} />   
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Manager Pages */}
          <Route element={<ProtectedRoute allowedRoles={"manager"} />}>
            <Route path="/manager-dashboard" element={<ManagerDashboard />} />
            <Route path="/products/:id/edit" element={<ProductForm mode="edit" />} />
            <Route path="/products/create" element={<ProductForm mode="create" />} />
          </Route>

        {/* Support Pages */}
        {/* Todo - vrati protected route */}
        <Route path="/support-dashboard" element={<SupportDashboard />} />
        <Route path="/support/complaints" element={<ComplaintsList />} />
        <Route path="/support/complaints/:id" element={<ComplaintDetails />} />

          {/* Delivery Pages */}
          <Route element={<ProtectedRoute allowedRoles={"delivery"} />}>
            <Route path="/delivery-dashboard" element={<DeliveryDashboard />} />
          </Route>
        </Routes>

        <Footer /> {/* ✅ Always at the bottom */}
      </Router>
    </CartProvider>
    </AuthProvider>
  );
}

export default App;
