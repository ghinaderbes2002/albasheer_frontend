import { useParams } from 'react-router-dom'
import { PagePlaceholder } from '@/components/shared/PagePlaceholder'

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  return <PagePlaceholder title={slug ?? 'Product'} />
}
