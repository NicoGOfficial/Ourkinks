/* eslint-disable react/require-default-props */
import { Alert, Spin } from 'antd';
import withTranslation from 'next-translate/withTranslation';
import { PureComponent } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { IFeed } from 'src/interfaces/index';

import FeedCard from './feed-card';
import { FeedGridCard } from './grid-card';
import style from './index.module.less';

interface IProps {
  items: IFeed[];
  canLoadmore: boolean;
  loadMore(): Function;
  onDelete(): Function;
  loading?: boolean;
  isGrid?: boolean;
  i18n: any;
}

class ScrollListFeed extends PureComponent<IProps> {
  render() {
    const { t } = this.props.i18n;
    const {
      items = [], loadMore, onDelete, canLoadmore, loading = false, isGrid = false
    } = this.props;
    return (
      <InfiniteScroll
        dataLength={items.length}
        hasMore={canLoadmore}
        loader={null}
        next={loadMore}
        endMessage={(
          <p style={{ textAlign: 'center' }}>
            {/* <b>Yay! No more video.</b> */}
          </p>
        )}
        scrollThreshold={0.9}
      >
        <div className={isGrid ? style['grid-view'] : ''}>
          {items.length > 0 && items.map((item) => {
            if (isGrid) {
              return <FeedGridCard feed={item} key={item._id} />;
            }
            return <FeedCard feed={item} key={item._id} onDelete={onDelete.bind(this)} />;
          })}
        </div>
        {!items.length && !loading && (
          <div className="main-container custom">
            <Alert className="text-center" message={t('common:noDataWasFound')} type="info" />
          </div>
        )}
        {loading && <div className="text-center"><Spin /></div>}
      </InfiniteScroll>
    );
  }
}

export default withTranslation(ScrollListFeed);
