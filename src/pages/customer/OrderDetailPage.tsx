import { useParams } from 'react-router-dom'
import { PagePlaceholder } from '@/components/shared/PagePlaceholder'

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  return <PagePlaceholder title={`Order #${id ?? '?'}`} />
}
