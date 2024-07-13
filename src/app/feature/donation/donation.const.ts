import { DonationStatus, DonationType } from "src/app/core/api/models";

export type donationTab = 'self_donation' | 'guest_donation' | 'member_donation';
export type OperationMode = 'edit' | 'view' | 'create';

export const DonationDefaultValue = {
    tabName: 'guest_donation',//self_donation
    pageNumber: 0,
    pageSize: 20,
    pageSizeOptions: [20, 50, 100],
    pageTitle: 'DONATION DASHBOARD',
}
export const DonationField = {
    field: ''
};


export const DonationMessage = {
    field: ''
};

export const DonationRefData = {
    refDataKey: {
        status: 'donationStatuses',
        type: 'donationTypes',
        paymentMethod: 'paymentMethods',
        upiOps: 'upiOptions',
        nextStatus: 'nextDonationStatuses',
    },
    enum: {
        status: DonationStatus,
        type:DonationType
    }
};