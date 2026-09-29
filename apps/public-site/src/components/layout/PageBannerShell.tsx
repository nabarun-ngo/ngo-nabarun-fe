import type { ReactNode } from 'react'
import PageBanner from '@/components/layout/PageBanner'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import type { Crumb } from '@/components/ui/Breadcrumb'

interface PageBannerShellProps {
  title: string
  /** Breadcrumb trail. The home crumb is prepended automatically. */
  trail: Array<{ label: string; href?: string; path: string }>
  homeLabel?: string
  children: ReactNode
}

/**
 * Inner-page banner shell: breadcrumb JSON-LD + page banner + main content.
 * Navbar and Footer are provided by the (site) layout.
 */
export default function PageBannerShell({
  title,
  trail,
  homeLabel = 'Home',
  children,
}: PageBannerShellProps) {
  const breadcrumb: Crumb[] = [
    { label: homeLabel, href: '/' },
    ...trail.map((t, idx) => ({
      label: t.label,
      href: idx === trail.length - 1 ? undefined : t.href,
    })),
  ]

  const jsonLdItems = [
    { name: homeLabel, path: '/' },
    ...trail.map((t) => ({ name: t.label, path: t.path })),
  ]

  return (
    <>
      <BreadcrumbJsonLd items={jsonLdItems} />
      <PageBanner title={title} breadcrumb={breadcrumb} />
      <main>{children}</main>
    </>
  )
}
