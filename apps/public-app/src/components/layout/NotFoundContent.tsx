import StatusPageContent from '@/components/layout/StatusPageContent'

interface NotFoundContentProps {
  belowHeader?: boolean
}

export default function NotFoundContent({ belowHeader = false }: NotFoundContentProps) {
  return (
    <StatusPageContent
      code={404}
      message="The page you are looking for could not be found."
      belowHeader={belowHeader}
    />
  )
}
