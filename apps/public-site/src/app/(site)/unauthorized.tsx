import StatusPageContent from '@/components/layout/StatusPageContent'

export default function SiteUnauthorized() {
  return (
    <StatusPageContent
      code={401}
      message="You need to sign in to access this page."
      belowHeader
    />
  )
}
