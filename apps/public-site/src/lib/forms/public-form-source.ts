import {
  resolveListForm,
  type BackendListFormSource,
} from '@nabarun-ngo/list-dashboard-core'
import type { FormDefinition } from '@nabarun-ngo/forms-core'

export type PublicFormPayloadLoader = (formId: string) => Promise<unknown>

/**
 * Describes the public form endpoint as a list-dashboard backend form source.
 *
 * Keep `map` unset: list-dashboard-core then applies forms-core's
 * `fromPublicFormDefinition` adapter to both live and fixture payloads.
 */
export function createPublicFormSource(
  formId: string,
  loadPayload: PublicFormPayloadLoader
): BackendListFormSource {
  return {
    kind: 'backend',
    load: () => loadPayload(formId),
  }
}

export async function resolvePublicFormDefinition(
  formId: string,
  loadPayload: PublicFormPayloadLoader
): Promise<FormDefinition> {
  const resolved = await resolveListForm(
    createPublicFormSource(formId, loadPayload),
    {
      dashboardId: 'public-site',
      data: { formId },
    }
  )

  return resolved.definition
}
