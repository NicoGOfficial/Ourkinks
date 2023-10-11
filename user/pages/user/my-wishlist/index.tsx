import { ArrowLeftOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import { PerformerListVideo } from '@components/video/performer-list';
import {
  Layout, message, PageHeader,
  Pagination, Spin
} from 'antd';
import Router from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import { videoService } from 'src/services';

function WatchLateVideoPage() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({
    data: [],
    total: 0
  });
  const { t } = useTranslation();
  const limit = 12;

  const getWatchLateVideos = async (page = 1) => {
    try {
      const offset = (page - 1) * limit;
      const resp = await videoService.getWatchLateVideos({
        limit,
        offset
      });
      setResults(resp.data);
      setLoading(false);
    } catch (error) {
      message.error(t('common:errCommon'));
      setLoading(false);
    }
  };

  useEffect(() => {
    getWatchLateVideos();
  }, []);

  return (
    <Layout>
      <PageTitle title={t('common:myWishlist')} />
      <div className="main-container">
        <PageHeader
          onBack={() => Router.back()}
          backIcon={<ArrowLeftOutlined />}
          title={t('common:myWishlist')}
        />
        {!loading && !results.data.length && (
        <div style={{ textAlign: 'center' }}>
          {t('common:noWishlist')}
        </div>
        )}
        {loading && <div className="text-center"><Spin size="large" /></div>}
        {results.data.length > 0 && (
        <PerformerListVideo videos={results.data.map((v) => v?.objectInfo)} />
        )}
        {results.total > limit && (
        <div className="paging">
          <Pagination
            showQuickJumper={false}
            defaultCurrent={1}
            total={results.total}
            pageSize={limit}
            onChange={getWatchLateVideos}
          />
        </div>
        )}
      </div>
    </Layout>
  );
}

WatchLateVideoPage.authenticate = true;

export default WatchLateVideoPage;
