import { DonationStatus, DonationType } from "src/app/core/api/models";

export type donationTab = 'self_donation' | 'guest_donation' | 'member_donation' | 'all_donation';
export type OperationMode = 'edit' | 'view' | 'create';

export const DonationDefaultValue = {
    tabName: 'self_donation',//
    pageNumber: 0,
    pageSize: 10,
    pageSizeOptions: [10,20, 50, 100],
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