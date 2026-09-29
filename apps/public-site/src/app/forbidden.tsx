import StatusPageContent from '@/components/layout/StatusPageContent'

export default function Forbidden() {
  return (
    <StatusPageContent
      code={403}
      message="You do not have permission to access this page."
    />
  )
}
