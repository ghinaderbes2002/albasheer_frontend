import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getContentStats,
  cancelAdminOrder,
  setAdminOrderShippingFee,
  confirmAdminOrder,
  rejectAdminOrder,
  assignAdminDelivery,
  markAdminOrderReady,
  getAdminPaymentMethods,
  createAdminPaymentMethod,
  updateAdminPaymentMethod,
  deleteAdminPaymentMethod,
  createAdminAd,
  getAdminAd,
  getSiteSettings,
  updateSiteSettings,
  createAdminBranch,
  createAdminBundle,
  createAdminCategory,
  createAdminCity,
  createAdminProduct,
  createAdminUser,
  deleteAdminAd,
  deleteAdminBranch,
  deleteAdminBundle,
  deleteAdminCategory,
  deleteAdminCity,
  deleteAdminProduct,
  deleteAdminUser,
  deleteProductImage,
  updateAdminProductSpecs,
  getAdminAds,
  getAdminBranches,
  getAdminBundles,
  getAdminBundle,
  getAdminCategories,
  getAdminCities,
  getAdminOrder,
  getAdminOrders,
  getAdminProduct,
  getAdminProducts,
  getAdminStats,
  getAdminUsers,
  getSalesReport,
  getTopBranchesReport,
  getTopProductsReport,
  resetUserPassword,
  toggleAdActive,
  toggleBundleAvailability,
  addProductToBundle,
  removeProductFromBundle,
  toggleProductAvailability,
  updateAdminAd,
  updateAdminBranch,
  updateAdminBundle,
  updateAdminCategory,
  updateAdminCity,
  updateAdminProduct,
  updateAdminUser,
  uploadProductImages,
  getAdminVariantTypes,
  createAdminVariantType,
  updateAdminVariantType,
  deleteAdminVariantType,
  getAdminVariantOptions,
  createAdminVariantOption,
  updateAdminVariantOption,
  deleteAdminVariantOption,
  getProductVariants,
  addProductVariant,
  updateProductVariant,
  deleteProductVariant,
  uploadVariantImage,
  deleteVariantImage,
  getRelatedProducts,
  addRelatedProduct,
  removeRelatedProduct,
  getBrands,
  getAdminBrands,
  createBrand,
  updateAdminBrand,
  deleteAdminBrand,
} from '@/api/admin'
import type { AdminAd, CreateUserPayload, OrderStatus } from '@/types/api'
import { catalogKeys } from '@/features/catalog/queries'

export const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  ads: () => [...adminKeys.all, 'ads'] as const,
  ad: (id: number | string) => [...adminKeys.all, 'ad', id] as const,
  settings: () => [...adminKeys.all, 'settings'] as const,
  users: (params?: object) => [...adminKeys.all, 'users', params ?? {}] as const,
  user: (id: number | string) => [...adminKeys.all, 'user', id] as const,
  branches: () => [...adminKeys.all, 'branches'] as const,
  cities: () => [...adminKeys.all, 'cities'] as const,
  categories: () => [...adminKeys.all, 'categories'] as const,
  products: (params?: object) => [...adminKeys.all, 'products', params ?? {}] as const,
  product: (id: number | string) => [...adminKeys.all, 'product', id] as const,
  bundles: () => [...adminKeys.all, 'bundles'] as const,
  paymentMethods: () => [...adminKeys.all, 'paymentMethods'] as const,
  orders: (params?: object) => [...adminKeys.all, 'orders', params ?? {}] as const,
  order: (id: number | string) => [...adminKeys.all, 'order', id] as const,
  salesReport: (params?: object) => [...adminKeys.all, 'reports', 'sales', params ?? {}] as const,
  topProducts: (params?: object) => [...adminKeys.all, 'reports', 'top-products', params ?? {}] as const,
  topBranches: (params?: object) => [...adminKeys.all, 'reports', 'top-branches', params ?? {}] as const,
  variantTypes: () => [...adminKeys.all, 'variantTypes'] as const,
  variantOptions: (typeId: number | string) => [...adminKeys.all, 'variantOptions', typeId] as const,
  productVariants: (productId: number | string) => [...adminKeys.all, 'productVariants', productId] as const,
  relatedProducts: (productId: number | string) => [...adminKeys.all, 'relatedProducts', productId] as const,
  brands: () => [...adminKeys.all, 'brands'] as const,
}

