import Breadcrumb, { type Crumb } from '@/components/ui/Breadcrumb'

interface PageBannerProps {
  title: string
  breadcrumb?: Crumb[]
}

/**
 * Inner-page hero banner. Renders the single page `<h1>` inside a semantic
 * `<header>` plus an accessible breadcrumb.
 */
export default function PageBanner({ title, breadcrumb }: PageBannerProps) {
  return (
    <header className="container-fluid page-header mb-5">
      <div className="container text-center">
        <h1 className="display-4 text-white mb-4">{title}</h1>
        {breadcrumb && breadcrumb.length > 0 && <Breadcrumb items={breadcrumb} />}
      </div>
    </header>
  )
}
