import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthProvider, { useAuth } from './components/auth/AuthProvider';
import { CartProvider } from './contexts/CartContext';
import "./App.css";

// Layouts and wrappers
import Header2 from "./components/Header2";
import Header from "./components/Header";
import SupportHeader from "./components/support/SupportHeader";
import Footer from "./components/Footer"; 
import SupportFooter from "./components/support/SupportFooter";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Pages (Customer)
import Home from "./pages/customer/Home";
import About from "./pages/customer/FooterComponents/About";
import Contact from "./pages/customer/FooterComponents/Contact";
import ProductList from "./pages/customer/ProductList";
import ProductDetails from "./pages/customer/ProductDetails";
import Cart from "./pages/customer/Cart";  
import CheckOut from "./pages/customer/CheckOut";
import Orders from "./pages/customer/Orders";
import CustomerComplaints from "./pages/customer/CustomerComplaints";
import CustomerComplaintChat from "./pages/customer/CustomerComplaintChat";
import NewArrivals from "./pages/customer/NewArrivals";
import FAQs from "./pages/customer/FooterComponents/FAQs";
import Shipping from "./pages/customer/FooterComponents/Shipping";
import FindUs from "./pages/customer/FooterComponents/FindUs";
import JoinOurTeam from "./pages/customer/FooterComponents/JoinOurTeam";
import Returns from "./pages/customer/FooterComponents/Returns";


// Pages (Admin)
import NewEmployee from "./pages/admin/NewEmployee";
import Employees from "./pages/admin/Employees";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ArchivedEmployees from "./pages/admin/ArchivedEmployees";
import EmployeeStatistics from "./pages/admin/EmployeeStatistics";


// Pages (Manager)
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManagerProductsView from "./pages/manager/ManagerProductsView";
import ManagerDiscountsView from "./pages/manager/ManagerDiscountsView";
import MangerOrdersViewAndManage from "./pages/manager/MangerOrdersViewAndManage";
// Pages (Support)
import SupportDashboard from "./pages/support/SupportDashboard";
import SupportProfile from "./pages/support/SupportProfile";
import ComplaintsList from "./pages/support/ComplaintsList";
import ComplaintDetails from "./pages/support/ComplaintDetails";
import SupportOrders from "./pages/support/SupportOrders";
import SupportOrderDetails from "./pages/support/SupportOrderDetails";
import Inquiries from "./pages/support/Inquiries";
import InquiryDetails from "./pages/support/InquiryDetails";

// Pages (Delivery)
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";
import ManagerReviewsView from "./pages/manager/ManagerReviewsView";

import { Outlet } from "react-router-dom";

// MainLayout component using Outlet for nested routes
const MainLayout = () => (
  <main className="main-content">
    <Outlet />
  </main>
);

// Dynamic headers and footers based on user role
const DynamicHeader = () => {
  const { currentUser } = useAuth();
  return currentUser?.role === 'support' ? <SupportHeader /> : <Header />;
};

const OptionalHeader2 = () => {
  const { currentUser } = useAuth();
  return !currentUser || currentUser?.role === 'customer' ? <Header2 /> : null;
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
         {/* <ScrollToTop />  Scroll to top on route change */}
          <DynamicHeader />
          <OptionalHeader2 />
          <Routes>
            {/* Shared Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/shop-products" element={<ProductList />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/product-details/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />/customer/complaints
            <Route path="/checkout" element={<CheckOut />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/newarrivals" element={<NewArrivals />} />
            <Route path="/FAQs" element={<FAQs />} />
            <Route path="/Shipping" element={<Shipping />} />
            <Route path="/FindUs" element={<FindUs />} />
            <Route path="/JoinOurTeam" element={<JoinOurTeam />} />
            <Route path="/Returns" element={<Returns />} />


              {/* Customer Protected routes */}
              <Route element={<ProtectedRoute allowedRoles={"customer"} />}>
                <Route element={<MainLayout />}>
                  <Route path="/customer/complaints" element={<CustomerComplaints />} />
                  <Route path="/customer/chat/:complaintId" element={<CustomerComplaintChat />} />
                </Route>
              </Route>

          {/* Admin Pages */}
          <Route element={<ProtectedRoute allowedRoles={"administrator"} />}>
            <Route path="/NewEmployee" element={<NewEmployee />} />
            <Route path="/Employees" element={<Employees />} />
            <Route path="/ArchivedEmployees" element={<ArchivedEmployees />} />   {/* NEW */}
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/EmployeeStatistics" element={<EmployeeStatistics />} />

          </Route>

          {/* Manager Pages */}
          <Route element={<ProtectedRoute allowedRoles={"manager"} />}>
            <Route path="/manager-dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/products" element={<ManagerProductsView />}/>          
            <Route path="/manager/discounts" element={<ManagerDiscountsView />}/>
            <Route path="/manager/reviews" element={<ManagerReviewsView />}/>
            <Route path="/manager/orders" element={<MangerOrdersViewAndManage /> }/>
          </Route>

              {/* Support Protected routes */}
              <Route element={<ProtectedRoute allowedRoles={"support"} />}>
                <Route element={<MainLayout />}>
                  <Route path="/support" element={<SupportDashboard />} />
                  <Route path="/support/profile/:id" element={<SupportProfile />} />
                  <Route path="/support/complaints" element={<ComplaintsList />} />
                  <Route path="/support/complaints/:id" element={<ComplaintDetails />} />
                  <Route path="/support/orders" element={<SupportOrders />} />
                  <Route path="/support/orders/:orderId" element={<SupportOrderDetails />} />
                  <Route path="/support/inquiries" element={<Inquiries />} />
                  <Route path="/support/inquiries/:id" element={<InquiryDetails />} />
                </Route>
              </Route>

              {/* Delivery Protected routes */}
              <Route element={<ProtectedRoute allowedRoles={"delivery"} />}>
                <Route element={<MainLayout />}>
                  <Route path="/delivery-dashboard" element={<DeliveryDashboard />} />
                </Route>
              </Route>
            </Routes>
            <DynamicFooter />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
