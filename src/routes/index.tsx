import { createBrowserRouter } from 'react-router-dom'

import { PublicLayout } from '@/layouts/PublicLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { RoleGuard } from '@/routes/RoleGuard'

import { HomePage } from '@/pages/public/HomePage'
import { ProductsPage } from '@/pages/public/ProductsPage'
import { ProductDetailPage } from '@/pages/public/ProductDetailPage'
import { BundlesPage } from '@/pages/public/BundlesPage'
import { BundleDetailPage } from '@/pages/public/BundleDetailPage'
import { BranchesPage } from '@/pages/public/BranchesPage'
import { CategoriesPage } from '@/pages/public/CategoriesPage'

import { LoginPage } from '@/pages/auth/LoginPage'
import { VerifyOtpPage } from '@/pages/auth/VerifyOtpPage'
import { CompleteProfilePage } from '@/pages/auth/CompleteProfilePage'
import { StaffLoginPage } from '@/pages/auth/StaffLoginPage'

import { ProfilePage } from '@/pages/customer/ProfilePage'
import { AddressesPage } from '@/pages/customer/AddressesPage'
import { CartPage } from '@/pages/customer/CartPage'
import { CheckoutPage } from '@/pages/customer/CheckoutPage'
import { MyOrdersPage } from '@/pages/customer/MyOrdersPage'
import { OrderDetailPage } from '@/pages/customer/OrderDetailPage'
import { OrderTrackingPage } from '@/pages/customer/OrderTrackingPage'

import { BranchOrdersPage } from '@/pages/dashboard/BranchOrdersPage'
import { BranchOrderDetailPage } from '@/pages/dashboard/BranchOrderDetailPage'
import { BranchPaymentMethodsPage } from '@/pages/dashboard/BranchPaymentMethodsPage'
import { BranchDeliveryStaffPage } from '@/pages/dashboard/BranchDeliveryStaffPage'
import { DeliveryOrdersPage } from '@/pages/dashboard/DeliveryOrdersPage'
import { DeliveryOrderDetailPage } from '@/pages/dashboard/DeliveryOrderDetailPage'

import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminBranchesPage } from '@/pages/admin/AdminBranchesPage'
import { AdminCitiesPage } from '@/pages/admin/AdminCitiesPage'
import { AdminCategoriesPage } from '@/pages/admin/AdminCategoriesPage'
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage'
import { AdminProductDetailPage } from '@/pages/admin/AdminProductDetailPage'
import { AdminBundlesPage } from '@/pages/admin/AdminBundlesPage'
import { AdminAdsPage } from '@/pages/admin/AdminAdsPage'
import { AdminAdDetailPage } from '@/pages/admin/AdminAdDetailPage'
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage'
import { AdminOrderDetailPage } from '@/pages/admin/AdminOrderDetailPage'
import { AdminPaymentMethodsPage } from '@/pages/admin/AdminPaymentMethodsPage'
import { AdminVariantTypesPage } from '@/pages/admin/AdminVariantTypesPage'
import { AdminReportsPage } from '@/pages/admin/AdminReportsPage'
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage'

import { ContentManagerLayout } from '@/layouts/ContentManagerLayout'
import { ContentDashboardPage } from '@/pages/content/ContentDashboardPage'

import { NotFoundPage } from '@/pages/NotFoundPage'
import { ForbiddenPage } from '@/pages/ForbiddenPage'

export const router = createBrowserRouter([
  // Public + customer-facing tree
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/:slug', element: <ProductDetailPage /> },
      { path: 'bundles', element: <BundlesPage /> },
      { path: 'bundles/:id', element: <BundleDetailPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'branches', element: <BranchesPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'staff/login', element: <StaffLoginPage /> },
      { path: 'verify', element: <VerifyOtpPage /> },
      { path: '403', element: <ForbiddenPage /> },

      {
        element: <ProtectedRoute />,
        children: [
          { path: 'complete-profile', element: <CompleteProfilePage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'addresses', element: <AddressesPage /> },

          {
            element: <RoleGuard allow={['customer']} />,
            children: [
              { path: 'checkout', element: <CheckoutPage /> },
              { path: 'orders', element: <MyOrdersPage /> },
              { path: 'orders/:id', element: <OrderDetailPage /> },
              { path: 'orders/:id/tracking', element: <OrderTrackingPage /> },
            ],
          },
        ],
      },
    ],
  },

  // Staff dashboards (branch_manager, delivery)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            element: <RoleGuard allow={['branch_manager']} />,
            children: [
              { path: 'dashboard/branch', element: <BranchOrdersPage /> },
              { path: 'dashboard/branch/orders/:id', element: <BranchOrderDetailPage /> },
              { path: 'dashboard/branch/payment-methods', element: <BranchPaymentMethodsPage /> },
              { path: 'dashboard/branch/delivery-staff', element: <BranchDeliveryStaffPage /> },
            ],
          },
          {
            element: <RoleGuard allow={['delivery']} />,
            children: [
              { path: 'dashboard/delivery', element: <DeliveryOrdersPage /> },
              {
                path: 'dashboard/delivery/orders/:id',
                element: <DeliveryOrderDetailPage />,
              },
            ],
          },
        ],
      },
    ],
  },

  // Admin panel
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleGuard allow={['admin']} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: 'admin', element: <AdminDashboardPage /> },
              { path: 'admin/users', element: <AdminUsersPage /> },
              { path: 'admin/branches', element: <AdminBranchesPage /> },
              { path: 'admin/cities', element: <AdminCitiesPage /> },
              { path: 'admin/categories', element: <AdminCategoriesPage /> },
              { path: 'admin/products', element: <AdminProductsPage /> },
              { path: 'admin/products/:id', element: <AdminProductDetailPage /> },
              { path: 'admin/bundles', element: <AdminBundlesPage /> },
              { path: 'admin/ads', element: <AdminAdsPage /> },
              { path: 'admin/ads/:id', element: <AdminAdDetailPage /> },
              { path: 'admin/orders', element: <AdminOrdersPage /> },
              { path: 'admin/orders/:id', element: <AdminOrderDetailPage /> },
              { path: 'admin/payment-methods', element: <AdminPaymentMethodsPage /> },
              { path: 'admin/variant-types', element: <AdminVariantTypesPage /> },
              { path: 'admin/reports', element: <AdminReportsPage /> },
              { path: 'admin/settings', element: <AdminSettingsPage /> },
            ],
          },
        ],
      },
    ],
  },

  // Content manager panel
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleGuard allow={['content_manager']} />,
        children: [
          {
            element: <ContentManagerLayout />,
            children: [
              { path: 'content', element: <ContentDashboardPage /> },
              { path: 'content/categories', element: <AdminCategoriesPage /> },
              { path: 'content/products', element: <AdminProductsPage /> },
              { path: 'content/products/:id', element: <AdminProductDetailPage /> },
              { path: 'content/variant-types', element: <AdminVariantTypesPage /> },
              { path: 'content/bundles', element: <AdminBundlesPage /> },
              { path: 'content/ads', element: <AdminAdsPage /> },
              { path: 'content/ads/:id', element: <AdminAdDetailPage /> },
            ],
          },
        ],
      },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
])
