import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function HomePage() {
  const { t, i18n } = useTranslation()
  const Arrow = i18n.language.startsWith('ar') ? ArrowLeft : ArrowRight

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-secondary via-secondary to-background" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.18),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(212,175,55,0.12),transparent_50%)]" />

      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-24 text-center md:py-32">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-primary text-3xl font-extrabold ring-4 ring-primary/30">
          B
        </div>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight text-secondary-foreground md:text-6xl">
          {t('home.hero.title')}
        </h1>
        <p className="max-w-2xl text-base text-secondary-foreground/80 md:text-lg">
          {t('home.hero.subtitle')}
        </p>
        <Button asChild size="lg" className="mt-2">
          <Link to="/products">
            {t('home.hero.cta')}
            <Arrow />
          </Link>
        </Button>
      </div>
    </section>
  )
}
