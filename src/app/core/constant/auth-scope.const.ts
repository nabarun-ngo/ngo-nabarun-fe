export const SCOPE = {
  read: {
    // finance
    transactions: 'read:transactions',
    accounts: 'read:accounts',
    expenses: 'read:expenses',
    reports: 'read:reports',

    // donations
    donations: 'read:donations',
    user_donations: 'read:user_donations',
    donation_guest: 'read:donation_guest',

    // users
    user: 'read:user',
    users: 'read:users',

    // documents
    document: 'read:document',
    document_list: 'read:document_list',
    static_docs: 'read:static_docs',

    // projects & activities
    project: 'read:project',
    activity: 'read:activity',

    // workflow
    workflow: 'read:workflow',
    task: 'read:task',

    // meetings
    meeting: 'read:meeting',

    // system
    jobs: 'read:jobs',
    cron: 'read:cron',

    // api
    apikey: 'read:api_keys',
    oauth_token: 'read:oauth_token'
  },

  create: {
    // users
    user: 'create:user',

    // finance
    account: 'create:account',
    expense: 'create:expense',
    expense_final: 'create:expense_final',
    expense_settle: 'create:expense_settle',
    donation: 'create:donation',
    donation_guest: 'create:donation_guest',

    // projects
    project: 'create:project',
    activity: 'create:activity',
    workflow: 'create:workflow',

    // communication
    meeting: 'create:meeting',
    send_email: 'create:send_email',
    notification: 'create:notification',

    // documents
    document: 'create:document',

    // system
    apikey: 'create:api_keys',
    oauth_token: 'create:oauth_token'
  },

  update: {
    // users
    user: 'update:user',
    user_role: 'update:user_role',

    // finance
    account: 'update:account',
    expense: 'update:expense',
    donation: 'update:donation',
    transactions: 'update:transactions',

    // projects
    project: 'update:project',
    activity: 'update:activity',
    task: 'update:task',

    // communication
    meeting: 'update:meeting',

    // system
    jobs: 'update:jobs',
    cron: 'update:cron',
    apikey: 'update:api_keys',
  },

  delete: {
    jobs: 'delete:jobs',
    apikey: 'delete:api_keys',
    oauth_token: 'delete:oauth_token'
  }
};


export function getScopes() {
  var scope = '';

  Object.values(SCOPE).forEach(level1 => {
    Object.values(level1).forEach(level2 => {
      scope = scope + ' ' + level2;
    })
  })
  //////console.log('Additional scope : '+scope)
  return scope;
}

