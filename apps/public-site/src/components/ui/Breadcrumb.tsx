export interface Crumb {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: Crumb[]
  className?: string
}

/**
 * Accessible breadcrumb. Links intermediate crumbs; marks the last item with
 * `aria-current="page"`. Fixes the previous markup that used `<a>` without href.
 */
export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="breadcrumb justify-content-center mb-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li
              key={index}
              className={`breadcrumb-item ${isLast ? 'active' : ''}`}
              aria-current={isLast ? 'page' : undefined}
            >
              {isLast || !item.href ? (
                <span className={isLast ? 'text-primary' : 'text-white'}>{item.label}</span>
              ) : (
                <a className="text-white" href={item.href}>
                  {item.label}
                </a>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
