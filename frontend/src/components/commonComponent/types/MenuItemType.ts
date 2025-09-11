export interface MenuItemType {
  icon?: React.ReactNode;
  title: string;
  to?: string;
  type?: string;
  code?: string;
  separate?: boolean;
  children?: {
    title: string;
    data: MenuItemType[];
  };
}
