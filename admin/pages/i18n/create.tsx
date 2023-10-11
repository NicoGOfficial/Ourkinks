import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import { getResponseError } from '@lib/utils';
import { i18nService } from '@services/i18n.service';
import {
  Button, Form, Input, message, Select
} from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { useEffect, useState } from 'react';

const { Option } = Select;

function AddNewTranslation() {
  const [locales, setLocales] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (data: any) => {
    try {
      setSubmitting(true);
      await i18nService.createTextTranslation(data);
      message.success('Created successfully');
      Router.push('/i18n');
    } catch (e) {
      // TODO - check and show error here
      const err = (await Promise.resolve(e)) || {};
      message.error(
        getResponseError(err) || 'Something went wrong, please try again!'
      );
      setSubmitting(false);
    }
  };

  const getLocales = async () => {
    try {
      const resp = await i18nService.locales();
      setLocales(resp.data);
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(getResponseError(error));
    }
  };

  const renderLocaleOption = locales.map((locale) => (
    <Option key={locale.code} value={locale.code} val={locale}>
      {locale.code}
      -
      {locale.name}
    </Option>
  ));

  useEffect(() => {
    getLocales();
  }, []);

  return (
    <>
      <Head>
        <title>Text translation</title>
      </Head>
      <BreadcrumbComponent
        breadcrumbs={[
          { title: 'I18n', href: '/i18n' },
          { title: 'Create new key' }
        ]}
      />
      <Page>
        <Form
          onFinish={submit}
          validateMessages={{ required: 'This field is required!' }}
          initialValues={{ locale: 'en' }}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
        >
          <Form.Item label="Key" name="key" rules={[{ required: true }]} help="Unique string to translate.">
            <Input />
          </Form.Item>
          <Form.Item label="Text" name="value" rules={[{ required: true }]} help="Text to be translated">
            <Input />
          </Form.Item>
          <Form.Item
            label="Locale"
            name="locale"
            rules={[{ required: true }]}
            help="Language to be translated"
          >
            <Select
              showSearch
              filterOption={(value, option) => {
                const searchStr = `${option.val?.code}-${option.val?.name}`;
                return (searchStr as string).toLowerCase().indexOf(value.toLowerCase()) > -1;
              }}
            >
              {renderLocaleOption}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button
              htmlType="submit"
              loading={submitting}
              disabled={submitting}
              style={{ float: 'right' }}
              type="primary"
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Page>
    </>
  );
}

export default AddNewTranslation;
