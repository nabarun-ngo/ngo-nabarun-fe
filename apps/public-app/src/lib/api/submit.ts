import type { SuccessResponse } from '@/lib/types'
import { apiPost } from './client'
import {
  NEWSLETTER,
  SUBMIT_CONTACT,
  SUBMIT_JOIN,
  submitDynamicFormPath,
} from './paths'

/** Preserved for dynamic forms API wiring. */
export type ContactFormData = Record<string, unknown>
export type DonationFormData = Record<string, unknown>
export type JoinFormData = Record<string, unknown>

export function submitContact(
  data: ContactFormData,
  recaptchaToken: string
): Promise<SuccessResponse> {
  return apiPost(SUBMIT_CONTACT, data, recaptchaToken)
}

export function submitDonation(
  data: DonationFormData,
  recaptchaToken: string
): Promise<SuccessResponse> {
  return apiPost('/donate', data, recaptchaToken)
}

export function submitMembership(
  data: JoinFormData,
  recaptchaToken: string
): Promise<SuccessResponse> {
  return apiPost(SUBMIT_JOIN, data, recaptchaToken)
}

export function submitDynamicForm(
  formId: string,
  data: Record<string, unknown>,
  recaptchaToken: string
): Promise<SuccessResponse> {
  if (formId === 'contact') return submitContact(data, recaptchaToken)
  if (formId === 'membership') return submitMembership(data, recaptchaToken)
  return apiPost(submitDynamicFormPath(formId), data, recaptchaToken)
}

export function subscribeNewsletter(
  email: string,
  recaptchaToken: string
): Promise<SuccessResponse> {
  return apiPost(NEWSLETTER, { email }, recaptchaToken)
}
