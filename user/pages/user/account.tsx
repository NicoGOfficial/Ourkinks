import {
  SettingOutlined
} from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import { UserAccountForm } from '@components/user/account-form';
import { UpdatePaswordForm } from '@components/user/update-password-form';
import { getResponseError } from '@lib/utils';
import { Layout, message, Tabs } from 'antd';
import withTranslation from 'next-translate/withTranslation';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { ICountry } from 'src/interfaces';
import { IUser, IUserFormData } from 'src/interfaces/user';
import {
  updateCurrentUserAvatar,
  updateUser
} from 'src/redux/user/actions';
import { authService, userService, utilsService } from 'src/services';

import style from './user.module.less';

type IProps = {
  user: IUser;
  updating: boolean;
  updateUser: Function;
  updateCurrentUserAvatar: Function;
  updateSuccess: boolean;
  error: any;
  countries: ICountry[];
  i18n: any;
}
interface IState {
  pwUpdating: boolean;
}

class UserAccountSettingPage extends PureComponent<IProps, IState> {
  static authenticate = true;

  static async getInitialProps() {
    const [countries] = await Promise.all([
      utilsService.countriesList()
    ]);
    return {
      countries: countries?.data || []
    };
  }

  state = { pwUpdating: false };

  componentDidUpdate(preProps: IProps) {
    const { error, updateSuccess, i18n } = this.props;
    const { t } = i18n;
    if (error !== preProps.error) {
      message.error(getResponseError(error));
    }
    if (updateSuccess && updateSuccess !== preProps.updateSuccess) {
      message.success(t('common:changesSaved'));
    }
  }

  onFinish(data: IUserFormData) {
    const { updateUser: handleUpdate } = this.props;
    handleUpdate(data);
  }

  uploadAvatar(data) {
    const { updateCurrentUserAvatar: handleUpdateAvatar } = this.props;
    handleUpdateAvatar(data.response.data.url);
  }

  async updatePassword(data: any) {
    const { t } = this.props.i18n;
    try {
      await this.setState({ pwUpdating: true });
      await authService.updatePassword(data.password, 'user');
      message.success(t('common:changesSaved'));
    } catch (e) {
      const err = await e;
      message.error(err?.message || t('common:errCommon'));
    } finally {
      this.setState({ pwUpdating: false });
    }
  }

  render() {
    const {
      user, updating, countries, i18n
    } = this.props;
    const { t } = i18n;
    const { pwUpdating } = this.state;
    const uploadHeader = {
      authorization: authService.getToken()
    };
    return (
      <Layout>
        <PageTitle title={t('common:editProfile')} />
        <div className="main-container">
          <div className={style['user-account']}>
            <h3 className="page-heading" style={{ marginBottom: 0 }}>
              <SettingOutlined />
              {' '}
              {t('common:editProfile')}
            </h3>
            <Tabs
              defaultActiveKey="user-profile"
              tabPosition="top"
              className="nav-tabs"
            >
              <Tabs.TabPane tab={<span>{t('common:basicInfo')}</span>} key="basic">
                <UserAccountForm
                  onFinish={this.onFinish.bind(this)}
                  updating={updating}
                  user={user}
                  options={{
                    uploadHeader,
                    avatarUrl: userService.getAvatarUploadUrl(),
                    uploadAvatar: this.uploadAvatar.bind(this)
                  }}
                  countries={countries}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={<span>{t('common:changePassword')}</span>} key="password">
                <UpdatePaswordForm
                  onFinish={this.updatePassword.bind(this)}
                  updating={pwUpdating}
                />
              </Tabs.TabPane>
            </Tabs>
          </div>
        </div>
      </Layout>
    );
  }
}
const mapStates = (state) => ({
  user: state.user.current,
  updating: state.user.updating,
  error: state.user.error,
  updateSuccess: state.user.updateSuccess
});
const mapDispatch = {
  updateUser, updateCurrentUserAvatar
};
export default connect(mapStates, mapDispatch)(
  withTranslation(UserAccountSettingPage)
);
