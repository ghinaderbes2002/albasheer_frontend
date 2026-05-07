import { createBrowserRouter } from 'react-router-dom'

import { PublicLayout } from '@/layouts/PublicLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { RoleGuard } from '@/routes/RoleGuard'

import { HomePage } from '@/pages/public/HomePage'
import { ProductsPage } from '@/pages/public/ProductsPage'
import { ProductDetailPage } from '@/pages/public/ProductDetailPage'
import { BranchesPage } from '@/pages/public/BranchesPage'

import { LoginPage } from '@/pages/auth/LoginPage'
import { VerifyOtpPage } from '@/pages/auth/VerifyOtpPage'
import { CompleteProfilePage } from '@/pages/auth/CompleteProfilePage'

import { ProfilePage } from '@/pages/customer/ProfilePage'
import { CartPage } from '@/pages/customer/CartPage'
import { CheckoutPage } from '@/pages/customer/CheckoutPage'
import { MyOrdersPage } from '@/pages/customer/MyOrdersPage'
import { OrderDetailPage } from '@/pages/customer/OrderDetailPage'

import { BranchOrdersPage } from '@/pages/dashboard/BranchOrdersPage'
import { DeliveryOrdersPage } from '@/pages/dashboard/DeliveryOrdersPage'

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
      { path: 'branches', element: <BranchesPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'verify', element: <VerifyOtpPage /> },
      { path: '403', element: <ForbiddenPage /> },

      {
        element: <ProtectedRoute />,
        children: [
          { path: 'complete-profile', element: <CompleteProfilePage /> },
          { path: 'profile', element: <ProfilePage /> },

          {
            element: <RoleGuard allow={['customer']} />,
            children: [
              { path: 'checkout', element: <CheckoutPage /> },
              { path: 'orders', element: <MyOrdersPage /> },
              { path: 'orders/:id', element: <OrderDetailPage /> },
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
            ],
          },
          {
            element: <RoleGuard allow={['delivery']} />,
            children: [
              { path: 'dashboard/delivery', element: <DeliveryOrdersPage /> },
            ],
          },
        ],
      },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
])
