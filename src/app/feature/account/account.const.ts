export type accountTab = 'my_accounts' | 'all_accounts';
export type expenseTab = 'my_expenses' | 'expense_list';


export const AccountDefaultValue = {
    pageNumber: 0,
    pageSize: 10,
    pageSizeOptions: [10,20, 50, 100],
    pageTitle: 'Accounts',
    tabName: 'my_accounts'
}
export const AccountConstant = {
    refDataName: 'ACCOUNT',
    refDataKey: {
        accountType: 'accountTypes',
        accountStatus: 'accountStatuses'
    },
    enum: {
        
    }

}

export const TransactionDefaultValue = {
    pageNumber: 0,
    pageSize: 10,
    pageSizeOptions: [10,20, 50, 100],
    pageTitle: 'Transactions',
    tabName: 'NA'
}


export const ExpenseDefaultValue = {
    pageNumber: 0,
    pageSize: 10,
    pageSizeOptions: [10,20, 50, 100],
    pageTitle: 'Expenses',
    tabName: 'my_expenses'
}