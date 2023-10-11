import {
  Button, Form,
  Input, Select
} from 'antd';
import useTranslation from 'next-translate/useTranslation';

import style from './report.module.less';

type IProps = {
  onFinish: Function;
  submiting: boolean;
}

function ReportForm({ onFinish, submiting }: IProps) {
  const { t } = useTranslation();
  return (
    <Form
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      name="report-form"
      className={style['report-form']}
      onFinish={(values) => onFinish(values)}
      initialValues={{ title: '', description: '' }}
    >
      <Form.Item
        label={t('common:title')}
        name="title"
        rules={[
          { required: true, message: t('common:selectTitle') }
        ]}
        validateTrigger={['onChange', 'onBlur']}
      >
        <Select>
          <Select.Option value="Violent or repulsive content" key="Violent or repulsive content">{t('common:reportContentViolent')}</Select.Option>
          <Select.Option value="Hateful or abusive content" key="Hateful or abusive content">{t('common:reportContentHateful')}</Select.Option>
          <Select.Option value="Harassment or bullying" key="Harassment or bullying">{t('common:reportContentHarassment')}</Select.Option>
          <Select.Option value="Harmful or dangerous acts" key="Harmful or dangerous acts">{t('common:reportContentHarmful')}</Select.Option>
          <Select.Option value="Child abuse" key="Child abuse">{t('common:reportContentChildAbuse')}</Select.Option>
          <Select.Option value="Promotes terrorism" key="Promotes terrorism">{t('common:reportContentPromotes')}</Select.Option>
          <Select.Option value="Spam or misleading" key="Spam or misleading">{t('common:reportContentSpam')}</Select.Option>
          <Select.Option value="Infringes my rights" key="Infringes my rights">{t('common:reportContentInfringes')}</Select.Option>
          <Select.Option value="Others" key="Others">{t('common:others')}</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Input.TextArea placeholder="Tell us reason why you report" minLength={5} showCount maxLength={100} rows={3} />
      </Form.Item>
      <div className="report-form-btn">
        <Button type="primary" disabled={submiting} loading={submiting} htmlType="submit">{t('common:sendReport')}</Button>
      </div>
    </Form>
  );
}

export default ReportForm;
