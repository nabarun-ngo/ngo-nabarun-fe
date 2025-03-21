
export const AppRoute = {
  welcome_page: {
    id: 'welcome_page',
    url: '',
    parent: '',
    feature: '',
    path: ''
  },
  login_page: {
    id: 'welcome_page',
    url: '/login',
    parent: '',
    feature: '',
    path: 'login'
  },
  login_callback_page: {
    id: 'login_callback_page',
    url: '/callback',
    parent: '',
    feature: '',
    path: 'callback'
  },
  secured_dashboard_page: {
    id: 'secured_dashboard_page',
    url: '/secured/dashboard',
    parent: 'secured',
    feature: 'dashboard',
    path: '',
  },
  secured_donation_dashboard_page: {
    id: 'secured_donation_dashboard_page',
    url: '/secured/donation/dashboard',
    parent: 'secured',
    feature: 'donation',
    path: 'dashboard',
  },
  secured_member_members_page: {
    id: 'secured_member_members_page',
    url: '/secured/member/list',
    parent: 'secured',
    feature: 'member',
    path: 'list',
  },
  secured_member_profile_page: {
    id: 'secured_member_profile_page',
    url: '/secured/member',// /:id to be added dynamically
    parent: 'secured',
    feature: 'member',
    path: ':id',
  },
  secured_member_my_profile_page: {
    id: 'secured_member_my_profile_page',
    url: '/secured/member/myprofile',
    parent: 'secured',
    feature: 'member',
    path: 'myprofile',
  },
  secured_member_complete_my_profile_page: {
    id: 'secured_member_complete_my_profile_page',
    url: '/secured/member/completemyprofile',
    parent: 'secured',
    feature: 'member',
    path: 'completemyprofile',
  },
  secured_member_roles_page: {
    id: 'secured_member_roles_page',
    url: '/secured/member/roles',
    parent: 'secured',
    feature: 'member',
    path: 'roles',
  },
  secured_request_list_page: {
    id: 'secured_request_list_page',
    url: '/secured/request/list',
    parent: 'secured',
    feature: 'request',
    path: 'list',
  },
  secured_task_list_page: {
    id: 'secured_task_list_page',
    url: '/secured/request/tasklist',
    parent: 'secured',
    feature: 'request',
    path: 'tasklist',
  },
  secured_account_list_page: {
    id: 'secured_account_list_page',
    url: '/secured/account/list',
    parent: 'secured',
    feature: 'account',
    path: 'list',
  },
  secured_account_transaction_page: {
    id: 'secured_account_transaction_page',
    url: '/secured/account/:id/transactions',
    parent: 'secured',
    feature: 'account',
    path: ':id/transactions',
  },
  secured_notice_notices_page: {
    id: 'secured_notice_notices_page',
    url: '/secured/notice/list',
    parent: 'secured',
    feature: 'notice',
    path: 'list',
  },
  secured_notice_create_page: {
    id: 'secured_notice_create_page',
    url: '/secured/notice/create',
    parent: 'secured',
    feature: 'notice',
    path: 'create',
  },
  secured_notice_update_page: {
    id: 'secured_notice_update_page',
    url: '/secured/notice/:id',
    parent: 'secured',
    feature: 'notice',
    path: ':id',
  },
  secured_admin_dashboard_page: {
    id: 'secured_admin_dashboard_page',
    url: '/secured/admin/dashboard',
    parent: 'secured',
    feature: 'admin',
    path: 'dashboard',
  },
}



