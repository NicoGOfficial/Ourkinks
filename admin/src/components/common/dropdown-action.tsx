import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu } from 'antd';
import Link from 'next/link';

// import style from './dropdown-action.module.less';

interface IMenuOption {
  key: string;
  label: any;
  icon?: any;
  href?: any;
  onClick?: Function;
}

type IProps = {
  menuOptions?: IMenuOption[];
  nameButtonMain?: any;
}

// modify and do not use antd menu, cause error in build
export function DropdownAction({
  menuOptions = [],
  nameButtonMain = 'Actions'
}: IProps) {
  const renderLabel = (menu) => {
    if (menu.href) {
      return (
        <Link href={menu.href} key={menu.key}>
          <a>{menu.label}</a>
        </Link>
      );
    }

    return (
      <a href="#" key={menu.key} role="button" onClick={() => menu.onClick()}>
        {menu.label}
      </a>
    );
  };

  const menuItems = menuOptions.map((menu) => ({
    label: renderLabel(menu),
    key: menu.key,
    icon: menu.icon
  }));

  return (
    <Dropdown overlay={<Menu items={menuItems} />}>
      <Button>
        {nameButtonMain}
        <DownOutlined />
      </Button>
    </Dropdown>
  );

  // code if not use menu dropdown, since antd have a big issue with react 18
  // return (
  //   <div className={style.dropdown}>
  //     <button type="button" className={style.dropbtn}>
  //       <div className={style['space-item']}>{nameButtonMain}</div>
  //       <div className={style['space-item']}>
  //         &nbsp;
  //         <DownOutlined />
  //       </div>
  //     </button>
  //     <div className={style['dropdown-content']}>
  //       {menuOptions.map((menu) => {
  //         if (menu.href) {
  //           return (
  //             <Link href={menu.href} key={menu.key}>
  //               <a>
  //                 {menu.icon}
  //                 {' '}
  //                 {menu.label}
  //               </a>
  //             </Link>
  //           );
  //         }

  //         return (
  //           <a href="#" key={menu.key} role="button" onClick={() => menu.onClick()}>
  //             {menu.icon}
  //             {' '}
  //             {menu.label}
  //           </a>
  //         );
  //       })}
  //     </div>
  //   </div>
  // );
}

export default DropdownAction;
