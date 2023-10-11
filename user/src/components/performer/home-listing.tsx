import { StarOutlined } from '@ant-design/icons';
import { Col, Row, Spin } from 'antd';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';
import { IPerformer } from 'src/interfaces';

import PerformerCard from './card';
import style from './home-listing.module.less';

type IProps = {
  performers: IPerformer[];
  fetching?: boolean;
}

export function HomePerformers({ performers, fetching = false }: IProps) {
  const { t } = useTranslation();
  return (
    <div>
      <Row>
        {performers.length > 0 && performers.map((p: any) => (
          <Col xs={12} sm={12} md={6} lg={6} key={p._id}>
            <PerformerCard performer={p} />
          </Col>
        ))}
      </Row>
      {fetching && <div className="text-center" style={{ margin: 20 }}><Spin /></div>}
      {performers.length > 8 && (
        <div className={style['show-all']}>
          <Link href="/model">
            <a>
              <StarOutlined />
              {' '}
              {t('common:allModels')}
            </a>
          </Link>
        </div>
      )}
    </div>
  );
}

export default HomePerformers;
