/* eslint-disable react/require-default-props */
import { FileDoneOutlined, UploadOutlined } from '@ant-design/icons';
import { AvatarUpload } from '@components/user/avatar-upload';
import { CoverUpload } from '@components/user/cover-upload';
import { utilsService } from '@services/index';
import {
  Button, Checkbox, Col, DatePicker,
  Form, Input, message, Progress,
  Row, Select, Upload
} from 'antd';
import moment from 'moment';
import getConfig from 'next/config';
import withTranslation from 'next-translate/withTranslation';
import { createRef, PureComponent } from 'react';
import {
  IBody,
  ICountry, ILanguages, IPerformer, IPhoneCodes, ISettings
} from 'src/interfaces';

import style from './accountForm.module.less';

const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const { TextArea } = Input;

type IProps = {
  onFinish: Function;
  user: IPerformer;
  updating?: boolean;
  options?: {
    uploadHeaders?: any;
    avatarUploadUrl?: string;
    onAvatarUploaded?: Function;
    coverUploadUrl?: string;
    onCoverUploaded?: Function;
    beforeUpload?: Function;
    videoUploadUrl?: string;
    onVideoUploaded?: Function;
    uploadPercentage?: number;
  };
  countries?: ICountry[];
  phoneCodes?: IPhoneCodes[];
  languages?: ILanguages[];
  bodyInfo?: IBody;
  i18n: any;
  settings: ISettings;
}

class PerformerAccountForm extends PureComponent<IProps> {
  state = {
    isUploadingVideo: false,
    fileAdded: null,
    uploadVideoPercentage: 0,
    previewVideo: null,
    selectedPhoneCode: 'US_+1',
    phone: null,
    dateOfBirth: '',
    states: [],
    cities: []
  };

  formRef: any;

  componentDidMount() {
    const { user } = this.props;
    user.welcomeVideoPath && this.setState(
      {
        previewVideo: user.welcomeVideoPath
      }
    );
    if (user?.country) {
      this.handleGetStates(user?.country);
      if (user?.state) {
        this.handleGetCities(user?.state, user?.country);
      }
    }
    if (user?.phone) {
      this.setState({ phone: user.phone });
    }
  }

  handleGetStates = async (countryCode: string) => {
    const { user } = this.props;
    const resp = await utilsService.statesList(countryCode);
    const eState = resp.data.find((s) => s === user.state);
    await this.setState({ states: resp.data });
    if (eState) {
      this.formRef.setFieldsValue({ state: eState });
    } else {
      this.formRef.setFieldsValue({ state: '', city: '' });
    }
  };

  handleGetCities = async (state: string, countryCode: string) => {
    const { user } = this.props;
    const resp = await utilsService.citiesList(countryCode, state);
    await this.setState({ cities: resp.data });
    const eCity = resp.data.find((s) => s === user.city);
    if (eCity) {
      this.formRef.setFieldsValue({ city: eCity });
    } else {
      this.formRef.setFieldsValue({ city: '' });
    }
  };

  handleVideoChange = (info: any) => {
    const { t } = this.props.i18n;
    info.file && info.file.percent && this.setState({ uploadVideoPercentage: info.file.percent });
    if (info.file.status === 'uploading') {
      const { isUploadingVideo } = this.state;
      !isUploadingVideo && this.setState({ isUploadingVideo: true });
      return;
    }
    if (info.file.status === 'done') {
      message.success(t('common:successWelcomeVideoChange'));
      this.setState(
        {
          isUploadingVideo: false,
          previewVideo: info?.file?.response?.data?.url || ''
        }
      );
    }
  };

  beforeUpload = (file) => {
    const { t } = this.props.i18n;
    const { publicRuntimeConfig: config } = getConfig();
    const isValid = file.size / 1024 / 1024 < (config.MAX_SIZE_TEASER || 200);
    if (!isValid) {
      message.error(`${t('common:errUploadVideo')} ${config.MAX_SIZE_TEASER || 200}MB!`);
      return false;
    }
    this.setState({ fileAdded: file });
    return true;
  };

  shareRef = async () => {
    const { user } = this.props;
    const { t } = this.props.i18n;
    try {
      const link = `${document.location.origin}/auth/register?ref=${user.referralCode}`;
      await navigator.clipboard.writeText(link);
      message.success(t('common:referralLinkCopied'));
    } catch (e) {
      message.error(t('common:errorWhileCopingReferralLink'));
    }
  };

