import { ArrowLeftOutlined, PictureOutlined, VideoCameraOutlined } from '@ant-design/icons';
import Page from '@components/common/layout/page';
import FeedForm from '@components/feed/form';
import style from '@components/feed/index.module.less';
import {
  Layout
} from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import withTranslation from 'next-translate/withTranslation';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IUIConfig } from 'src/interfaces/index';

interface IProps {
  ui: IUIConfig;
  i18n: any;
}

class CreateFeed extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  state = {
    chosenType: false,
    type: ''
  };

  // componentDidMount() {
  //   const { user } = this.props;
  //   if (!user || !user.verifiedDocument) {
  //     message.warning('Your ID documents are not verified yet! You could not post any content right now. Please upload your ID documents to get approval then start making money.');
  //     Router.back();
  //   }
  // }

  render() {
    const { t } = this.props.i18n;
    const { ui } = this.props;
    const { chosenType, type } = this.state;
    return (
      <Layout>
        <Head>
          <title>
            {ui?.siteName}
            {' '}
            |
            {' '}
            {t('common:newFeed')}
          </title>
        </Head>
        <div className="main-container">
          <Page>
            <div className="page-heading">
              <a aria-hidden onClick={() => Router.back()}><ArrowLeftOutlined /></a>
              &nbsp;
              <span>
                {t('common:typeFeed', { type })}
              </span>
            </div>
            <div>
              {!chosenType ? (
                <div className={style['story-switch-type']}>
                  <div aria-hidden className="type-item left" onClick={() => this.setState({ type: 'photo', chosenType: true })}>
                    <span><PictureOutlined /></span>
                    <p>{t('common:createFeedPhoto')}</p>
                  </div>
                  <div aria-hidden className="type-item right" onClick={() => this.setState({ type: 'video', chosenType: true })}>
                    <span><VideoCameraOutlined /></span>
                    <p>{t('common:createFeedVideo')}</p>
                  </div>
                  <div aria-hidden className="type-item middle" onClick={() => this.setState({ type: 'text', chosenType: true })}>
                    <span>Aa</span>
                    <p>{t('common:createFeedText')}</p>
                  </div>
                </div>
              ) : (<FeedForm type={type} discard={() => this.setState({ chosenType: false, type: '' })} />)}
            </div>
          </Page>
        </div>
      </Layout>
    );
  }
}
const mapStates = (state) => ({
  ui: { ...state.ui }
});
export default connect(mapStates)(withTranslation(CreateFeed));
