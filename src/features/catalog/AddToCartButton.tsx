import { useTranslation } from 'react-i18next'
import { Check, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart'
import type { ProductDetail } from '@/types/api'

interface AddToCartButtonProps {
  product: ProductDetail
  quantity?: number
}

export function AddToCartButton({
  product,
  quantity = 1,
}: AddToCartButtonProps) {
  const { t } = useTranslation()
  const addItem = useCartStore((s) => s.addItem)

  const handleAdd = () => {
    addItem(
      {
        product_id: product.id,
        slug: product.slug,
        name: product.name,
        name_ar: product.name_ar,
        price: product.price,
        image: product.main_image,
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
      disabled={!product.is_available}
    >
      <ShoppingCart />
      {product.is_available
        ? t('catalog.addToCart')
        : t('catalog.outOfStock')}
    </Button>
  )
}
