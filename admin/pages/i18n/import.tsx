import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import { getResponseError } from '@lib/utils';
import { i18nService } from '@services/i18n.service';
import {
  Button, Form, message, Select
} from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { useEffect, useState } from 'react';

const { Option } = Select;

function ImportTranslation() {
  const [locales, setLocales] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (data: any) => {
    try {
      setSubmitting(true);
      await i18nService.importTextTranslation(data);
      message.success('Import successfully');
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
        <title>Import translation</title>
      </Head>
      <BreadcrumbComponent
        breadcrumbs={[
          { title: 'I18n', href: '/i18n' },
          { title: 'Import' }
        ]}
      />
      <Page>
        <Form
          onFinish={submit}
          validateMessages={{ required: 'This field is required!' }}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
        >
          <Form.Item
            label="Locale"
            name="locale"
            rules={[{ required: true }]}
            help="Select language to be imported from default language. System will create default text for that languages"
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

export default ImportTranslation;
