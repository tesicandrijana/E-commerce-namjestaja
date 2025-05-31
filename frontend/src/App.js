import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthProvider, { useAuth } from './components/auth/AuthProvider';
import { CartProvider } from './contexts/CartContext';

// Layouts and wrappers
import Header2 from "./components/Header2";
import Header from "./components/Header";
import SupportHeader from "./components/support/SupportHeader";
import Footer from "./components/Footer";
import SupportFooter from "./components/support/SupportFooter";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ScrollToTop from './components/ScrollToTop'; // Dodan ScrollToTop

// Pages (Customer)
import Home from "./pages/customer/Home";
import About from "./pages/customer/About";
import Contact from "./pages/customer/Contact";
import ProductList from "./pages/customer/ProductList";
import ProductDetails from "./pages/customer/ProductDetails";
import NewArrivals from "./pages/customer/NewArrivals";
import FAQs from "./pages/customer/FAQs";
import Shipping from "./pages/customer/Shipping";
import FindUs from "./pages/customer/FindUs";
import JoinOurTeam from "./pages/customer/JoinOurTeam";
import Cart from "./pages/customer/Cart";


// Pages (Admin)
import NewEmployee from "./pages/admin/NewEmployee";
import Employees from "./pages/admin/Employees";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ArchivedEmployees from "./pages/admin/ArchivedEmployees";
import EmployeeStatistics from "./pages/admin/EmployeeStatistics";

// Pages (Manager)
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ProductForm from "./components/product/ProductForm";

// Pages (Support)
import SupportDashboard from "./pages/support/SupportDashboard";
import ComplaintsList from "./pages/support/ComplaintsList";
import ComplaintDetails from "./pages/support/ComplaintDetails";

// Pages (Delivery)
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";

// Dinamički header/footer po ulozi korisnika
const DynamicHeader = () => {
  const { currentUser } = useAuth();
  return currentUser?.role === 'support' ? <SupportHeader /> : <Header />;
};
const OptionalHeader2 = () => {
  const { currentUser } = useAuth();
  return currentUser?.role !== 'support' ? <Header2 /> : null;
};
const DynamicFooter = () => {
  const { currentUser } = useAuth();
  return currentUser?.role === 'support' ? <SupportFooter /> : <Footer />;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop /> {/* Scroll to top on route change */}
          <DynamicHeader />
          <OptionalHeader2 />
          <Routes>
            {/* Shared Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<ProductList />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/newarrivals" element={<NewArrivals />} />
            <Route path="/FAQs" element={<FAQs />} />
            <Route path="/Shipping" element={<Shipping />} />
            <Route path="/FindUs" element={<FindUs />} />
            <Route path="/JoinOurTeam" element={<JoinOurTeam />} />




            {/* Customer Pages */}
            <Route element={<ProtectedRoute allowedRoles={"customer"} />} />

            {/* Admin Pages */}
            <Route element={<ProtectedRoute allowedRoles={"admin"} />}>
              <Route path="/NewEmployee" element={<NewEmployee />} />
              <Route path="/Employees" element={<Employees />} />
              <Route path="/ArchivedEmployees" element={<ArchivedEmployees />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/EmployeeStatistics" element={<EmployeeStatistics />} />
            </Route>

            {/* Manager Pages */}
            <Route element={<ProtectedRoute allowedRoles={"manager"} />}>
              <Route path="/manager-dashboard" element={<ManagerDashboard />} />
              <Route path="/products/:id/edit" element={<ProductForm mode="edit" />} />
              <Route path="/products/create" element={<ProductForm mode="create" />} />
            </Route>

            {/* Support Pages */}
            <Route path="/support-dashboard" element={<SupportDashboard />} />
            <Route path="/support/complaints" element={<ComplaintsList />} />
            <Route path="/support/complaints/:id" element={<ComplaintDetails />} />

            {/* Delivery Pages */}
            <Route element={<ProtectedRoute allowedRoles={"delivery"} />}>
            <Route path="/delivery-dashboard" element={<DeliveryDashboard />} />
            </Route>

          </Routes>

          <DynamicFooter />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
