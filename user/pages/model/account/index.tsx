import {
  ArrowLeftOutlined
} from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import {
  PerformerPaypalForm,
  PerformerSubscriptionForm
} from '@components/performer';
import PerformerAccountForm from '@components/performer/accountForm';
import PerformerBankingForm from '@components/performer/bankingForm';
import ChatPriceForm from '@components/performer/chat-price-form';
import PerformerVerificationForm from '@components/performer/verificationForm';
import { UpdatePaswordForm } from '@components/user/update-password-form';
import { getResponseError } from '@lib/utils';
import {
  authService, performerService, userService,
  utilsService
} from '@services/index';
import {
  Layout, message, PageHeader, Tabs
} from 'antd';
import Router from 'next/router';
import withTranslation from 'next-translate/withTranslation';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  IPerformer, ISettings
} from 'src/interfaces';
import {
  updateCurrentUser,
  updateCurrentUserAvatar, updateCurrentUserCover, updatePerformer
} from 'src/redux/user/actions';

type IProps = {
  currentUser: IPerformer;
  updatePerformer: Function;
  updating: boolean;
  updateCurrentUserAvatar: Function;
  updateCurrentUserCover: Function;
  updateCurrentUser: Function;
  phoneCodes: any;
  languages: any;
  countries: any;
  error: any;
  updateSuccess: any;
  bodyInfo: any;
  i18n: any;
  settings: ISettings;
}

