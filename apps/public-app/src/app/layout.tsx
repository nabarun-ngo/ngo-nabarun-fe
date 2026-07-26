import { Inter, Saira } from 'next/font/google'
import '@fortawesome/fontawesome-free/css/all.min.css'
import 'bootstrap-icons/font/bootstrap-icons.min.css'
import '@nabarun-ngo/forms-react/bootstrap.css'
import '@/app/globals.css'
import OrganizationJsonLd from '@/components/seo/OrganizationJsonLd'
import WebSiteJsonLd from '@/components/seo/WebSiteJsonLd'
import GoogleAnalytics from '@/components/seo/GoogleAnalytics'
import BackToTopShell from '@/components/layout/BackToTopShell'
import { fetchStaticContent } from '@/lib/config/content'
import { getRootLayoutMetadata } from '@/lib/site'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

const saira = Saira({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-saira',
  display: 'swap',
})

export async function generateMetadata() {
  return {
    ...getRootLayoutMetadata(),
    manifest: '/site.webmanifest',
    icons: {
      icon: '/favicon.ico',
      apple: '/img/logo.png',
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const content = await fetchStaticContent()
  const site = content.metadata.site

  return (
    <html lang="en" className={`scroll-smooth ${inter.variable} ${saira.variable}`}>
      <head>
        <link href="/css/bootstrap.min.css" rel="stylesheet" />
        <link href="/css/style.css" rel="stylesheet" />
      </head>

      <body className={inter.className}>
        <OrganizationJsonLd site={site} organization={content.metadata.organization} />
        <WebSiteJsonLd site={site} />
        <GoogleAnalytics />
        {children}
        <BackToTopShell />
      </body>
    </html>
  )
}
