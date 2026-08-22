export type accountTab = 'my_accounts' | 'all_accounts';
export type donationTab = 'self_donation' | 'guest_donation' | 'member_donation' | 'all_donation';


export const AccountDefaultValue = {
    pageNumber: 0,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    pageTitle: 'Accounts',
    tabName: 'my_accounts'
}
export const AccountConstant = {
    refDataName: 'ACCOUNT',
    refDataKey: {
        accountType: 'accountTypes',
        accountStatus: 'accountStatuses',
        ownerType: 'ownerTypes',
        bankAccountType: 'bankAccountTypes',
        investmentType: 'investmentTypes',
        interestPayingTerm: 'interestPayingTerms',
        transferReferenceType: 'transferReferenceTypes',
        transferMatrix: 'transferMatrix',
        transactionType: 'transactionTypes',
        transactionStatus: 'transactionStatuses',
        transactionRefType: 'transactionRefTypes',
        accountStatusGroups: 'accountStatusGroups',
        expenseStatus: 'expenseStatuses',
        expenseType: 'expenseRefTypes',
        expenseStatusGroups: 'expenseStatusGroups',
    },
    enum: {

    }

}

export const TransactionDefaultValue = {
    pageNumber: 0,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    pageTitle: 'Transactions',
    tabName: 'NA'
}


export const DonationDefaultValue = {
    tabName: 'self_donation',//
    pageNumber: 0,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    pageTitle: 'DONATIONS',
}


export const DonationRefData = {
    refDataKey: {
        status: 'donationStatuses',
        type: 'donationTypes',
        paymentMethod: 'paymentMethods',
        upiOps: 'upiOptions',
        nextStatus: 'nextDonationStatuses',
        statusGroups: 'donationStatusGroups',
    },
    enum: {
        //   status: DonationStatus,
        //  type: DonationType
    }
};

export const DonorRefData = {
    refDataKey: {
        status: 'donorStatuses',
        memberEditableStatus: 'memberEditableDonorStatuses',
        statusesRequiringEndDate: 'statusesRequiringEndDate',
    },
};

export const EarningDefaultValue = {
    pageNumber: 0,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    pageTitle: 'Earnings',
    tabName: 'NA'
};