export function useBrands() {
  return useQuery({ queryKey: adminKeys.brands(), queryFn: getBrands, staleTime: 1000 * 60 * 5 })
}

export function useAdminBrands() {
  return useQuery({ queryKey: adminKeys.brands(), queryFn: getAdminBrands })
}

export function useCreateBrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createBrand,
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.brands() }),
  })
}

export function useUpdateAdminBrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof updateAdminBrand>[1] }) =>
      updateAdminBrand(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.brands() }),
  })
}

export function useDeleteAdminBrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteAdminBrand,
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.brands() }),
  })
}

// ─── Stats ────────────────────────────────────────────────────────────
export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: getAdminStats,
    staleTime: 60 * 1000,
  })
}

// ─── Users ────────────────────────────────────────────────────────────
export function useAdminUsers(params?: { role?: string; search?: string }) {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => getAdminUsers(params),
    staleTime: 30 * 1000,
  })
}

export function useCreateAdminUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createAdminUser(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.users() }),
  })
}

export function useUpdateAdminUser(id: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<CreateUserPayload & { is_active: boolean }>) =>
      updateAdminUser(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.users() })
      qc.invalidateQueries({ queryKey: adminKeys.user(id) })
    },
  })
}

export function useDeleteAdminUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) => deleteAdminUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.users() }),
  })
}

export function useResetUserPassword(id: number | string) {
  return useMutation({
    mutationFn: (newPassword: string) => resetUserPassword(id, newPassword),
  })
}

// ─── Branches ─────────────────────────────────────────────────────────
export function useAdminBranches() {
  return useQuery({
    queryKey: adminKeys.branches(),
    queryFn: getAdminBranches,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateAdminBranch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createAdminBranch,
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.branches() }),
  })
}

export function useUpdateAdminBranch(id: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof updateAdminBranch>[1]) =>
      updateAdminBranch(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.branches() }),
  })
}

export function useDeleteAdminBranch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) => deleteAdminBranch(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.branches() }),
  })
}

// ─── Cities ───────────────────────────────────────────────────────────
export function useAdminCities() {
  return useQuery({
    queryKey: adminKeys.cities(),
    queryFn: getAdminCities,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateAdminCity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createAdminCity,
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.cities() }),
  })
}

export function useUpdateAdminCity(id: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof updateAdminCity>[1]) =>
      updateAdminCity(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.cities() }),
  })
}

export function useDeleteAdminCity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) => deleteAdminCity(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.cities() }),
  })
}

// ─── Categories ───────────────────────────────────────────────────────
export function useAdminCategories() {
  return useQuery({
    queryKey: adminKeys.categories(),
    queryFn: getAdminCategories,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateAdminCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: FormData) => createAdminCategory(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.categories() })
      qc.invalidateQueries({ queryKey: catalogKeys.categories() })
    },
  })
}

export function useUpdateAdminCategory(id: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof updateAdminCategory>[1]) =>
      updateAdminCategory(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.categories() })
      qc.invalidateQueries({ queryKey: catalogKeys.categories() })
    },
  })
}

export function useDeleteAdminCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) => deleteAdminCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.categories() })
      qc.invalidateQueries({ queryKey: catalogKeys.categories() })
    },
  })
}

// ─── Products ─────────────────────────────────────────────────────────
export function useAdminProducts(params?: {
  category?: number | string
  search?: string
  is_available?: boolean
}) {
  return useQuery({
    queryKey: adminKeys.products(params),
    queryFn: () => getAdminProducts(params),
    staleTime: 30 * 1000,
  })
}

