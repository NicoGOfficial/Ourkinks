import {
  PlayCircleOutlined
} from '@ant-design/icons';
import { Tooltip } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { connect, ConnectedProps } from 'react-redux';
import { ModelIcon } from 'src/icons';

import style from './middle-menu.module.less';

const mapState = (state: any) => ({
  currentUser: state.user.current
});

const connector = connect(mapState);

type PropsFromRedux = ConnectedProps<typeof connector>;

export function MiddleMenu({
  currentUser
}: PropsFromRedux) {
  const { t } = useTranslation();
  const router = useRouter();

  if (!currentUser._id || currentUser.isPerformer) return null;

  return (
    <div className={style['menu-middle']}>
      <ul
        className={style['nav-icons']}
      >
        <li
          key="model-page"
          className={
            router.pathname === '/model'
              ? `${style.custom} active`
              : `${style.custom}`
          }
        >
          <Link href={{ pathname: '/model' }} as="/model">
            <a>
              <Tooltip title={t('common:titleModelPage')}>
                <ModelIcon />
                {' '}
                <span className="hide">{t('common:titleModelPage')}</span>
              </Tooltip>
            </a>
          </Link>
        </li>
        <li
          key="search-live"
          className={
            router.pathname === '/search/live'
              ? `${style.custom} active`
              : `${style.custom}`
          }
        >
          <Link
            href={{ pathname: '/search/live' }}
            as="/search/live"
          >
            <a>
              <Tooltip title={t('common:liveModel')}>
                <PlayCircleOutlined />
                {' '}
                <span className="hide">{t('common:liveModel')}</span>
              </Tooltip>
            </a>
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default connector(MiddleMenu);
