export const SCOPE = {
  read: {
    // finance
    transactions: 'read:transactions',
    accounts: 'read:accounts',
    expenses: 'read:expenses',
    reports: 'read:reports',
    earnings: 'read:earnings',
    // donations
    donations: 'read:donations',
    donors: 'read:donors',
    member_donations: 'read:member_donations',
    donation_guest: 'read:donation_guest',
    donation_comments: 'read:donation_comments',

    // users
    users: 'read:users',
    user_connections: 'read:user_connections',

    // documents
    documents: 'read:documents',

    // projects & activities
    projects: 'read:projects',
    activities: 'read:activities',
    goals: 'read:goals',
    beneficiaries: 'read:beneficiaries',
    milestones: 'read:milestones',
    project_teams: 'read:project_teams',
    risks: 'read:risks',

    // requests / workflow inbox
    requests: 'read:requests',
    tasks: 'read:tasks',
    task_comments: 'read:task_comments',

    // meetings
    meetings: 'read:meetings',

    // assets
    assets: 'read:assets',
    books: 'read:books',

    // system
    jobs: 'read:jobs',
    cron: 'read:cron',

    // api
    apikey: 'read:api_keys',
    oauth_token: 'read:oauth_token',

    // notification / correspondence
    notifications: 'read:notifications',
    subscriptions: 'read:subscriptions',

    // rbac admin
    user_roles: 'read:user_roles',
    user_permissions: 'read:user_permissions',
    roles: 'read:roles',
    permissions: 'read:permissions',
    role_groups: 'read:role_groups',

    // platform admin
    json_documents: 'read:json_documents',
    custom_forms: 'read:custom_forms',
    form_submissions: 'read:form_submissions',
    help_portal: 'read:help_portal',
    public_content: 'read:public_content',
    workflows_admin: 'admin:workflows',
  },

  create: {
    // users
    users: 'create:users',
    user_roles: 'create:user_roles',
    user_permissions: 'create:user_permissions',
    user_connections: 'create:user_connections',

    // finance
    account: 'create:account',
    expense: 'create:expense',
    donation: 'create:donation',
    donation_guest: 'create:donation_guest',
    donation_comments: 'create:donation_comments',
    donor_guest: 'create:donor_guest',
    earning: 'create:earning',

    // projects
    project: 'create:project',
    activity: 'create:activity',
    goal: 'create:goal',
    beneficiary: 'create:beneficiary',
    milestone: 'create:milestone',
    project_team: 'create:project_team',
    risk: 'create:risk',
    requests: 'create:requests',

    // communication
    meeting: 'create:meeting',

    // assets
    asset: 'create:asset',
    book: 'create:book',

    // documents
    documents: 'create:documents',

    // system
    apikey: 'create:api_keys',
    oauth_token: 'create:oauth_token',
    json_documents: 'create:json_documents',
    custom_forms: 'create:custom_forms',
    roles: 'create:roles',
    permissions: 'create:permissions',
    role_groups: 'create:role_groups',
    subscriptions: 'create:subscriptions',
    task_comments: 'create:task_comments',

    // reporting
    reports: 'create:reports',
  },

  update: {
    // users
    users: 'update:users',

    // finance
    account: 'update:account',
    accounts: 'update:accounts',
    expense: 'update:expense',
    donation: 'update:donation',
    donor_guest: 'update:donor_guest',
    donor_member: 'update:donor_member',
    transactions: 'update:transactions',
    earning: 'update:earning',

    // projects
    project: 'update:project',
    activity: 'update:activity',
    goal: 'update:goal',
    beneficiary: 'update:beneficiary',
    milestone: 'update:milestone',
    project_team: 'update:project_team',
    risk: 'update:risk',
    task: 'update:task',
    requests: 'update:requests',

    // communication
    meeting: 'update:meeting',

    // assets
    asset: 'update:asset',
    book: 'update:book',

    // system
    jobs: 'update:jobs',
    cron: 'update:cron',
    apikey: 'update:api_keys',
    json_documents: 'update:json_documents',
    custom_forms: 'update:custom_forms',
    notifications: 'update:notifications',
    subscriptions: 'update:subscriptions',
    roles: 'update:roles',
    permissions: 'update:permissions',
    role_groups: 'update:role_groups',
  },

  delete: {
    reports: 'delete:reports',
    jobs: 'delete:jobs',
    apikey: 'delete:api_keys',
    oauth_token: 'delete:oauth_token',
    user_roles: 'delete:user_roles',
    user_permissions: 'delete:user_permissions',
    user_connections: 'delete:user_connections',
    json_documents: 'delete:json_documents',
    users: 'delete:users',
    roles: 'delete:roles',
    permissions: 'delete:permissions',
    role_groups: 'delete:role_groups',
    asset: 'delete:asset',
    book: 'delete:book',
    subscriptions: 'delete:subscriptions',
  },

  finalize: {
    expense: 'finalize:expense',
  },

  settle: {
    expense: 'settle:expense',
  },

  send: {
    email: 'send:email',
  },

  write: {
    form_submissions: 'write:form_submissions',
  },

  submit: {
    form_submissions: 'submit:form_submissions',
  },

  clear: {
    form_submissions: 'clear:form_submissions',
  },

  approve: {
    reports: 'approve:reports',
  },

  manage: {
    workflow_definitions: 'manage:workflow_definitions',
  },

  disable: {
    custom_forms: 'disable:custom_forms',
  },

  merge: {
    donor_guest: 'merge:donor_guest',
  },
};
