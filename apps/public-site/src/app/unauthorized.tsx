import StatusPageContent from '@/components/layout/StatusPageContent'

export default function Unauthorized() {
  return (
    <StatusPageContent
      code={401}
      message="You need to sign in to access this page."
    />
  )
}
