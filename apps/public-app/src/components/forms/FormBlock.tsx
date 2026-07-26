import DynamicForm from '@/components/ui/DynamicForm'
import ExternalFormEmbed from '@/components/forms/ExternalFormEmbed'
import { fetchFormDefinition } from '@/lib/api/content.server'
import type { FormConfig } from '@/lib/types'

interface FormBlockProps {
  form: FormConfig
  /** Hide the API-provided form label (use when the page section already has a heading). */
  hideHeading?: boolean
  /** Fallback accessible title for external form embeds. */
  title?: string
}

/** Server: loads definition via forms-core adapter; client: DynamicForm + forms-react. */
export default async function FormBlock({ form, hideHeading = false, title }: FormBlockProps) {
  if (form.type === 'google' || form.type === 'microsoft') {
    if (!form.embedUrl) return null
    return (
      <ExternalFormEmbed
        type={form.type}
        embedUrl={form.embedUrl}
        title={form.embedTitle || title || 'Embedded form'}
        height={form.embedHeight}
      />
    )
  }

  if (!form.formId) return null
  const definition = await fetchFormDefinition(form.formId)

  return (
    <DynamicForm
      form={form}
      definition={definition}
      hideHeading={hideHeading}
    />
  )
}
