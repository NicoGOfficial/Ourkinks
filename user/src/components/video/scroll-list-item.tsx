import { PerformerListVideo } from '@components/video';
import { Spin } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import InfiniteScroll from 'react-infinite-scroll-component';

import { IVideo } from '../../interfaces/video';

type IProps = {
  items: IVideo[];
  canLoadmore: boolean;
  loadMore(): Function;
  loading: boolean;
}

export function ScrollListVideo({
  items, loadMore, loading, canLoadmore
}: IProps) {
  const { t } = useTranslation();

  return (
    <InfiniteScroll
      dataLength={items.length}
      hasMore={canLoadmore}
      loader={null}
      next={loadMore}
      endMessage={null}
      scrollThreshold={0.9}
    >
      <PerformerListVideo videos={items} />
      {!items.length && !loading && <div className="text-center">{t('common:noVideo')}</div>}
      {loading && <div className="text-center"><Spin /></div>}
    </InfiniteScroll>
  );
}

export default ScrollListVideo;
