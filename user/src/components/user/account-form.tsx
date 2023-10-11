import { AvatarUpload } from '@components/user/avatar-upload';
import {
  Button, Col, Form, Input,
  Row,
  Select
} from 'antd';
import getConfig from 'next/config';
import useTranslation from 'next-translate/useTranslation';
import React from 'react';
import { ICountry, IUser } from 'src/interfaces';

interface UserAccountFormIProps {
  user: IUser;
  updating: boolean;
  onFinish: Function;
  options?: {
    uploadHeader: any;
    avatarUrl: string;
    uploadAvatar: Function;
  };
  countries: ICountry[]
}

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

export function UserAccountForm({
  updating,
  onFinish,
  user,
  countries,
  options = {
    uploadHeader: '',
    avatarUrl: '',
    uploadAvatar: () => {}
  }
}: UserAccountFormIProps) {
  const { publicRuntimeConfig: config } = getConfig();
  const { t } = useTranslation();

  // const settings: ISettings = useSelector((state: any) => state.settings);
  // const shareRef = async () => {
  //   try {
  //     const link = `${document.location.origin}/auth/register?ref=${user.referralCode}`;
  //     await navigator.clipboard.writeText(link);
  //     message.success(t('common:referralLinkCopied'));
  //   } catch (e) {
  //     message.error(t('common:errorWhileCopingReferralLink'));
  //   }
  // };
  return (
    <Form
      className="account-form"
      {...layout}
      name="user-account-form"
      onFinish={(data) => onFinish(data)}
      initialValues={user}
    >
      <Row>
        <Col xs={24} sm={12}>
          <Form.Item
            name="firstName"
            label={t('common:firstName')}
            validateTrigger={['onChange', 'onBlur']}
            rules={[
              { required: true, message: t('common:errRequireFirstName') },
              {
                pattern:
                  /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                message: t('common:errRequireFirstNamePattern')
              }
            ]}
          >
            <Input placeholder={t('common:firstName')} />
          </Form.Item>
          <Form.Item
            name="lastName"
            label={t('common:lastName')}
            validateTrigger={['onChange', 'onBlur']}
            rules={[
              { required: true, message: t('common:errRequireLastName') },
              {
                pattern:
                  /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                message: t('common:errPatternLastName')
              }
            ]}
          >
            <Input placeholder={t('common:lastName')} />
          </Form.Item>
          <Form.Item name="username" label={t('common:username')} required>
            <Input disabled placeholder="username" />
          </Form.Item>
          <Form.Item
            label={t('common:email')}
            name="email"
            required
          >
            <Input disabled placeholder={t('common:email')} />
          </Form.Item>
          {/* {settings.referralEnabled && user?.referralCode && (
          <Form.Item label={(
            <>
              {t('common:referralCode')}
              <a onClick={() => shareRef()} aria-hidden>
                (
                {t('common:copyInviteLink')}
                )
              </a>
            </>
              )}
          >
            <Input disabled value={user.referralCode} />
          </Form.Item>
          )} */}
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label={t('common:displayName')}
            name="name"
            validateTrigger={['onChange', 'onBlur']}
            rules={[
              { required: true, message: t('common:errMissingName') },
              {
                pattern: /^(?=.*\S).+$/g,
                message: t('common:errNameHasWhitespace')
              },
              {
                min: 3,
                message: t('common:errLimitName')
              }
            ]}
            hasFeedback
          >
            <Input placeholder={t('common:displayName')} />
          </Form.Item>
          <Form.Item name="gender" label="Gender" rules={[{ required: true, message: t('common:errSelectGender') }]}>
            <Select>
              <Select.Option value="male" key="male">
                {t('common:male')}
              </Select.Option>
              <Select.Option value="female" key="female">
                {t('common:female')}
              </Select.Option>
              <Select.Option value="transgender" key="transgender">
                {t('common:transgender')}
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="country" label="Country" rules={[{ required: true, message: t('common:errSelectCountry') }]}>
            <Select showSearch optionFilterProp="label">
              {countries.map((c) => (
                <Select.Option value={c.code} key={c.code} label={c.name}>
                  <img alt="country_flag" src={c.flag} width="25px" />
                  {' '}
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <AvatarUpload
              image={user.avatar}
              uploadUrl={options.avatarUrl}
              headers={options.uploadHeader}
              onUploaded={options.uploadAvatar}
            />
            <div className="ant-form-item-explain" style={{ textAlign: 'left' }}>
              {t('common:errAvatarSizeLimit', { size: config.MAX_SIZE_IMAGE || 5 })}
            </div>
          </Form.Item>
        </Col>
      </Row>
      <Form.Item className="text-center">
        <Button htmlType="submit" className="primary" disabled={updating} loading={updating}>
          {t('common:updateProfile')}
        </Button>
      </Form.Item>
    </Form>
  );
}

export default UserAccountForm;
