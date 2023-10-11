import { FireOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import ScrollListFeed from '@components/feed/scroll-list';
import { getResponseError } from '@lib/utils';
import { feedService } from '@services/feed.service';
import {
  Alert, Layout, message, Spin
} from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { IFeed } from 'src/interfaces';

function Feeds() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const limit = 2;
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<IFeed[]>([]);
  const user = useSelector((state: any) => state.user.current);
  const search = async () => {
    try {
      setLoading(true);
      const resp = await feedService.userHomeFeeds({
        limit,
        offset: (page - 1) * limit
      });
      resp?.data?.total && setTotal(resp.data.total);
      resp?.data?.data && setItems([...items, ...resp.data.data]);
    } catch (error) {
      const err = await Promise.resolve(error);
      message.error(getResponseError(err) || t('common:errCommon'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeed = async (feed: IFeed) => {
    if (user._id !== feed.fromSourceId) {
      message.error(t('common:permissionDenied'));
      return;
    }
    if (!window.confirm(t('common:areYouSureRemovePost'))) return;
    try {
      await feedService.delete(feed._id);
      message.success(t('common:deletedPostSuccessfully'));
      window.location.reload();
    } catch {
      message.error(t('common:somethingWentWrong'));
    }
  };

  const onLoadMore = () => {
    setPage(page + 1);
  };
  useEffect(() => {
    search();
  }, [page]);

  return (
    <Layout>
      <PageTitle title={t('common:titleFeed')} />
      <div className="main-container">
        <div className="page-heading">
          <span className="box">
            <FireOutlined />
            {' '}
            {t('common:titleFeed')}
          </span>
        </div>
        <div className="main-background">
          {loading && <Spin />}
          {!loading && items.length > 0 && <ScrollListFeed items={items} canLoadmore={items.length < total} loading={loading} loadMore={onLoadMore.bind(this)} onDelete={handleDeleteFeed.bind(this)} />}
          {!items?.length && !loading && (
            <div className="main-container custom">
              <Alert className="text-center" message={t('common:subToViewFeed')} type="info" />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

Feeds.authenticate = true;

export default Feeds;
