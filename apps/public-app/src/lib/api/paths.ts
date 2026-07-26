/** Build-time GET endpoints for public-site content. */
export const CONTENTS_STATIC = '/api/public-site/contents/static'
export const CONTENTS_DYNAMIC = '/api/public-site/contents/dynamic'

export function formDefinitionPath(formId: string): string {
  return `/api/public-site/contents/${formId}/form-defination`
}

/** Browser POST endpoints (reCAPTCHA protected). */
export const SUBMIT_CONTACT = '/api/public-site/forms/submit-contact-request'
export const SUBMIT_JOIN = '/api/public-site/forms/submit-join-request'
export const NEWSLETTER = '/newsletter'

export function submitDynamicFormPath(formId: string): string {
  return `/api/public-site/forms/submit-dynamic-form/${formId}`
}
