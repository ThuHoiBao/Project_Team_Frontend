import classNames from "classnames/bind";
import Button from "../../Button";
import styles from "./Menu.module.scss";
import { ReactNode } from "react";

const cx = classNames.bind(styles);

export interface MenuItemData {
  icon?: ReactNode;
  to?: string;
  title: string;  // luôn có
  separate?: boolean;
}

interface MenuItemProps {
  data: MenuItemData;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
}

const MenuItem: React.FC<MenuItemProps> = ({ data, onClick }) => {
  const classes = cx("menu-item", {
    separate: data.separate,
  });

  return (
    <Button
      className={classes}
      leftIcon={data.icon}
      to={data.to}
      onClick={onClick}
    >
      {data.title}
    </Button>
  );
};

export default MenuItem;