export function useAdminProduct(id: number | string | undefined) {
  return useQuery({
    queryKey: adminKeys.product(id ?? ''),
    queryFn: () => getAdminProduct(id as string),
    enabled: !!id,
    staleTime: 30 * 1000,
  })
}

export function useCreateAdminProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: FormData) => createAdminProduct(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.products() })
      qc.invalidateQueries({ queryKey: catalogKeys.allProducts() })
    },
  })
}

export function useUpdateAdminProduct(id: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof updateAdminProduct>[1]) =>
      updateAdminProduct(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.products() })
      qc.invalidateQueries({ queryKey: adminKeys.product(id) })
      qc.invalidateQueries({ queryKey: catalogKeys.allProducts() })
      qc.invalidateQueries({ queryKey: catalogKeys.all })
    },
  })
}

export function useDeleteAdminProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) => deleteAdminProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.products() })
      qc.invalidateQueries({ queryKey: catalogKeys.allProducts() })
    },
  })
}

export function useToggleProductAvailability(id: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => toggleProductAvailability(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.products() })
      qc.invalidateQueries({ queryKey: adminKeys.product(id) })
      qc.invalidateQueries({ queryKey: catalogKeys.allProducts() })
      qc.invalidateQueries({ queryKey: catalogKeys.all })
    },
  })
}

export function useUploadProductImages(id: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => uploadProductImages(id, formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.product(id) })
      qc.invalidateQueries({ queryKey: catalogKeys.all })
    },
  })
}

export function useUpdateAdminProductSpecs(id: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (specs: Array<{ key: string; key_ar: string; value: string; value_ar: string }>) =>
      updateAdminProductSpecs(id, specs),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.product(id) }),
  })
}

export function useDeleteProductImage(productId: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (imageId: number | string) =>
      deleteProductImage(productId, imageId),
    onSettled: () =>
      qc.invalidateQueries({ queryKey: adminKeys.product(productId) }),
  })
}

// ─── Bundles ──────────────────────────────────────────────────────────
export function useAdminBundles() {
  return useQuery({
    queryKey: adminKeys.bundles(),
    queryFn: getAdminBundles,
    staleTime: 30 * 1000,
  })
}

export function useAdminBundle(id: number | string | undefined) {
  return useQuery({
    queryKey: ['admin', 'bundles', id],
    queryFn: () => getAdminBundle(id!),
    enabled: !!id,
  })
}

export function useCreateAdminBundle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: FormData) => createAdminBundle(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.bundles() }),
  })
}

export function useUpdateAdminBundle(id: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof updateAdminBundle>[1]) =>
      updateAdminBundle(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.bundles() }),
  })
}

export function useDeleteAdminBundle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) => deleteAdminBundle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.bundles() }),
  })
}

export function useToggleBundleAvailability(id: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => toggleBundleAvailability(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.bundles() }),
  })
}

export function useAddProductToBundle(bundleId: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (productId: number) => addProductToBundle(bundleId, productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.bundles() }),
  })
}

export function useRemoveProductFromBundle(bundleId: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (productId: number) => removeProductFromBundle(bundleId, productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.bundles() }),
  })
}

// ─── Orders ───────────────────────────────────────────────────────────
export function useAdminOrders(params?: {
  status?: OrderStatus
  branch?: number | string
  search?: string
  date_from?: string
  date_to?: string
}) {
  return useQuery({
    queryKey: adminKeys.orders(params),
    queryFn: () => getAdminOrders(params),
    staleTime: 15 * 1000,
    placeholderData: (prev) => prev,
  })
}

export function useAdminOrder(id: number | string | undefined) {
  return useQuery({
    queryKey: adminKeys.order(id ?? ''),
    queryFn: () => getAdminOrder(id as string),
    enabled: !!id,
    staleTime: 15 * 1000,
  })
}

