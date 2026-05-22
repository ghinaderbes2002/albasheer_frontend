import { useTranslation } from 'react-i18next'
import { Check, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart'
import type { ProductDetail, PublicProductVariant } from '@/types/api'

interface AddToCartButtonProps {
  product: ProductDetail
  variant?: PublicProductVariant | null
  quantity?: number
}

export function AddToCartButton({
  product,
  variant = null,
  quantity = 1,
}: AddToCartButtonProps) {
  const { t } = useTranslation()
  const addItem = useCartStore((s) => s.addItem)

  const effectivePrice = variant?.effective_price ?? product.price
  const isAvailable = variant ? variant.is_available : product.is_available

  const handleAdd = () => {
    const variantMainImage =
      variant?.images?.find((img) => img.is_main)?.image ??
      variant?.images?.[0]?.image ??
      null

    const productMainImage =
      product.images?.find((img) => img.is_main)?.image ??
      product.images?.[0]?.image ??
      product.main_image ??
      null

    addItem(
      {
        product_id: product.id,
        variant_id: variant?.id ?? null,
        slug: product.slug,
        name: product.name,
        name_ar: product.name_ar,
        price: effectivePrice,
        image: variantMainImage ?? productMainImage,
        variant_label: variant ? `${variant.type}: ${variant.option_value}` : null,
      },
      quantity,
    )
    toast.success(t('catalog.addedToCart'), {
      icon: <Check className="size-4 text-primary" />,
    })
  }

  return (
    <Button
      type="button"
      size="lg"
      onClick={handleAdd}
      disabled={!isAvailable}
    >
      <ShoppingCart />
      {isAvailable
        ? t('catalog.addToCart')
        : t('catalog.outOfStock')}
    </Button>
  )
}
