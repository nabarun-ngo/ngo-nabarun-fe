export const SCOPE = {
    read: {
        transactions: 'read:transactions',
        accounts: 'read:accounts',
        expenses: 'read:expenses',
        earnings: 'read:earnings',
        apikey: 'read:apikey',
        document_list: 'read:document_list',
        donation_documents: 'read:donation_documents',
        donation_history: 'read:donation_history',
        user_donations: 'read:user_donations',
        donations: 'read:donations',
        donation_guest: 'read:donation_guest',
        notice: 'read:notice',
        notices: 'read:notices',
        request: 'read:request',
        work: 'read:work',
        user: 'read:user',
        users: 'read:users',
        actuator: 'read:actuator'
    },
    create: {
        transaction: 'create:transaction',
        expense: 'create:expense',
        earning: 'create:earning',
        account: 'create:account',
        expense_final: 'create:expense_final',
        expense_settle: 'create:expense_settle',
        servicerun: 'create:servicerun',
        apikey: 'create:apikey',
        donation: 'create:donation',
        notice: 'create:notice',
        request: 'create:request',
    },
    update: {
        account: 'update:account',
        expense: 'update:expense',
        earning: 'update:earning',
        apikey: 'update:apikey',
        donation: 'update:donation',
        notice: 'update:notice',
        request: 'update:request',
        work: 'update:work',
        user: 'update:user',
        user_role: 'update:user_role',
        actuator: 'update:actuator'
    },
    delete: {
        document: 'delete:document',
    }
};

export function getScopes() {
    var scope = '';

    Object.values(SCOPE).forEach(level1 => {
        Object.values(level1).forEach(level2 => {
            scope = scope + ' ' + level2;
        })
    })
    ////console.log('Additional scope : '+scope)
    return scope;
}

