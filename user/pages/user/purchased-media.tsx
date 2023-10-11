import { ArrowLeftOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import VideoCard from '@components/video/video-card';
import {
  Col,
  Layout, message, PageHeader, Pagination, Row, Spin
} from 'antd';
import Router from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import { videoService } from 'src/services';

export function PurchasedMedia() {
  const LIMIT = 12;
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState([]);
  const [total, setTotal] = useState(0);
  const { t } = useTranslation();

  const getMedia = async (page = 1) => {
    try {
      setLoading(true);
      const resp = await videoService.getPurchasedVideos({
        limit: LIMIT,
        offset: (page - 1) * LIMIT
      });
      setTotal(resp.data.total);
      setMedia(resp.data.data);
    } catch (error) {
      message.error(t('common:errCommon'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMedia();
  }, []);

  return (
    <Layout>
      <PageTitle title={t('common:purchasedMedia')} />
      <div className="main-container">
        <PageHeader
          onBack={() => Router.back()}
          backIcon={<ArrowLeftOutlined />}
          title={t('common:purchasedMedia')}
        />
        {media.length > 0 && (
          <Row>
            {media.map((video) => (
              <Col xs={12} sm={12} md={6} lg={6} key={video?._id}>
                <VideoCard video={video} showPrice={false} />
              </Col>
            ))}
          </Row>
        )}
        {!loading && !media.length && (
          <div style={{ textAlign: 'center' }}>
            {t('common:noPurchasedMedia')}
          </div>
        )}
        {loading && <div className="text-center"><Spin size="large" /></div>}
        {total > LIMIT && (
          <div className="paging">
            <Pagination
              showQuickJumper={false}
              defaultCurrent={1}
              total={total}
              pageSize={LIMIT}
              onChange={getMedia}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}

PurchasedMedia.authenticate = true;

export default PurchasedMedia;
