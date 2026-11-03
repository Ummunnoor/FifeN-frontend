import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/shared/components/AppLayout';
import { NotFoundPage } from '@/shared/components/NotFoundPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { MfaEnrollPage } from '@/features/auth/MfaEnrollPage';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { RequireRole } from '@/features/auth/RequireRole';
import { DiscoveryPage } from '@/features/discovery/DiscoveryPage';
import { ProductDetailPage } from '@/features/product/ProductDetailPage';
import { BecomeVendorPage } from '@/features/vendor/BecomeVendorPage';
import { VendorProfilePage } from '@/features/vendor/VendorProfilePage';
import { VendorShopPage } from '@/features/vendor/VendorShopPage';
import { MyListingsPage } from '@/features/listings/MyListingsPage';
import { ListingFormPage } from '@/features/listings/ListingFormPage';
import { LeadsPage } from '@/features/leads/LeadsPage';
import { NotificationsPage } from '@/features/notifications/NotificationsPage';
import { AdminLayout } from '@/features/admin/AdminLayout';
import { AdminDashboardPage } from '@/features/admin/AdminDashboardPage';
import { AdminVendorsPage } from '@/features/admin/AdminVendorsPage';
import { AdminListingsPage } from '@/features/admin/AdminListingsPage';
import { AdminReportsPage } from '@/features/admin/AdminReportsPage';
import { ChatPage } from '@/features/chat/ChatPage';
import { ChatInboxPage } from '@/features/chat/ChatInboxPage';

/** Application routes. Public, authenticated, vendor (RequireRole "vendor"), and admin areas. */
export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<AppLayout />}>
        {/* Public */}
        <Route index element={<DiscoveryPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="vendors/:id" element={<VendorShopPage />} />

        {/* Authenticated */}
        <Route
          path="vendor/apply"
          element={
            <RequireAuth>
              <BecomeVendorPage />
            </RequireAuth>
          }
        />
        <Route
          path="notifications"
          element={
            <RequireAuth>
              <NotificationsPage />
            </RequireAuth>
          }
        />
        <Route
          path="chat/:id"
          element={
            <RequireAuth>
              <ChatPage />
            </RequireAuth>
          }
        />
        <Route
          path="chat"
          element={
            <RequireAuth>
              <ChatInboxPage />
            </RequireAuth>
          }
        />

        {/* Vendor */}
        <Route
          path="vendor/profile"
          element={
            <RequireRole role="vendor">
              <VendorProfilePage />
            </RequireRole>
          }
        />
        <Route
          path="vendor/listings"
          element={
            <RequireRole role="vendor">
              <MyListingsPage />
            </RequireRole>
          }
        />
        <Route
          path="vendor/listings/new"
          element={
            <RequireRole role="vendor">
              <ListingFormPage />
            </RequireRole>
          }
        />
        <Route
          path="vendor/listings/:id/edit"
          element={
            <RequireRole role="vendor">
              <ListingFormPage />
            </RequireRole>
          }
        />
        <Route
          path="vendor/leads"
          element={
            <RequireRole role="vendor">
              <LeadsPage />
            </RequireRole>
          }
        />

        {/* Admin */}
        <Route
          path="admin/mfa"
          element={
            <RequireRole role="admin">
              <MfaEnrollPage />
            </RequireRole>
          }
        />
        <Route
          path="admin"
          element={
            <RequireRole role="admin">
              <AdminLayout />
            </RequireRole>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="vendors" element={<AdminVendorsPage />} />
          <Route path="listings" element={<AdminListingsPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
