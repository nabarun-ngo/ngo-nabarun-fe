'use client'

import { useMemo } from 'react'
import { CustomForm } from '@nabarun-ngo/forms-react'
import {
  createPublicBootstrapFormComponents,
  publicFormClassNames,
  publicFormEngineOptions,
} from '@nabarun-ngo/forms-react/bootstrap'
import { serializeFormSubmitValues } from '@nabarun-ngo/forms-core'
import type { FormDefinition } from '@nabarun-ngo/forms-core'
import type { FormConfig } from '@/lib/types'
import { useRecaptcha } from '@/hooks/useRecaptcha'
import { useNotification } from '@/hooks/useCommonUI'
import { submitDynamicForm } from '@/lib/api/submit'

interface DynamicFormProps {
  form: FormConfig
  /** Normalized definition from `fetchFormDefinition` (forms-core adapter). */
  definition: FormDefinition
  hideHeading?: boolean
}

export default function DynamicForm({ form, definition, hideHeading = false }: DynamicFormProps) {
  const { execute } = useRecaptcha()
  const { showNotification } = useNotification()
  const components = useMemo(() => createPublicBootstrapFormComponents(), [])

  return (
    <CustomForm
      definition={definition}
      engineOptions={publicFormEngineOptions}
      components={components}
      classNames={publicFormClassNames}
      idPrefix={form.formId ?? definition.key}
      hideHeading={hideHeading}
      submitLabel={form.submitLabel}
      onSubmit={async (values) => {
        try {
          const token = await execute(form.recaptchaAction ?? '')
          const payload = serializeFormSubmitValues(definition, values)
          const result = await submitDynamicForm(form.formId ?? definition.key, payload, token, form.recaptchaAction ?? '')
          showNotification(result.message || 'Submitted successfully. Thank you!', 'success')
        } catch {
          showNotification('Submission failed. Please try again.', 'error')
          throw;
        }
      }}
    />
  )
}
