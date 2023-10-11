import {
  RocketOutlined
} from '@ant-design/icons';
import { Banner } from '@components/common';
import SeoMetaHead from '@components/common/seo-meta-head';
import { HomePerformers } from '@components/performer';
import {
  bannerService, performerService, settingService
} from '@services/index';
import {
  Button,
  Layout
} from 'antd';
import Link from 'next/link';
import withTranslation from 'next-translate/withTranslation';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  IBanner, IPerformer,
  IUIConfig, IUser
} from 'src/interfaces';

type IProps = {
  ui: IUIConfig;
  user: IUser;
  banners: IBanner[];
  metaTitle: string,
  metaKeywords: string;
  metaDescription: string;
  i18n: any;
}

interface IStates {
  performers: IPerformer[];
  fetching: boolean;
}

class HomePage extends PureComponent<IProps, IStates> {
  static authenticate = false;

  static noredirect = true;

  static async getInitialProps() {
    try {
      const [banners, meta] = await Promise.all([
        bannerService.search({ limit: 99, status: 'active' }),
        settingService.valueByKeys(['homeMetaKeywords', 'homeMetaDescription', 'homeTitle'])
      ]);
      return {
        banners: banners?.data?.data || [],
        metaKeywords: meta.homeMetaKeywords || '',
        metaDescription: meta.homeMetaDescription || '',
        metaTitle: meta.homeTitle || ''
      };
    } catch (e) {
      return {
        banners: []
      };
    }
  }

  state = {
    fetching: false,
    performers: []
  };

  componentDidMount(): void {
    this.searchPerformers();
  }

  searchPerformers = async () => {
    try {
      this.setState({ fetching: true });
      const resp = await performerService.topModels();
      this.setState({ performers: resp.data, fetching: false });
    } catch (e) {
      this.setState({ fetching: false });
    }
  };

  render() {
    const { t } = this.props.i18n;
    const {
      banners = [], ui, user, metaKeywords, metaDescription, metaTitle
    } = this.props;
    const { performers, fetching } = this.state;
    const topBanners = banners.filter((b) => b.position === 'top');
    const bottomBanners = banners.filter((b) => b.position === 'bottom');
    const seoItem = {
      title: metaTitle,
      description: metaDescription
    };
    return (
      <Layout>
        <SeoMetaHead item={seoItem} pageTitle={metaTitle} keywords={metaKeywords} imageUrl={ui.logo} />
        <div className="home-page">
          {topBanners?.length > 0 && (
            <div className="banner">
              <Banner banners={topBanners} />
            </div>
          )}
          <div style={{ position: 'relative' }}>
            <div className="main-container">
              {performers?.length > 0 ? (
                <HomePerformers performers={performers} fetching={fetching} />
              ) : (
                <p className="text-center">{fetching ? t('common:loading') : t('common:noProfileWasFound')}</p>
              )}

              {bottomBanners?.length > 0 && (
                <Banner effect="fade" arrows={false} dots banners={bottomBanners} />
              )}

              <div className="signup-grp-btns">
                {!user?._id && (
                  <Link href="/auth/model-register">
                    <Button className="primary">
                      <RocketOutlined />
                      {' '}
                      {t('common:becomeAModel')}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  ui: state.ui,
  user: state.user.current
});

const mapDispatch = {};
export default connect(mapStates, mapDispatch)(withTranslation(HomePage));
