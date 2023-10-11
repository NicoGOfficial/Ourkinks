import { StarOutlined } from '@ant-design/icons';
import SeoMetaHead from '@components/common/seo-meta-head';
import PerformerCard from '@components/performer/card';
import { performerService } from '@services/index';
import {
  Col, Layout, Pagination, Row, Spin
} from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';

function SearchLive() {
  const { t } = useTranslation();
  const limit = 12;

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({
    data: [],
    total: 0
  });

  const loadData = async (page = 1) => {
    const offset = (page - 1) * limit;
    setLoading(true);
    const resp = await performerService.search({
      limit,
      offset,
      sortBy: 'onlineAt',
      isStreaming: 1
    });
    setResults(resp.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Layout>
      <SeoMetaHead item={{
        title: t('common:liveModel')
      }}
      />
      <div className="main-container">
        <h3 className="page-heading">
          <span className="box">
            <StarOutlined />
            {' '}
            {t('common:liveModel')}
          </span>
        </h3>
        <Row>
          {results.data.map((p: any) => (
            <Col xs={12} sm={12} md={6} lg={6} key={p._id}>
              <PerformerCard performer={p} linkToLiveStream />
            </Col>
          ))}
        </Row>
        {!results.total && !loading && <p className="text-center">{t('common:noStreamingModels')}</p>}
        {loading && <div className="text-center" style={{ margin: 30 }}><Spin /></div>}
        {results.total > limit ? (
          <div className="paging">
            <Pagination
              total={results.total}
              pageSize={limit}
              onChange={loadData}
              showSizeChanger={false}
            />
          </div>
        ) : null}
      </div>
    </Layout>
  );
}

export default SearchLive;
