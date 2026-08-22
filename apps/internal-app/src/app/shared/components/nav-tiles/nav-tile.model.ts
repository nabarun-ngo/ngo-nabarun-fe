export type NavTileIcon =
  | 'icon_rupee'
  | 'icon_book'
  | 'icon_group'
  | 'icon_credit_card'
  | 'icon_presentation'
  | 'icon_home'
  | 'icon_comment'
  | 'icon_globe'
  | 'icon_code'
  | 'icon_expense'
  | 'icon_tasks'
  | 'icon_members'
  | 'icon_requests'
  | 'icon_meetings'
  | 'icon_projects'
  | 'icon_admin'
  | 'icon_help'
  | 'donations'
  | 'donors'
  | 'accounts'
  | 'earnings'
  | 'expenses'
  | 'reports'
  | 'projects'
  | 'activities'
  | 'goals'
  | 'beneficiaries'
  | 'milestones'
  | 'team'
  | 'risks';

export type NavTileVariant = 'access' | 'hub';
export type NavTileGridLayout = 'access' | 'hub';

export interface NavTileConfig {
  id?: string;
  label: string;
  link: string;
  icon: NavTileIcon;
  description?: string;
  hidden?: boolean;
  queryParams?: Record<string, string>;
  metric?: {
    label?: string;
    value?: string;
    loading?: boolean;
    showBadge?: boolean;
  };
}
