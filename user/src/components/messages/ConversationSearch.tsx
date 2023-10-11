import { SearchOutlined } from '@ant-design/icons';
import React from 'react';

import style from './ConversationSearch.module.less';

type IProps = {
  onSearch: any;
}

export default function ConversationSearch({ onSearch }: IProps) {
  return (
    <div className={style['conversation-search']}>
      <SearchOutlined />
      <input
        onChange={onSearch}
        type="search"
        className={style['conversation-search-input']}
        placeholder="Search contact..."
      />
    </div>
  );
}