  render() {
    const { t } = this.props.i18n;
    if (!this.formRef) this.formRef = createRef();
    const {
      onFinish, user, updating, countries, options, languages, phoneCodes, bodyInfo, settings
    } = this.props;
    const {
      heights = [], weights = [], bodyTypes = [], genders = [], sexualOrientations = [], ethnicities = [],
      hairs = [], pubicHairs = [], eyes = [], butts = []
    } = bodyInfo;
    const {
      uploadHeaders, avatarUploadUrl, onAvatarUploaded, coverUploadUrl, onCoverUploaded, videoUploadUrl
    } = options;
    const {
      isUploadingVideo, uploadVideoPercentage, previewVideo, phone, selectedPhoneCode, dateOfBirth, fileAdded, states, cities
    } = this.state;

    const validateMessages = {
      required: t('common:errFieldRequired'),
      types: {
        email: t('common:notValidEmail'),
        number: t('common:notValidNumber')
      },
      number: {
        // eslint-disable-next-line no-template-curly-in-string
        range: 'Must be between ${min} and ${max}'
      }
    };

    return (
      <Form
        {...layout}
        name="nest-messages"
        onFinish={(payload) => {
          const values = payload;
          values.phoneCode = selectedPhoneCode;
          values.dateOfBirth = dateOfBirth;
          onFinish(values);
        }}
        validateMessages={validateMessages}
        initialValues={user}
        labelAlign="left"
        className={style['account-form']}
        ref={(ref) => { this.formRef = ref; }}
      >
        <div
          className={style['top-profile']}
          style={{
            position: 'relative',
            backgroundImage:
              user?.cover
                ? `url('${user.cover}')`
                : "url('/banner-image.jpg')"
          }}
        >
          <div className="avatar-upload">
            <AvatarUpload
              headers={uploadHeaders}
              uploadUrl={avatarUploadUrl}
              onUploaded={onAvatarUploaded}
              image={user.avatar}
            />
          </div>
          <div className="cover-upload">
            <CoverUpload
              headers={uploadHeaders}
              uploadUrl={coverUploadUrl}
              onUploaded={onCoverUploaded}
              options={{ fieldName: 'cover' }}
            />
          </div>
        </div>
        <Row>
          <Col md={12} sm={12} xs={12}>
            <Form.Item
              name="firstName"
              label={t('common:firstName')}
              validateTrigger={['onChange', 'onBlur']}
              rules={[
                { required: true, message: t('common:errRequireFirstName') },
                {
                  pattern: /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                  message:
                    t('common:errRequireFirstNamePattern')
                }
              ]}
            >
              <Input placeholder={t('common:firstName')} />
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item
              name="lastName"
              label={t('common:lastName')}
              validateTrigger={['onChange', 'onBlur']}
              rules={[
                { required: true, message: t('common:errRequireLastName') },
                {
                  pattern: /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                  message:
                    t('common:errPatternLastName')
                }
              ]}
            >
              <Input placeholder={t('common:lastName')} />
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item
              label={t('common:displayName')}
              name="name"
              validateTrigger={['onChange', 'onBlur']}
              rules={[
                { required: true, message: t('common:errMissingName') },
                {
                  pattern: /^(?=.*\S).+$/g,
                  message:
                    t('common:errNameHasWhitespace')
                },
                {
                  min: 3,
                  message: t('common:errLimitName')
                }
              ]}
              hasFeedback
            >
              <Input placeholder={t('common:displayName')} maxLength={100} />
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item name="username" label={t('common:username')} required>
              <Input disabled placeholder={t('common:username')} />
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item name="email" label={t('common:email')} required>
              <Input disabled placeholder={t('common:email')} />
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item name="gender" label={t('common:gender')} rules={[{ required: true, message: t('common:errSelectGender') }]}>
              <Select>
                {genders.map((g) => (
                  <Select.Option value={g.value} key={g.value}>
                    {g.text}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col md={24} xs={24}>
            <Form.Item name="bio" label={t('common:bio')}>
              <TextArea rows={3} placeholder={t('common:bioPlaceholder')} />
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item name="country" rules={[{ required: true, message: t('common:errSelectCountry') }]} label={t('common:country')}>
              <Select
                placeholder={t('common:errSelectCountry')}
                optionFilterProp="label"
                showSearch
                onChange={(val: string) => this.handleGetStates(val)}
              >
                {countries.map((c) => (
                  <Option value={c.code} label={c.name} key={c.code}>
                    <img alt="country_flag" src={c.flag} width="25px" />
                    {' '}
                    {c.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item name="state" label={t('common:state')}>
              <Select
                placeholder={t('common:selectState')}
                optionFilterProp="label"
                showSearch
                onChange={(val: string) => this.handleGetCities(val, this.formRef.getFieldValue('country'))}
              >
                {states.map((state) => (
                  <Option value={state} label={state} key={state}>
                    {state}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item name="city" label={t('common:city')}>
              <Select
                placeholder={t('common:selectCity')}
                optionFilterProp="label"
                showSearch
              >
                {cities.map((city) => (
                  <Option value={city} label={city} key={city}>
                    {city}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item name="address" label={t('common:address')}>
              <Input placeholder={t('common:enterAddress')} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} sm={24}>
            <Form.Item
              label={t('common:dateOfBirth')}
              validateTrigger={['onChange', 'onBlur']}
            >
              <DatePicker
                placeholder="YYYY-MM-DD"
                defaultValue={user?.dateOfBirth ? moment(user.dateOfBirth) as any : ''}
                onChange={(date) => this.setState({ dateOfBirth: date })}
                disabledDate={(currentDate) => currentDate && currentDate > moment().subtract(12, 'year').endOf('day')}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} sm={24}>
            <Form.Item
              name="phone"
              label={t('common:phone')}
              rules={[
                {
                  pattern: /^[0-9]{9,12}$/,
                  message: t('common:errRequirePhoneNumber')
                }
              ]}
            >
              <div className="phone-code">
                <Input
                  placeholder={t('common:errRequirePhoneNumber')}
                  addonBefore={(
                    <Select
                      style={{ minWidth: 300 }}
                      defaultValue={user?.phoneCode || 'US_+1'}
                      optionFilterProp="label"
                      showSearch
                      onChange={(val) => this.setState({ selectedPhoneCode: val })}
                    >
                      {phoneCodes && phoneCodes.map((p) => <Option key={p.code} value={p.code} label={`${p.dialCode} ${p.name}`}>{`${p.dialCode} ${p.name}`}</Option>)}
                    </Select>
                  )}
                  value={phone}
                  onChange={(e) => this.setState({ phone: e.target.value })}
                  style={{ width: '100%' }}
                />

              </div>
            </Form.Item>
          </Col>
          <Col xs={24} md={24}>
            <Form.Item
              name="languages"
              label={t('common:languages')}
            >
              <Select mode="multiple">
                {languages.map((l) => (
                  <Select.Option key={l.code} value={l.name || l.code}>
                    {l.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={24}>
            <Form.Item name="sexualPreference" label={t('common:sexualPreference')}>
              <Select>
                {sexualOrientations.map((s) => (
                  <Select.Option key={s.value} value={s.value}>
                    {s.text}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="ethnicity" label={t('common:ethnicity')}>
              <Select>
                {ethnicities.map((s) => (
                  <Select.Option key={s.value} value={s.value}>
                    {s.text}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="bodyType" label={t('common:bodyType')}>
              <Select>
                {bodyTypes.map((s) => (
                  <Select.Option key={s.value} value={s.value}>
                    {s.text}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="eyes" label={t('common:eyesColor')}>
              <Select>
                {eyes.map((s) => (
                  <Select.Option key={s.value} value={s.value}>
                    {s.text}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="hair" label={t('common:hairColor')}>
              <Select>
                {hairs.map((s) => (
                  <Select.Option key={s.value} value={s.value}>
                    {s.text}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="height" label={t('common:height')}>
              <Select showSearch>
                {heights.map((h) => (
                  <Option key={h.text} value={h.text}>
                    {h.text}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="weight" label={t('common:weight')}>
              <Select showSearch>
                {weights.map((w) => (
                  <Option key={w.text} value={w.text}>
                    {w.text}
                  </Option>
                ))}
                <Option key="" value="">
                  {t('common:unknowWeight')}
                </Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="butt" label={t('common:butt')}>
              <Select>
                {butts.map((s) => (
                  <Select.Option key={s.value} value={s.value}>
                    {s.text}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="pubicHair" label={t('common:pubicHair')}>
              <Select>
                {pubicHairs.map((s) => (
                  <Select.Option key={s.value} value={s.value}>
                    {s.text}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          {settings.referralEnabled && user?.referralCode && (
            <Col md={12} sm={12} xs={24}>
              <Form.Item label={(
                <>
                  {t('common:referralCode')}
                  <a onClick={() => this.shareRef()} aria-hidden>
                    (
                    {t('common:copyInviteLink')}
                    )
                  </a>
                </>
              )}
              >
                <Input disabled value={user.referralCode} />
              </Form.Item>
            </Col>
          )}
          <Col xs={24} md={24}>
            <Form.Item label="Intro Video">
              <Upload
                accept={'video/*'}
                listType="picture-card"
                name="welcome-video"
                showUploadList={false}
                action={videoUploadUrl}
                headers={uploadHeaders}
                beforeUpload={this.beforeUpload.bind(this)}
                onChange={this.handleVideoChange.bind(this)}
              >
                {fileAdded ? <FileDoneOutlined /> : <UploadOutlined />}
              </Upload>
              {(fileAdded || previewVideo) && (
                <div className="ant-form-item-explain" style={{ textAlign: 'left' }}>
                  {(fileAdded && <a>{fileAdded?.name}</a>) || (previewVideo && <a href={previewVideo} target="_.blank">{t('common:clickHereReview')}</a>)}
                </div>
              )}
              {uploadVideoPercentage ? (
                <Progress percent={Math.round(uploadVideoPercentage)} />
              ) : null}
            </Form.Item>
          </Col>
          <Col xs={24} md={24}>
            <Form.Item name="activateWelcomeVideo" valuePropName="checked">
              <Checkbox>
                {t('common:checkActivateIntroVideo')}
              </Checkbox>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item className="text-center">
          <Button
            className="primary"
            htmlType="submit"
            loading={updating}
            disabled={updating || isUploadingVideo}
          >
            {t('common:saveChanges')}
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

export default withTranslation(PerformerAccountForm);
