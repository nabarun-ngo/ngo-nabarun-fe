import { AlertData } from "src/app/shared/model/alert.model";
import { AlertType } from "../component/notification-modal/notification-modal.component";

export const AppAlert = {
    profile_updated_self: {
        message: 'Your profile data has been successfully updated.',
        alertType: 'success' as AlertType,
        destroyAfter: 10
    },
    donation_updated: {
        message: 'Donation details have been successfully updated.',
        alertType: 'success' as AlertType,
        destroyAfter: 10
    },
    donation_created: {
        message: 'Donation <b>{donationId}</b> has been successfully created.',
        alertType: 'success' as AlertType,
        destroyAfter: 10
    },
    payment_notified: {
        message: 'Your payment has been successfully notified.',
        alertType: 'success' as AlertType,
        destroyAfter: 10
    },
}

export function interpolate(alertConfig: AlertData, params: Record<string, string | number>): AlertData {
    return {
        ...alertConfig,
        message: alertConfig.message.replace(/\{(\w+)\}/g, (_, key) => params[key]?.toString() || `{${key}}`)
    };
}