import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin, Phone, Sparkles } from 'lucide-react'

import { Logo } from '@/components/shared/Logo'
import { SOCIAL_LINKS } from '@/lib/social'

type IconProps = { className?: string }

function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25 1.25 1.25 0 0 1-1.25 1.25 1.25 1.25 0 0 1-1.25-1.25 1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
    </svg>
  )
}

function FacebookIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06c0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7A10 10 0 0 0 22 12.06c0-5.53-4.5-10.02-10-10.02z" />
    </svg>
  )
}

function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.06 2C6.58 2 2.13 6.45 2.13 11.93c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.91 9.91 0 0 0 4.74 1.21c5.48 0 9.93-4.45 9.93-9.93 0-2.65-1.03-5.14-2.92-7.01zm-7 15.27a8.27 8.27 0 0 1-4.21-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.26 8.26 0 1 1 6.99 3.86zm4.53-6.19c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.16 1.74 2.66 4.22 3.73.59.25 1.05.41 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.07-.1-.23-.16-.48-.28z" />
    </svg>
  )
}

export function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  const socials = [
    {
      key: 'instagram' as const,
      href: SOCIAL_LINKS.instagram,
      label: 'Instagram',
      Icon: InstagramIcon,
    },
    {
      key: 'facebook' as const,
      href: SOCIAL_LINKS.facebook,
      label: 'Facebook',
      Icon: FacebookIcon,
    },
    {
      key: 'whatsapp' as const,
      href: SOCIAL_LINKS.whatsapp,
      label: 'WhatsApp',
      Icon: WhatsAppIcon,
    },
  ].filter((s) => s.href.length > 0)

  return (
    <footer className="mt-auto border-t border-border bg-secondary text-secondary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-3">
        {/* Brand column */}
        <div className="space-y-4">
          <Logo tone="shimmer" />
          <p className="max-w-xs text-sm leading-relaxed opacity-75">
            {t('common.tagline')}
          </p>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary">
            <Sparkles className="size-3.5" />
            {t('footer.warranty')}
          </div>

          {socials.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">
                {t('footer.followUs')}
              </h4>
              <div className="flex items-center gap-2">
                {socials.map(({ key, href, label, Icon }) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="inline-flex size-9 items-center justify-center rounded-full border border-secondary-foreground/15 bg-secondary-foreground/5 text-secondary-foreground transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:shadow-primary/30"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
            {t('footer.quickLinks')}
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to="/"
                className="opacity-75 transition-opacity hover:opacity-100"
              >
                {t('nav.home')}
              </Link>
            </li>
            <li>
              <Link
                to="/products"
                className="opacity-75 transition-opacity hover:opacity-100"
              >
                {t('nav.products')}
              </Link>
            </li>
            <li>
              <Link
                to="/branches"
                className="opacity-75 transition-opacity hover:opacity-100"
              >
                {t('nav.branches')}
              </Link>
            </li>
          </ul>
        </div>

        {/* Visit us */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
            {t('footer.visit')}
          </h3>
          <p className="flex items-start gap-2 text-sm opacity-75">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{t('footer.visitText')}</span>
          </p>
          <Link
            to="/branches"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Phone className="size-4" />
            {t('footer.findBranch')}
          </Link>
        </div>
      </div>

      <div className="border-t border-secondary-foreground/10">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-4 text-center text-xs opacity-60">
          © {year} {t('common.tagline')} · {t('footer.rights')}
        </div>
      </div>
    </footer>
  )
}
