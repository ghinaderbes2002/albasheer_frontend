import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'

import { PublicLayout } from '@/layouts/PublicLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { RoleGuard } from '@/routes/RoleGuard'
import { Skeleton } from '@/components/ui/skeleton'

// — Critical public pages (eager)
import { HomePage } from '@/pages/public/HomePage'
import { ProductsPage } from '@/pages/public/ProductsPage'
import { ProductDetailPage } from '@/pages/public/ProductDetailPage'

// — Lazy public pages
const BundlesPage = lazy(() => import('@/pages/public/BundlesPage').then(m => ({ default: m.BundlesPage })))
const BundleDetailPage = lazy(() => import('@/pages/public/BundleDetailPage').then(m => ({ default: m.BundleDetailPage })))
const BranchesPage = lazy(() => import('@/pages/public/BranchesPage').then(m => ({ default: m.BranchesPage })))
const CategoriesPage = lazy(() => import('@/pages/public/CategoriesPage').then(m => ({ default: m.CategoriesPage })))

// — Auth pages (lazy)
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then(m => ({ default: m.LoginPage })))
const VerifyOtpPage = lazy(() => import('@/pages/auth/VerifyOtpPage').then(m => ({ default: m.VerifyOtpPage })))
const CompleteProfilePage = lazy(() => import('@/pages/auth/CompleteProfilePage').then(m => ({ default: m.CompleteProfilePage })))
const StaffLoginPage = lazy(() => import('@/pages/auth/StaffLoginPage').then(m => ({ default: m.StaffLoginPage })))

// — Customer pages (lazy)
const ProfilePage = lazy(() => import('@/pages/customer/ProfilePage').then(m => ({ default: m.ProfilePage })))
const FavoritesPage = lazy(() => import('@/pages/customer/FavoritesPage').then(m => ({ default: m.FavoritesPage })))
const AddressesPage = lazy(() => import('@/pages/customer/AddressesPage').then(m => ({ default: m.AddressesPage })))
const CartPage = lazy(() => import('@/pages/customer/CartPage').then(m => ({ default: m.CartPage })))
const CheckoutPage = lazy(() => import('@/pages/customer/CheckoutPage').then(m => ({ default: m.CheckoutPage })))
const MyOrdersPage = lazy(() => import('@/pages/customer/MyOrdersPage').then(m => ({ default: m.MyOrdersPage })))
const OrderDetailPage = lazy(() => import('@/pages/customer/OrderDetailPage').then(m => ({ default: m.OrderDetailPage })))
const OrderTrackingPage = lazy(() => import('@/pages/customer/OrderTrackingPage').then(m => ({ default: m.OrderTrackingPage })))

// — Branch dashboard (lazy)
const BranchOrdersPage = lazy(() => import('@/pages/dashboard/BranchOrdersPage').then(m => ({ default: m.BranchOrdersPage })))
const BranchOrderDetailPage = lazy(() => import('@/pages/dashboard/BranchOrderDetailPage').then(m => ({ default: m.BranchOrderDetailPage })))
const BranchPaymentMethodsPage = lazy(() => import('@/pages/dashboard/BranchPaymentMethodsPage').then(m => ({ default: m.BranchPaymentMethodsPage })))
const BranchDeliveryStaffPage = lazy(() => import('@/pages/dashboard/BranchDeliveryStaffPage').then(m => ({ default: m.BranchDeliveryStaffPage })))
const DeliveryOrdersPage = lazy(() => import('@/pages/dashboard/DeliveryOrdersPage').then(m => ({ default: m.DeliveryOrdersPage })))
const DeliveryOrderDetailPage = lazy(() => import('@/pages/dashboard/DeliveryOrderDetailPage').then(m => ({ default: m.DeliveryOrderDetailPage })))

// — Admin panel (lazy)
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })))
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })))
const AdminBranchesPage = lazy(() => import('@/pages/admin/AdminBranchesPage').then(m => ({ default: m.AdminBranchesPage })))
const AdminCitiesPage = lazy(() => import('@/pages/admin/AdminCitiesPage').then(m => ({ default: m.AdminCitiesPage })))
const AdminCategoriesPage = lazy(() => import('@/pages/admin/AdminCategoriesPage').then(m => ({ default: m.AdminCategoriesPage })))
const AdminCategoryDetailPage = lazy(() => import('@/pages/admin/AdminCategoryDetailPage').then(m => ({ default: m.AdminCategoryDetailPage })))
const AdminProductsPage = lazy(() => import('@/pages/admin/AdminProductsPage').then(m => ({ default: m.AdminProductsPage })))
const AdminProductDetailPage = lazy(() => import('@/pages/admin/AdminProductDetailPage').then(m => ({ default: m.AdminProductDetailPage })))
const AdminBundlesPage = lazy(() => import('@/pages/admin/AdminBundlesPage').then(m => ({ default: m.AdminBundlesPage })))
const AdminBundleDetailPage = lazy(() => import('@/pages/admin/AdminBundleDetailPage').then(m => ({ default: m.AdminBundleDetailPage })))
const AdminAdsPage = lazy(() => import('@/pages/admin/AdminAdsPage').then(m => ({ default: m.AdminAdsPage })))
const AdminAdDetailPage = lazy(() => import('@/pages/admin/AdminAdDetailPage').then(m => ({ default: m.AdminAdDetailPage })))
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage').then(m => ({ default: m.AdminOrdersPage })))
const AdminOrderDetailPage = lazy(() => import('@/pages/admin/AdminOrderDetailPage').then(m => ({ default: m.AdminOrderDetailPage })))
const AdminPaymentMethodsPage = lazy(() => import('@/pages/admin/AdminPaymentMethodsPage').then(m => ({ default: m.AdminPaymentMethodsPage })))
const AdminVariantTypesPage = lazy(() => import('@/pages/admin/AdminVariantTypesPage').then(m => ({ default: m.AdminVariantTypesPage })))
const AdminBrandsPage = lazy(() => import('@/pages/admin/AdminBrandsPage').then(m => ({ default: m.AdminBrandsPage })))
const AdminReportsPage = lazy(() => import('@/pages/admin/AdminReportsPage').then(m => ({ default: m.AdminReportsPage })))
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })))
const ContentDashboardPage = lazy(() => import('@/pages/content/ContentDashboardPage').then(m => ({ default: m.ContentDashboardPage })))

