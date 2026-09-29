import type { SuccessResponse } from '@/lib/types'
import { apiPost } from './client'
import {
  NEWSLETTER,
  SUBMIT_CONTACT,
  SUBMIT_JOIN,
  submitDynamicFormPath,
} from './paths'
import { USE_LEGACY_API } from '../config/env'

/** Preserved for dynamic forms API wiring. */
export type ContactFormData = Record<string, unknown>
export type DonationFormData = Record<string, unknown>
export type JoinFormData = Record<string, unknown>

export function submitContact(
  data: ContactFormData,
  recaptchaToken: string,
  recaptchaAction: string
): Promise<SuccessResponse> {
  
  if (USE_LEGACY_API) {
    return apiPost('/api/public/contact', {
      fullName: data.fullName,
      email: data.email,
      dialCode: String(data.fullPhoneNumber).substring(0, 3),
      contactNumber: String(data.fullPhoneNumber).substring(3),
      subject: data.subject,
      message: data.message,
    }, recaptchaToken, recaptchaAction)
  }
  return apiPost(SUBMIT_CONTACT, data, recaptchaToken, recaptchaAction)

}

export function submitDonation(
  data: DonationFormData,
  recaptchaToken: string,
  recaptchaAction: string
): Promise<SuccessResponse> {
  return apiPost('/donate', data, recaptchaToken, recaptchaAction)
}

export function submitMembership(
  data: JoinFormData,
  recaptchaToken: string,
  recaptchaAction: string
): Promise<SuccessResponse> {
  if (USE_LEGACY_API) {
    return apiPost('/api/public/join', {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      dialCode: String(data.fullPhoneNumber).substring(0, 3),
      contactNumber: String(data.fullPhoneNumber).substring(3),
      hometown: data.hometown,
      howDoUKnowAboutUs: data.howDoUKnowAboutUs,
      acceptance: true
    }, recaptchaToken, recaptchaAction)
  }
  return apiPost(SUBMIT_JOIN, data, recaptchaToken, recaptchaAction)
}

export function submitDynamicForm(
  formId: string,
  data: Record<string, unknown>,
  recaptchaToken: string,
  recaptchaAction: string
): Promise<SuccessResponse> {
  if (formId === 'contact') return submitContact(data, recaptchaToken, recaptchaAction)
  if (formId === 'membership') return submitMembership(data, recaptchaToken, recaptchaAction)
  return apiPost(submitDynamicFormPath(formId), data, recaptchaToken, recaptchaAction)
}

export function subscribeNewsletter(
  email: string,
  recaptchaToken: string,
  recaptchaAction: string
): Promise<SuccessResponse> {
  return apiPost(NEWSLETTER, { email }, recaptchaToken, recaptchaAction)
}
