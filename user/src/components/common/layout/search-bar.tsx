import { Input } from 'antd';
import Router from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import style from './search-bar.module.less';

const { Search } = Input;

export function SearchBar({
  onEnter = () => {}
}: any) {
  const { t } = useTranslation();

  const onSearch = (q) => {
    if (!q || !q.trim()) return;
    Router.push({ pathname: '/search', query: { q } });
  };

  return (
    <div className={style['search-bar']}>
      <Search
        placeholder={t('common:searchPlaceholder')}
        allowClear
        enterButton
        onPressEnter={(e: any) => {
          onSearch(e?.target?.value);
          onEnter(e);
        }}
        onSearch={onSearch}
      />
    </div>
  );
}

export default SearchBar;
