
export type donationTab = 'self_donation' | 'guest_donation' | 'member_donation' | 'all_donation';
export type OperationMode = 'edit' | 'view' | 'create';

export const DonationDefaultValue = {
    tabName: 'self_donation',//
    pageNumber: 0,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    pageTitle: 'DONATION DASHBOARD',
}
export const DonationField = {
    field: ''
};


export const DonationMessage = {
    field: ''
};

// Define constants matching api-client/models/DonationDto values
export const DonationStatus = {
    Raised: 'RAISED',
    Paid: 'PAID',
    Pending: 'PENDING',
    PaymentFailed: 'PAYMENT_FAILED',
    PayLater: 'PAY_LATER',
    Cancelled: 'CANCELLED',
    UpdateMistake: 'UPDATE_MISTAKE'
};

export const DonationType = {
    Regular: 'REGULAR',
    Onetime: 'ONETIME'
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
        type: DonationType
    }
};



