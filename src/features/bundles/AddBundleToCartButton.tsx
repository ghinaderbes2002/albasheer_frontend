import { useTranslation } from 'react-i18next'
import { Check, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart'
import type { Bundle } from '@/types/api'

interface AddBundleToCartButtonProps {
  bundle: Bundle
  quantity?: number
}

export function AddBundleToCartButton({
  bundle,
  quantity = 1,
}: AddBundleToCartButtonProps) {
  const { t } = useTranslation()
  const addBundle = useCartStore((s) => s.addBundle)

  const handleAdd = () => {
    addBundle(
      {
        bundle_id: bundle.id,
        name: bundle.name,
        name_ar: bundle.name_ar,
        price: bundle.price,
        image: bundle.image ?? bundle.products[0]?.main_image ?? null,
        products_count: bundle.products.length,
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
      disabled={!bundle.is_available}
    >
      <ShoppingCart />
      {bundle.is_available
        ? t('bundles.addToCart')
        : t('catalog.outOfStock')}
    </Button>
  )
}
