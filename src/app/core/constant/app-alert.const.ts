import { AlertType } from "../component/notification-modal/notification-modal.component";

export const AppAlert = {
    profile_updated_self: {
        message: 'Your profile data has been successfully updated.',
        alertType: 'success' as AlertType,
        destroyAfter: 5
    },
    donation_updated: {
        message: 'Donation details has been successfully updated.',
        alertType: 'success' as AlertType,
        destroyAfter: 5
    },
    donation_created: {
        message: 'Donation has been successfully created.',
        alertType: 'success' as AlertType,
        destroyAfter: 5
    },
    payment_notified: {
        message: 'Your has been successfully notified.',
        alertType: 'success' as AlertType,
        destroyAfter: 5
    },
}