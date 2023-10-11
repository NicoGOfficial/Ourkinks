/* eslint-disable no-multiple-empty-lines */
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

type IProps = {
  theme?: string;
  menus: any;
  collapsed?: boolean;
}

export function SiderMenu({
  theme = 'dark',
  menus,
  collapsed = false
}: IProps) {
  const router = useRouter();
  const [selectedKeys, setSelectedKeys] = useState([]);

  const standardizedMenus = (inputMenus, isChildren = false) => {
    inputMenus.forEach((menu) => {
      if (isChildren) {
        // eslint-disable-next-line no-param-reassign
        menu.isChildren = isChildren;
      }
      if (menu.children?.length) {
        // eslint-disable-next-line no-param-reassign
        menu.hasChild = true;
        standardizedMenus(menu.children, true);
      } else {
        // eslint-disable-next-line no-param-reassign
        menu.hasChild = false;
      }
    });
  };

  const clickMenu = (menu) => {
    const oldKeys = [...selectedKeys];
    // if it is parent, toggle menu
    // we support 1 level for admin right now
    const index = selectedKeys.indexOf(menu.id);
    index > -1 ? oldKeys.splice(index, 1) : oldKeys.push(menu.id);
    setSelectedKeys(oldKeys);

    // redirect to page if have
    if (menu.route) {
      router.push(menu.route);
    }
  };

  const generateMenu = (menu, onlyChildren = false) => {
    if (menu.children?.length) {
      let className = 'ant-menu-submenu ant-menu-submenu-inline';
      let subMenuClassName = 'ant-menu ant-menu-sub ant-menu-inline';
      if (selectedKeys.includes(menu.id)) {
        className += ' ant-menu-submenu-selected ant-menu-submenu-open';
      } else {
        subMenuClassName += ' ant-menu-hidden';
      }
      return (
        <li className={className} role="none" key={menu.id}>
          <div
            role="none"
            className="ant-menu-submenu-title"
            tabIndex={-1}
            style={{
              // paddingLeft: '24px'
            }}
            onClick={() => clickMenu(menu)}
          >
            {menu.icon}
            {!collapsed && <span className="ant-menu-title-content">{menu.name}</span>}
            <i className="ant-menu-submenu-arrow" />
          </div>
          <ul className={subMenuClassName} data-menu-list="true">
            {menu.children.map((childMenu) => generateMenu(childMenu))}
          </ul>
        </li>
      );
    }

    const subClassname = `ant-menu-item ${onlyChildren ? 'ant-menu-item-only-child' : ''}`;
    // disable for now
    // if (selectedKeys.includes(menu.id)) {
    //   subClassname += ' ant-menu-item-selected';
    // }

    return (
      <li
        className={subClassname}
        role="none"
        tabIndex={-1}
        style={{
          paddingLeft: '24px'
        }}
        key={menu.id}
        onClick={() => clickMenu(menu)}
      >
        {menu.icon}
        {!collapsed && <span className="ant-menu-title-content">{menu.name}</span>}
      </li>
    );
  };

  useEffect(() => {
    standardizedMenus(menus);
  }, []);

  const s = !collapsed ? {
    flex: '0 0 252px',
    maxWidth: '252px',
    minWidth: '252px',
    width: '252px'
  } : {
    flex: '0 0 76px',
    maxWidth: '76px',
    minWidth: '76px',
    width: '76px'
  };

  return (
    <aside
      className={`ant-layout-sider ant-layout-sider-${theme}`}
      style={s}
    >
      <div className="ant-layout-sider-children">
        <div className="logo" />
        <ul className={`ant-menu ant-menu-root ant-menu-inline ant-menu-${theme} ${collapsed ? 'ant-menu-inline-collapsed' : ''}`} dir="ltr" role="menu" tabIndex={0} data-menu-list="true">
          {menus.map((menu) => generateMenu(menu))}
        </ul>
      </div>
    </aside>
  );
}

export default SiderMenu;
