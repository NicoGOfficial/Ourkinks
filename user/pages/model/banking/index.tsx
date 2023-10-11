import {
  ArrowLeftOutlined
} from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import {
  PerformerPaypalForm
} from '@components/performer';
import PerformerBankingForm from '@components/performer/bankingForm';
import { getResponseError } from '@lib/utils';
import {
  performerService, utilsService
} from '@services/index';
import {
  Layout, message, PageHeader,
  Tabs
} from 'antd';
import Router from 'next/router';
import withTranslation from 'next-translate/withTranslation';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  IBanking, IPerformer
} from 'src/interfaces';
import {
  updateCurrentUserAvatar, updateCurrentUserCover,
  updatePerformer
} from 'src/redux/user/actions';

type IProps = {
  currentUser: IPerformer;
  countries: any;
  i18n: any;
}

class AccountSettings extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  static async getInitialProps() {
    const [countries] = await Promise.all([
      utilsService.countriesList()
    ]);
    return {
      countries: countries?.data || []
    };
  }

  state = {
    submiting: false
  };

  async handleUpdateBanking(data: IBanking) {
    const { t } = this.props.i18n;
    try {
      this.setState({ submiting: true });
      const { currentUser } = this.props;
      const info = { ...data, performerId: currentUser._id };
      await performerService.updateBanking(currentUser._id, info);
      this.setState({ submiting: false });
      message.success(t('common:successUpdateBanking'));
    } catch (error) {
      this.setState({ submiting: false });
      message.error(getResponseError(await error) || t('common:errCommon'));
    }
  }

  async handleUpdatePaypal(data) {
    const { t } = this.props.i18n;
    const { currentUser } = this.props;
    try {
      this.setState({ submiting: false });
      const payload = { key: 'paypal', value: data, performerId: currentUser._id };
      await performerService.updatePaymentGateway(currentUser._id, payload);
      message.success(t('common:paypalUpdateSuccess'));
      this.setState({ submiting: false });
    } catch (e) {
      const err = await e;
      message.error(err?.message || t('common:errCommon'));
      this.setState({ submiting: false });
    }
  }

  render() {
    const { t } = this.props.i18n;
    const {
      currentUser, countries
    } = this.props;
    const { submiting } = this.state;
    return (
      <Layout>
        <PageTitle title={t('common:titleBanking')} />
        <div className="main-container user-account">
          <PageHeader
            onBack={() => Router.back()}
            backIcon={<ArrowLeftOutlined />}
            title={t('common:titleBanking')}
          />
          <Tabs
            defaultActiveKey="basic"
            tabPosition="top"
            className="nav-tabs"
          >
            <Tabs.TabPane
              tab={(
                <span>
                  <img src="/banking-ico.png" alt="banking" height="25px" />
                </span>
              )}
              key="bankInfo"
            >
              <PerformerBankingForm
                onFinish={this.handleUpdateBanking.bind(this)}
                updating={submiting}
                user={currentUser}
                countries={countries}
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={(
                <span>
                  <img src="/paypal-ico.png" alt="paypal" height="25px" />
                </span>
              )}
              key="paypalInfo"
            >
              <PerformerPaypalForm
                onFinish={this.handleUpdatePaypal.bind(this)}
                updating={submiting}
                user={currentUser}
              />
            </Tabs.TabPane>
          </Tabs>
        </div>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  currentUser: state.user.current,
  updating: state.user.updating
});
const mapDispatch = {
  updatePerformer,
  updateCurrentUserAvatar,
  updateCurrentUserCover
};
export default connect(mapStates, mapDispatch)(withTranslation(AccountSettings));
