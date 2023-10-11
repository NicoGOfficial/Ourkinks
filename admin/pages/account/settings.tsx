import Page from '@components/common/layout/page';
import { AccountForm } from '@components/user/account-form';
import { UpdatePaswordForm } from '@components/user/update-password-form';
import { authService, userService } from '@services/index';
import { utilsService } from '@services/utils.service';
import { message, Tabs } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { ICountry, IUser } from 'src/interfaces';
import { updateCurrentUserAvatar, updateUser } from 'src/redux/user/actions';

interface IProps {
  currentUser: IUser;
  updateUser: Function;
  updating?: boolean;
  updateCurrentUserAvatar: Function;
  countries: ICountry[];
  updateSuccess?: boolean;
}
class AccountSettings extends PureComponent<IProps> {
  static async getInitialProps(ctx) {
    const resp = await utilsService.countriesList();
    return {
      countries: resp.data,
      ...ctx.query
    };
  }

  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    updating: false,
    updateSuccess: false
  };

  state = {
    pwUpdating: false
  };

  componentDidUpdate(prevProps: any) {
    const { updateSuccess: handlerUpdate } = this.props;
    if (
      prevProps.updateSuccess !== handlerUpdate
      && handlerUpdate
    ) {
      message.success('Updated successfully!');
    }
  }

  onAvatarUploaded(data: any) {
    const { updateCurrentUserAvatar: updateAvatar } = this.props;
    message.success('Avatar has been updated!');
    updateAvatar(data.base64);
  }

  submit(data: any) {
    const { updateUser: handlerUpdateUser, currentUser } = this.props;
    handlerUpdateUser({ ...data, _id: currentUser._id });
  }

  async updatePassword(data: any) {
    try {
      this.setState({ pwUpdating: true });
      await authService.updatePassword(data.password);
      message.success('Password has been updated!');
    } catch (e) {
      message.error('An error occurred, please try again!');
    } finally {
      this.setState({ pwUpdating: false });
    }
  }

  render() {
    const { currentUser, updating, countries } = this.props;
    const { pwUpdating } = this.state;
    const uploadHeaders = {
      authorization: authService.getToken()
    };
    return (
      <Page>
        <Head>
          <title>Account Settings</title>
        </Head>
        <Tabs defaultActiveKey="basic" tabPosition="top">
          <Tabs.TabPane tab={<span>Basic info</span>} key="basic">
            <AccountForm
              onFinish={this.submit.bind(this)}
              user={currentUser}
              updating={updating}
              options={{
                uploadHeaders,
                avatarUploadUrl: userService.getAvatarUploadUrl(),
                onAvatarUploaded: this.onAvatarUploaded.bind(this)
              }}
              countries={countries}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab={<span>Change password</span>} key="password">
            <UpdatePaswordForm
              onFinish={this.updatePassword.bind(this)}
              updating={pwUpdating}
            />
          </Tabs.TabPane>
        </Tabs>
      </Page>
    );
  }
}

const mapStates = (state: any) => ({
  currentUser: state.user.current,
  updating: state.user.updating,
  updateSuccess: state.user.updateSuccess
});
const mapDispatch = { updateUser, updateCurrentUserAvatar };
export default connect(mapStates, mapDispatch)(AccountSettings);