export function useCancelAdminOrder(id: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (note?: string) => cancelAdminOrder(id, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.orders() })
      qc.invalidateQueries({ queryKey: adminKeys.order(id) })
    },
  })
}

export function useSetAdminOrderShippingFee(id: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (shippingFee: number) => setAdminOrderShippingFee(id, shippingFee),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.order(id) }),
  })
}

export function useConfirmAdminOrder(id: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => confirmAdminOrder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.orders() })
      qc.invalidateQueries({ queryKey: adminKeys.order(id) })
    },
  })
}

export function useRejectAdminOrder(id: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { note: string }) => rejectAdminOrder(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.orders() })
      qc.invalidateQueries({ queryKey: adminKeys.order(id) })
    },
  })
}

export function useAssignAdminDelivery(id: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { delivery_user_id: number }) => assignAdminDelivery(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.orders() })
      qc.invalidateQueries({ queryKey: adminKeys.order(id) })
    },
  })
}

export function useMarkAdminOrderReady(id: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => markAdminOrderReady(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.orders() })
      qc.invalidateQueries({ queryKey: adminKeys.order(id) })
    },
  })
}

export function useAdminDeliveryStaff() {
  return useQuery({
    queryKey: adminKeys.users({ role: 'delivery' }),
    queryFn: () => getAdminUsers({ role: 'delivery' }),
    staleTime: 60 * 1000,
  })
}

// ─── Ads ──────────────────────────────────────────────────────────────
export function useAdminAds() {
  return useQuery({
    queryKey: adminKeys.ads(),
    queryFn: getAdminAds,
    staleTime: 30 * 1000,
  })
}

export function useAdminAd(id: number | string | undefined) {
  return useQuery({
    queryKey: adminKeys.ad(id ?? ''),
    queryFn: () => getAdminAd(id as string),
    enabled: !!id,
    staleTime: 30 * 1000,
  })
}

export function useCreateAdminAd() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: FormData) => createAdminAd(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.ads() }),
  })
}

export function useUpdateAdminAd(id: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Omit<AdminAd, 'id' | 'file'>> | FormData) => updateAdminAd(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.ads() }),
  })
}

export function useDeleteAdminAd() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) => deleteAdminAd(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.ads() }),
  })
}

export function useToggleAdActive(id: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => toggleAdActive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.ads() }),
  })
}

// ─── Site Settings ────────────────────────────────────────────────────
export function useSiteSettings() {
  return useQuery({
    queryKey: adminKeys.settings(),
    queryFn: getSiteSettings,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateSiteSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof updateSiteSettings>[0]) => updateSiteSettings(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.settings() }),
  })
}

// ─── Payment Methods ──────────────────────────────────────────────────
export function useAdminPaymentMethods() {
  return useQuery({
    queryKey: adminKeys.paymentMethods(),
    queryFn: getAdminPaymentMethods,
    staleTime: 30 * 1000,
  })
}

export function useCreateAdminPaymentMethod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: FormData) => createAdminPaymentMethod(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.paymentMethods() }),
  })
}

export function useUpdateAdminPaymentMethod(id: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof updateAdminPaymentMethod>[1]) =>
      updateAdminPaymentMethod(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.paymentMethods() }),
  })
}

export function useDeleteAdminPaymentMethod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) => deleteAdminPaymentMethod(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.paymentMethods() }),
  })
}

// ─── Content Stats ────────────────────────────────────────────────────
export function useContentStats() {
  return useQuery({
    queryKey: [...adminKeys.all, 'content-stats'] as const,
    queryFn: getContentStats,
    staleTime: 60 * 1000,
  })
}

// ─── Variant Types ────────────────────────────────────────────────────
export function useAdminVariantTypes() {
  return useQuery({
    queryKey: adminKeys.variantTypes(),
    queryFn: getAdminVariantTypes,
    staleTime: 60 * 1000,
  })
}

