import { useTranslation } from 'react-i18next'
import { pickLang } from '@/lib/format'
import type { ProductSpec } from '@/types/api'

interface ProductSpecsProps {
  specs: ProductSpec[]
}

export function ProductSpecs({ specs }: ProductSpecsProps) {
  const { i18n } = useTranslation()
  if (!specs.length) return null

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <tbody>
          {specs.map((spec, i) => (
            <tr
              key={spec.id}
              className={i % 2 === 0 ? 'bg-muted/40' : 'bg-background'}
            >
              <th
                scope="row"
                className="w-1/3 px-4 py-3 text-start font-medium text-muted-foreground"
              >
                {pickLang(spec.key, spec.key_ar, i18n.language)}
              </th>
              <td className="px-4 py-3 text-start font-medium">
                {pickLang(spec.value, spec.value_ar, i18n.language)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
