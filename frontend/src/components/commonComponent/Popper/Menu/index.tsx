import { useState, ReactNode, useEffect } from 'react';
import Tippy from '@tippyjs/react/headless';
import { Wrapper as PopperWrapper } from '../../Popper';
import classNames from 'classnames/bind';
import styles from './Menu.module.scss';
import MenuItem from './MenuItem';
import Header from './Header';
import { MenuItemType } from '../../types/MenuItemType';

const cx = classNames.bind(styles);

interface MenuProps {
  children: React.ReactElement; // thay vì ReactNode
  items?: MenuItemType[];
  hideOnClick?: boolean;
  onChange?: (item: MenuItemType) => void;
}


const defaultFn = () => {};

function Menu({ children, items = [], hideOnClick = false, onChange = defaultFn }: MenuProps) {
  const [history, setHistory] = useState<{ data: MenuItemType[]; title?: string }[]>([
    { data: items },
  ]);

  useEffect(() => {
    setHistory([{ data: items }]);
  }, [items]);

  const current = history[history.length - 1];

  const renderItems = () => {
    return current.data.map((item, index) => {
      const isParent = !!item.children;
      return (
        <MenuItem
          key={index}
          data={item}
          onClick={() => {
            if (isParent && item.children) {
              setHistory((prev) => [...prev, item.children!]);
            } else {
              onChange(item);
            }
          }}
        />
      );
    });
  };

  return (
    <Tippy
      interactive
      delay={[0, 500]}
      offset={[12, 8]}
      hideOnClick={hideOnClick}
      placement="bottom-end"
      render={(attrs) => (
        <div className={cx('menu-list')} tabIndex={-1} {...attrs}>
          <PopperWrapper className={cx('menu-popper')}>
            {history.length > 1 && (
              <Header
                title={current.title ?? ""}
                onBack={() => {
                  setHistory((prev) => prev.slice(0, prev.length - 1));
                }}
              />
            )}
            <div className={cx('menu-body')}>{renderItems()}</div>
          </PopperWrapper>
        </div>
      )}
      onHide={() => setHistory((prev) => prev.slice(0, 1))}
    >
      {children}
    </Tippy>
  );
}

export default Menu;
