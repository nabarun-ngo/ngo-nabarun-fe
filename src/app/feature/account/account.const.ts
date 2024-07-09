export type accountTab = 'my_accounts' | 'all_accounts';


export const AccountDefaultValue={
    pageNumber: 0,
    pageSize:20,
    pageSizeOptions: [20, 50,100],
    pageTitle:'Accounts',
    tabName:'my_accounts'
}
export const AccountConstant={
    refDataName:'ACCOUNT',
    accountType:'accountTypes',
    accountStatus:'accountStatuses'
}