import { NotFoundPage } from '@/pages/NotFoundPage'
import { ForbiddenPage } from '@/pages/ForbiddenPage'
import { ContentManagerLayout } from '@/layouts/ContentManagerLayout'

function PageLoader() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-16 space-y-4">
      <Skeleton className="h-8 w-48 rounded-xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  )
}

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/:slug', element: <ProductDetailPage /> },
      { path: 'favorites', element: <S><FavoritesPage /></S> },
      { path: 'bundles', element: <S><BundlesPage /></S> },
      { path: 'bundles/:id', element: <S><BundleDetailPage /></S> },
      { path: 'categories', element: <S><CategoriesPage /></S> },
      { path: 'branches', element: <S><BranchesPage /></S> },
      { path: 'cart', element: <S><CartPage /></S> },
      { path: 'login', element: <S><LoginPage /></S> },
      { path: 'staff/login', element: <S><StaffLoginPage /></S> },
      { path: 'verify', element: <S><VerifyOtpPage /></S> },
      { path: '403', element: <ForbiddenPage /> },

      {
        element: <ProtectedRoute />,
        children: [
          { path: 'complete-profile', element: <S><CompleteProfilePage /></S> },
          { path: 'profile', element: <S><ProfilePage /></S> },
          { path: 'addresses', element: <S><AddressesPage /></S> },
          {
            element: <RoleGuard allow={['customer']} />,
            children: [
              { path: 'checkout', element: <S><CheckoutPage /></S> },
              { path: 'orders', element: <S><MyOrdersPage /></S> },
              { path: 'orders/:id', element: <S><OrderDetailPage /></S> },
              { path: 'orders/:id/tracking', element: <S><OrderTrackingPage /></S> },
            ],
          },
        ],
      },
    ],
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            element: <RoleGuard allow={['branch_manager']} />,
            children: [
              { path: 'dashboard/branch', element: <S><BranchOrdersPage /></S> },
              { path: 'dashboard/branch/orders/:id', element: <S><BranchOrderDetailPage /></S> },
              { path: 'dashboard/branch/payment-methods', element: <S><BranchPaymentMethodsPage /></S> },
              { path: 'dashboard/branch/delivery-staff', element: <S><BranchDeliveryStaffPage /></S> },
            ],
          },
          {
            element: <RoleGuard allow={['delivery']} />,
            children: [
              { path: 'dashboard/delivery', element: <S><DeliveryOrdersPage /></S> },
              { path: 'dashboard/delivery/orders/:id', element: <S><DeliveryOrderDetailPage /></S> },
            ],
          },
        ],
      },
    ],
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleGuard allow={['admin']} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: 'admin', element: <S><AdminDashboardPage /></S> },
              { path: 'admin/users', element: <S><AdminUsersPage /></S> },
              { path: 'admin/branches', element: <S><AdminBranchesPage /></S> },
              { path: 'admin/cities', element: <S><AdminCitiesPage /></S> },
              { path: 'admin/categories', element: <S><AdminCategoriesPage /></S> },
              { path: 'admin/categories/:id', element: <S><AdminCategoryDetailPage /></S> },
              { path: 'admin/products', element: <S><AdminProductsPage /></S> },
              { path: 'admin/products/:id', element: <S><AdminProductDetailPage /></S> },
              { path: 'admin/bundles', element: <S><AdminBundlesPage /></S> },
              { path: 'admin/bundles/:id', element: <S><AdminBundleDetailPage /></S> },
              { path: 'admin/ads', element: <S><AdminAdsPage /></S> },
              { path: 'admin/ads/:id', element: <S><AdminAdDetailPage /></S> },
              { path: 'admin/orders', element: <S><AdminOrdersPage /></S> },
              { path: 'admin/orders/:id', element: <S><AdminOrderDetailPage /></S> },
              { path: 'admin/payment-methods', element: <S><AdminPaymentMethodsPage /></S> },
              { path: 'admin/brands', element: <S><AdminBrandsPage /></S> },
              { path: 'admin/variant-types', element: <S><AdminVariantTypesPage /></S> },
              { path: 'admin/reports', element: <S><AdminReportsPage /></S> },
              { path: 'admin/settings', element: <S><AdminSettingsPage /></S> },
            ],
          },
        ],
      },
    ],
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleGuard allow={['content_manager']} />,
        children: [
          {
            element: <ContentManagerLayout />,
            children: [
              { path: 'content', element: <S><ContentDashboardPage /></S> },
              { path: 'content/categories', element: <S><AdminCategoriesPage /></S> },
              { path: 'content/products', element: <S><AdminProductsPage /></S> },
              { path: 'content/products/:id', element: <S><AdminProductDetailPage /></S> },
              { path: 'content/variant-types', element: <S><AdminVariantTypesPage /></S> },
              { path: 'content/bundles', element: <S><AdminBundlesPage /></S> },
              { path: 'content/ads', element: <S><AdminAdsPage /></S> },
              { path: 'content/ads/:id', element: <S><AdminAdDetailPage /></S> },
            ],
          },
        ],
      },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
])
