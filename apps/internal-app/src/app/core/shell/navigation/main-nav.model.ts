export interface MainNavItem {
  id: string;
  label: string;
  url: string;
  prefixes: string[];
  icon: string;
  hidden?: boolean;
  action?: 'logout';
}