class AccountSettings extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  static async getInitialProps() {
    const [countries, phoneCodes, languages, bodyInfo] = await Promise.all([
      utilsService.countriesList(),
      utilsService.phoneCodesList(),
      utilsService.languagesList(),
      utilsService.bodyInfo()
    ]);
    return {
      countries: countries?.data || [],
      phoneCodes: phoneCodes?.data || [],
      languages: languages?.data || [],
      bodyInfo: bodyInfo?.data
    };
  }

  state = {
    submiting: false
  };

  componentDidMount() {
    const { t } = this.props.i18n;
    const { currentUser } = this.props;
    if (!currentUser || (currentUser && !currentUser.isPerformer)) {
      message.error(t('common:errNoPermission'));
      Router.push('/');
    }

    this.loadProfile();
  }

  componentDidUpdate(prevProps: Readonly<IProps>): void {
    const { t } = this.props.i18n;
    const { error, updateSuccess } = this.props;
    if (error && error !== prevProps.error) {
      message.error(getResponseError(error));
    }

    if (updateSuccess && updateSuccess !== prevProps.updateSuccess) {
      message.success(t('common:changesSaved'));
    }
  }

  onCoverUploaded(data: any) {
    const { t } = this.props.i18n;
    const {
      updateCurrentUserCover: updateCurrentUserCoverHandler
    } = this.props;
    message.success(t('common:changesSaved'));
    updateCurrentUserCoverHandler(data.response.data.url);
  }

  onAvatarUploaded = (data: any) => {
    const { t } = this.props.i18n;
    const {
      updateCurrentUserAvatar: updateCurrentUserAvatarHandler
    } = this.props;
    message.success(t('common:changesSaved'));
    updateCurrentUserAvatarHandler(data.response.data.url);
  };

  handleUpdateBanking = async (data) => {
    const { t } = this.props.i18n;
    try {
      this.setState({ submiting: true });
      const { currentUser } = this.props;
      const info = { ...data, performerId: currentUser._id };
      await performerService.updateBanking(currentUser._id, info);
      this.setState({ submiting: false });
      message.success(t('common:successUpdateBanking'));
      this.loadProfile();
    } catch (error) {
      this.setState({ submiting: false });
      const err = await error;
      message.error(err?.message || t('common:errCommon'));
    }
  };

  handleUpdatePaypal = async (data) => {
    const { t } = this.props.i18n;
    const { currentUser } = this.props;
    try {
      this.setState({ submiting: false });
      const payload = { key: 'paypal', value: data, performerId: currentUser._id };
      await performerService.updatePaymentGateway(currentUser._id, payload);
      message.success(t('common:paypalUpdateSuccess'));
      this.setState({ submiting: false });
      this.loadProfile();
    } catch (e) {
      const err = await e;
      message.error(err?.message || t('common:errCommon'));
      this.setState({ submiting: false });
    }
  };

  submit = async (data: any) => {
    const { t } = this.props.i18n;
    try {
      const {
        currentUser, updatePerformer: updatePerformerHandler
      } = this.props;
      updatePerformerHandler({
        ...currentUser,
        ...data
      });
    } catch (error) {
      const err = await Promise.resolve(error);
      message.error(err?.message || t('common:errCommon'));
    }
  };

  updatePassword = async (data: any) => {
    const { t } = this.props.i18n;
    try {
      this.setState({ submiting: true });
      await authService.updatePassword(data.password, 'performer');
      message.success(t('common:changesSaved'));
    } catch (e) {
      message.error(t('common:error'));
    } finally {
      this.setState({ submiting: false });
    }
  };

  loadProfile = async () => {
    const user = await userService.me();
    const { updateCurrentUser: updateCurrentUserHandler } = this.props;
    updateCurrentUserHandler(user.data);
  };

  render() {
    const { t } = this.props.i18n;
    const {
      currentUser, updating, phoneCodes, languages, bodyInfo, countries, settings
    } = this.props;
    const { submiting } = this.state;
    const uploadHeaders = {
      authorization: authService.getToken()
    };
    return (
      <Layout>
        <PageTitle title={t('common:editProfile')} />
        <div className="main-container user-account">
          <PageHeader
            onBack={() => Router.back()}
            backIcon={<ArrowLeftOutlined />}
            title={t('common:editProfile')}
          />
          <Tabs defaultActiveKey="basic" tabPosition="top" className="nav-tabs">
            <Tabs.TabPane tab={<span>{t('common:basicProfile')}</span>} key="basic">
              <PerformerAccountForm
                onFinish={this.submit.bind(this)}
                user={currentUser}
                updating={updating}
                options={{
                  uploadHeaders,
                  avatarUploadUrl: performerService.getAvatarUploadUrl(),
                  onAvatarUploaded: this.onAvatarUploaded.bind(this),
                  coverUploadUrl: performerService.getCoverUploadUrl(),
                  onCoverUploaded: this.onCoverUploaded.bind(this),
                  videoUploadUrl: performerService.getVideoUploadUrl()
                }}
                countries={countries}
                phoneCodes={phoneCodes}
                languages={languages}
                bodyInfo={bodyInfo}
                settings={settings}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab={<span>{t('common:verification')}</span>} key="verification">
              <PerformerVerificationForm
                onFinish={this.submit.bind(this)}
                updating={updating}
                user={currentUser}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab={t('common:streamSetting')} key="stream-setting">
              <ChatPriceForm
                updating={updating}
                onFinish={this.submit.bind(this)}
                user={currentUser}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab={<span>{t('common:subscription')}</span>} key="subscription">
              <PerformerSubscriptionForm
                onFinish={this.submit.bind(this)}
                updating={updating}
                user={currentUser}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab={<span>{t('common:banking')}</span>} key="banking">
              <PerformerBankingForm
                onFinish={this.handleUpdateBanking.bind(this)}
                updating={submiting}
                user={currentUser}
                countries={countries}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab={<span>{t('common:paypal')}</span>} key="paypal">
              <PerformerPaypalForm
                onFinish={this.handleUpdatePaypal.bind(this)}
                updating={submiting}
                user={currentUser}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab={<span>{t('common:changePassword')}</span>} key="password">
              <UpdatePaswordForm
                onFinish={this.updatePassword.bind(this)}
                updating={submiting}
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
  updating: state.user.updating,
  error: state.user.error,
  ...state.user,
  settings: state.settings
});
const mapDispatch = {
  updatePerformer,
  updateCurrentUserAvatar,
  updateCurrentUserCover,
  updateCurrentUser
};
export default connect(mapStates, mapDispatch)(withTranslation(AccountSettings));
