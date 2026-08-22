import { fromPublicFormDefinition } from '@nabarun-ngo/forms-core'
import { describe, expect, it, vi } from 'vitest'
import {
  createPublicFormSource,
  resolvePublicFormDefinition,
} from './public-form-source'

const backendPayload = {
  id: 'contact-id',
  key: 'contact',
  label: 'Contact us',
  fields: [
    {
      id: 'email-id',
      key: 'email',
      label: 'Email',
      fieldType: 'EMAIL',
      mandatory: true,
    },
  ],
}

describe('public form source contract', () => {
  it('uses the list-dashboard-core default public-form adapter', async () => {
    const loadPayload = vi.fn(async () => backendPayload)

    const definition = await resolvePublicFormDefinition('contact', loadPayload)

    expect(loadPayload).toHaveBeenCalledOnce()
    expect(loadPayload).toHaveBeenCalledWith('contact')
    expect(definition).toEqual(fromPublicFormDefinition(backendPayload))
    expect(definition.fields[0].fieldType).toBe('email')
  })

  it('leaves the source map unset so list-dashboard-core owns mapping semantics', () => {
    const source = createPublicFormSource('contact', async () => backendPayload)

    expect(source.kind).toBe('backend')
    expect(source.map).toBeUndefined()
  })
})
