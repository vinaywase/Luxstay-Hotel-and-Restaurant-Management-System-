import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/DashboardLayout';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import StaffList from './pages/StaffList';
import BookingList from './pages/BookingList';
import OrderList from './pages/OrderList';
import PlaceOrder from './pages/PlaceOrder';
import ServiceRequests from './pages/ServiceRequests';
import StaffServiceRequests from './pages/StaffServiceRequests';
import AdminServiceRequests from './pages/AdminServiceRequests';
import ManageRooms from './pages/ManageRooms';
import ManageMenu from './pages/ManageMenu';
import ManageCustomers from './pages/ManageCustomers';
import ManageOrders from './pages/ManageOrders';
import ManageReservations from './pages/ManageReservations';
import ManageBilling from './pages/ManageBilling';
import CustomerBills from './pages/CustomerBills';
import MyEventBookings from './pages/MyEventBookings';
import AdminEventRequests from './pages/AdminEventRequests';
import EventPayment from './pages/EventPayment';
import EventBookingForm from './pages/website/EventBookingForm';
import AdminEventStaffAssign from './pages/AdminEventStaffAssign';
import StaffEventDashboard from './pages/StaffEventDashboard';
import AdminServicePackages from './pages/AdminServicePackages';
import AdminEventRefunds from './pages/AdminEventRefunds';
import CustomerEventDetails from './pages/CustomerEventDetails';


import CustomerFeedback from './pages/website/CustomerFeedback';
import AdminStaffFeedback from './pages/website/AdminStaffFeedback';

import WebsiteLayout from './components/WebsiteLayout';
import Home from './pages/website/Home';
import Rooms from './pages/website/Rooms';
import MenuPage from './pages/website/MenuPage';
import Booking from './pages/website/Booking';
import Services from './pages/website/Services';
import About from './pages/website/About';
import Contact from './pages/website/Contact';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<WebsiteLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/event-booking" element={<EventBookingForm />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<DashboardLayout allowedRoles={['CUSTOMER']} />}>
          <Route path="/customer" element={<CustomerDashboard />} />
          <Route path="/customer/bookings" element={<BookingList />} />
          <Route path="/customer/place-order" element={<PlaceOrder />} />
          <Route path="/customer/orders" element={<OrderList />} />
          <Route path="/customer/services" element={<ServiceRequests />} />
          <Route path="/customer/bills" element={<CustomerBills />} />
          <Route path="/customer/my-events" element={<MyEventBookings />} />
          <Route path="/customer/my-events/:id" element={<CustomerEventDetails />} />
          <Route path="/customer/event-payment/:bookingId" element={<EventPayment />} />
          {/* ✅ NEW: Guest feedback route */}
          <Route path="/customer/feedback" element={<CustomerFeedback />} />
        </Route>

        <Route element={<DashboardLayout allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/staff" element={<StaffList />} />
          <Route path="/admin/rooms" element={<ManageRooms />} />
          <Route path="/admin/menu" element={<ManageMenu />} />
          <Route path="/admin/customers" element={<ManageCustomers />} />
          <Route path="/admin/reservations" element={<ManageReservations />} />
          <Route path="/admin/billing" element={<ManageBilling />} />
          <Route path="/admin/orders" element={<ManageOrders />} />
          <Route path="/admin/services" element={<AdminServiceRequests />} />
          <Route path="/admin/events" element={<AdminEventRequests />} />
          <Route path="/admin/event-staff" element={<AdminEventStaffAssign />} />
          <Route path="/admin/service-packages" element={<AdminServicePackages />} />
          <Route path="/admin/refunds" element={<AdminEventRefunds />} />

          {/* ✅ NEW: Admin feedback route */}
          <Route path="/admin/feedback" element={<AdminStaffFeedback role="admin" />} />
        </Route>

        <Route element={<DashboardLayout allowedRoles={['STAFF']} />}>
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/staff/reservations" element={<ManageReservations />} />
          <Route path="/staff/rooms" element={<ManageRooms />} />
          <Route path="/staff/menu" element={<ManageMenu />} />
          <Route path="/staff/orders" element={<ManageOrders />} />
          <Route path="/staff/billing" element={<ManageBilling />} />
          <Route path="/staff/services" element={<StaffServiceRequests />} />
          <Route path="/staff/event-tasks" element={<StaffEventDashboard />} />

          {/* ✅ NEW: Staff feedback route */}
          <Route path="/staff/feedback" element={<AdminStaffFeedback role="staff" />} />
        </Route>

        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
