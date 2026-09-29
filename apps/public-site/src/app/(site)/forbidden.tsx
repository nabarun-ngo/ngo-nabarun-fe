import StatusPageContent from '@/components/layout/StatusPageContent'

export default function SiteForbidden() {
  return (
    <StatusPageContent
      code={403}
      message="You do not have permission to access this page."
      belowHeader
    />
  )
}