export function useCreateAdminVariantType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { name: string; name_ar: string }) => createAdminVariantType(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.variantTypes() }),
  })
}

export function useUpdateAdminVariantType(id: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<{ name: string; name_ar: string }>) =>
      updateAdminVariantType(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.variantTypes() }),
  })
}

export function useDeleteAdminVariantType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) => deleteAdminVariantType(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.variantTypes() }),
  })
}

// ─── Variant Options ──────────────────────────────────────────────────
export function useAdminVariantOptions(typeId: number | string | undefined) {
  return useQuery({
    queryKey: adminKeys.variantOptions(typeId ?? ''),
    queryFn: () => getAdminVariantOptions(typeId as string),
    enabled: !!typeId,
    staleTime: 60 * 1000,
  })
}

export function useCreateAdminVariantOption(typeId: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { value: string; value_ar: string }) =>
      createAdminVariantOption(typeId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.variantOptions(typeId) }),
  })
}

export function useUpdateAdminVariantOption(typeId: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Partial<{ value: string; value_ar: string }> }) =>
      updateAdminVariantOption(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.variantOptions(typeId) }),
  })
}

export function useDeleteAdminVariantOption(typeId: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) => deleteAdminVariantOption(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.variantOptions(typeId) }),
  })
}

// ─── Product Variants ─────────────────────────────────────────────────
export function useProductVariants(productId: number | string | undefined) {
  return useQuery({
    queryKey: adminKeys.productVariants(productId ?? ''),
    queryFn: () => getProductVariants(productId as string),
    enabled: !!productId,
    staleTime: 30 * 1000,
  })
}

export function useAddProductVariant(productId: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { option_id: number; price: number | string; stock: number; is_available: boolean }) =>
      addProductVariant(productId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.productVariants(productId) }),
  })
}

export function useUpdateProductVariant(productId: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Partial<{ price: number | string; stock: number; is_available: boolean }> }) =>
      updateProductVariant(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.productVariants(productId) }),
  })
}

export function useDeleteProductVariant(productId: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (variantId: number | string) => deleteProductVariant(variantId),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.productVariants(productId) }),
  })
}

export function useUploadVariantImage(productId: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ variantId, formData }: { variantId: number | string; formData: FormData }) =>
      uploadVariantImage(variantId, formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.productVariants(productId) }),
  })
}

export function useDeleteVariantImage(productId: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (imageId: number | string) => deleteVariantImage(imageId),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.productVariants(productId) }),
  })
}

// ─── Related Products ─────────────────────────────────────────────────
export function useRelatedProducts(productId: number | string | undefined) {
  return useQuery({
    queryKey: adminKeys.relatedProducts(productId ?? ''),
    queryFn: () => getRelatedProducts(productId as string),
    enabled: !!productId,
    staleTime: 30 * 1000,
  })
}

export function useAddRelatedProduct(productId: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (relatedProductId: number) => addRelatedProduct(productId, relatedProductId),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.relatedProducts(productId) }),
  })
}

export function useRemoveRelatedProduct(productId: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (relatedId: number | string) => removeRelatedProduct(productId, relatedId),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.relatedProducts(productId) }),
  })
}

// ─── Reports ──────────────────────────────────────────────────────────
export function useSalesReport(params?: {
  date_from?: string
  date_to?: string
  branch?: number | string
}) {
  return useQuery({
    queryKey: adminKeys.salesReport(params),
    queryFn: () => getSalesReport(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useTopProductsReport(params?: {
  date_from?: string
  date_to?: string
  limit?: number
}) {
  return useQuery({
    queryKey: adminKeys.topProducts(params),
    queryFn: () => getTopProductsReport(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useTopBranchesReport(params?: {
  date_from?: string
  date_to?: string
}) {
  return useQuery({
    queryKey: adminKeys.topBranches(params),
    queryFn: () => getTopBranchesReport(params),
    staleTime: 5 * 60 * 1000,
  })
}
