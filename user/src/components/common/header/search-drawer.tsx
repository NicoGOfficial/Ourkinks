import {
  SearchOutlined
} from '@ant-design/icons';
import { Drawer, Tooltip } from 'antd';
import { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import SearchBar from '../layout/search-bar';
import style from './search-drawer.module.less';

const mapState = (state: any) => ({
  currentUser: state.user.current
});

const connector = connect(mapState);

type PropsFromRedux = ConnectedProps<typeof connector>;

function SearchDrawer({
  currentUser
}: PropsFromRedux) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <span
        key="menu-search"
        className={currentUser.isPerformer ? style['menu-search-performer'] : style['menu-search']}
        aria-hidden
        onClick={() => setOpen(!open)}
      >
        <a>
          <Tooltip title="Search">
            <SearchOutlined />
          </Tooltip>
        </a>
      </span>
      <Drawer
        title="Search"
        closable
        onClose={() => setOpen(false)}
        visible={open}
        key="search-drawer"
        className={style['profile-drawer']}
        width={280}
      >
        <SearchBar onEnter={() => setOpen(false)} />
      </Drawer>
    </>
  );
}

export default connector(SearchDrawer);
