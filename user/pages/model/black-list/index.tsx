import { ArrowLeftOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import PerformerBlockCountriesForm from '@components/performer/block-countries-form';
import { SelectUserDropdown } from '@components/user';
import UsersBlockList from '@components/user/users-block-list';
import {
  Button, Form, Input, Layout, message, Modal, PageHeader, Tabs
} from 'antd';
import Router from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { ICountry, IPerformer } from 'src/interfaces';
import { blockService, utilsService } from 'src/services';

type IProps = {
  countries: ICountry[];
  user: IPerformer;
}

function BlacklistPage({ countries, user }: IProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [submiting, setSubmiting] = useState(false);
  const [limit] = useState(12);
  const [offset, setOffset] = useState(0);
  const [blockUserId, setBlockUserId] = useState('');
  const [userBlockedList, setUserBlockedList] = useState([]);
  const [totalBlockedUsers, setTotalBlockedUsers] = useState(0);
  const [openBlockModal, setOpenBlockModal] = useState(false);

  const handleUnblockUser = async (userId: string) => {
    if (!window.confirm(t('common:confirmHandleUnblockUser'))) return;
    try {
      await setSubmiting(true);
      await blockService.unBlockUser(userId);
      setUserBlockedList(userBlockedList.filter((u) => u.targetId !== userId));
      setSubmiting(false);
      message.success(t('common:successHandleUnblockUser'));
    } catch (e) {
      const err = await e;
      message.error(err?.message || t('common:errCommon'));
      setSubmiting(false);
    }
  };

  const handleUpdateBlockCountries = async (data) => {
    try {
      await setSubmiting(true);
      await blockService.blockCountries(data);
      message.success(t('common:successBlockCountries'));
      setSubmiting(false);
    } catch (e) {
      const err = await e;
      message.error(err?.message || t('common:errCommon'));
      setSubmiting(false);
    }
  };

  const getBlockList = async () => {
    try {
      await setLoading(true);
      const kq = await blockService.getBlockListUsers({
        limit,
        offset: offset * limit
      });
      setUserBlockedList(kq.data.data);
      setTotalBlockedUsers(kq.data.data);
      setLoading(false);
    } catch (e) {
      message.error(t('common:errCommon'));
      setLoading(false);
    }
  };

  useEffect(() => {
    getBlockList();
  }, []);

  const handlePageChange = async (data) => {
    await setOffset(data.current - 1);
    getBlockList();
  };

  const blockUser = async (data) => {
    if (!blockUserId) {
      message.error(t('common:errBlockUser'));
      return;
    }
    try {
      await setSubmiting(true);
      await blockService.blockUser({ targetId: blockUserId, target: 'user', reason: data.reason });
      await setSubmiting(false);
      await setOpenBlockModal(false);
      message.success(t('common:successBlockUser'));
      getBlockList();
    } catch (e) {
      const err = await e;
      message.error(err?.message || t('common:errCommon'));
      setSubmiting(false);
      setOpenBlockModal(false);
    }
  };

  return (
    <Layout>
      <PageTitle title="Blacklist" />
      <div className="main-container">
        <PageHeader
          onBack={() => Router.back()}
          backIcon={<ArrowLeftOutlined />}
          title={t('common:blackList')}
        />
        <Tabs>
          <Tabs.TabPane key="block-user" tab={<span>{t('common:blackListUser')}</span>}>
            <div className="block-user">
              <Button className="" type="primary" onClick={() => setOpenBlockModal(true)}>
                {t('common:btnBlockUser')}
              </Button>
            </div>
            <div className="users-blocked-list">
              <UsersBlockList
                items={userBlockedList}
                searching={loading}
                total={totalBlockedUsers}
                onPaginationChange={(data) => handlePageChange(data)}
                pageSize={limit}
                submiting={submiting}
                unblockUser={(userId) => handleUnblockUser(userId)}
              />
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane key="block-countries" tab={<span>{t('common:blackListCountries')}</span>}>
            <PerformerBlockCountriesForm
              onFinish={(data) => handleUpdateBlockCountries(data)}
              updating={submiting}
              blockCountries={user.blockCountries}
              countries={countries}
            />
          </Tabs.TabPane>
        </Tabs>

      </div>
      <Modal
        title="Block user"
        visible={openBlockModal}
        onCancel={() => setOpenBlockModal(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          name="blockForm"
          onFinish={(data) => blockUser(data)}
          initialValues={{
            reason: 'Disturbing'
          }}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          className="account-form"
        >
          <Form.Item label={t('common:labelSelectUserToBlock')}>
            <SelectUserDropdown onSelect={(val) => setBlockUserId(val)} />
          </Form.Item>
          <Form.Item
            name="reason"
            label={t('common:reason')}
            rules={[{ required: true, message: t('common:enterReason') }]}
          >
            <Input.TextArea maxLength={150} showCount />
          </Form.Item>
          <Form.Item>
            <Button
              className="primary"
              htmlType="submit"
              loading={submiting}
              disabled={submiting}
            >
              {t('common:submit')}
            </Button>
            <Button
              className="secondary"
              onClick={() => setOpenBlockModal(false)}
            >
              {t('common:close')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}

BlacklistPage.onlyPerformer = true;

BlacklistPage.authenticate = true;

BlacklistPage.getInitialProps = async () => {
  const [countries] = await Promise.all([
    utilsService.countriesList()
  ]);
  return {
    countries: countries?.data || []
  };
};

const mapStates = (state) => ({
  user: state.user.current
});

export default connect(mapStates)(BlacklistPage);
