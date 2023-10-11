/* eslint-disable react/prop-types */
import { i18nService } from '@services/i18n.service';
import {
  Button, Form, Input, message, Select
} from 'antd';
import dynamic from 'next/dynamic';
import {
  useEffect, useMemo, useRef, useState
} from 'react';

const CustomSunEditor = dynamic(() => import('src/components/common/base/custom-sun-editor'), {
  ssr: false
});

function TranslationForm({
  /**
   * field: 'title',
      props: {
        name: 'title',
        label: 'Title',
        rules: [{ required: true, message: 'Please input title!' }],
        children: <Input placeholder="Enter your title" />
      },
      editable: true
   */
  rows = [],
  item,
  itemType
}) {
  const [form] = Form.useForm();
  const [locales, setLocales] = useState([]);
  const [locale, setLocale] = useState('');
  const [loading, setLoading] = useState(false);
  const translationRef = useRef<any>({});
  /**
   * @type {React.MutableRefObject<SunEditor>} get type definitions for editor
   * TODO - support 1 editor right now, need to fix
   */
  const editorRef = useRef(null);

  const onFinish = async (values) => {
    setLoading(true);
    const textEditorValues = rows.reduce((results, row) => {
      // eslint-disable-next-line no-param-reassign
      if (row.editor) results[row.field] = translationRef.current[row.field] || '';

      return results;
    }, {} as any);
    await i18nService.createModelTranslation({
      ...values,
      ...textEditorValues,
      source: itemType,
      sourceId: item._id
    });
    message.success('Content has been translated successfully!');
  };

  const onTextEditorChange = (row, value) => {
    translationRef.current[row.field] = value;
  };

  const getInput = (row) => {
    const disabled = !row.editable || false;

    if (row.editor) {
      const content = translationRef.current[row.field] || '';
      return <CustomSunEditor editorRef={editorRef} onChange={(text) => onTextEditorChange(row, text)} content={content} />;
    } if (row.textarea) {
      return <Input.TextArea {...(row.props || {})} rows={3} disabled={disabled} />;
    }

    return <Input disabled={disabled} {...(row.props || {})} />;
  };

  const loadLocales = async () => {
    const res = await i18nService.locales();
    setLocales(res.data);
  };

  const resetEditorValue = () => {
    if (editorRef.current) {
      rows.forEach((row) => {
        if (row.editor) editorRef.current.setContents(translationRef.current[row.field]);
      });
    }
  };

  const loadTranslate = async () => {
    setLoading(true);
    translationRef.current = {};
    const res = await i18nService.getTranslationByLocale(item._id, locale);
    const data = res.data || {};
    rows.forEach((row) => {
      form.setFieldValue(row.field, data[row.field] || '');
    });
    translationRef.current = data;
    resetEditorValue();
    setLoading(false);
  };

  const renderLocaleOption = useMemo(
    // eslint-disable-next-line no-shadow
    () => locales.map((locale) => (
      <Select.Option key={locale.code} value={locale.code} val={locale}>
        {locale.code}
        -
        {locale.name}
      </Select.Option>
    )),
    [locales]
  );

  useEffect(() => {
    loadLocales();
  }, []);

  useEffect(() => {
    if (!locale) return;
    loadTranslate();
  }, [locale]);

  return (
    <Form
      form={form}
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 20 }}
      onFinish={onFinish}
    >
      <Form.Item label="Locales" name="locale" required help="Select language to translate">
        <Select
          onChange={setLocale}
          showSearch
          filterOption={(value, option) => {
            const searchStr = `${option.val?.code}-${option.val?.name}`;
            return (searchStr as string).toLowerCase().indexOf(value.toLowerCase()) > -1;
          }}
        >
          <Select.Option key="" value="">Select your language</Select.Option>
          {renderLocaleOption}
        </Select>
      </Form.Item>

      {locale && rows.map((row) => (
        <Form.Item
          {...(row.props || {})}
          key={`${locale}_${row.field}`}
        >
          {getInput(row)}
        </Form.Item>
      ))}

      {locale && (
      <Form.Item wrapperCol={{ offset: 4 }}>
        <Button
          type="primary"
          htmlType="submit"
          style={{ float: 'right' }}
          loading={loading}
          disabled={loading}
        >
          Submit
        </Button>
      </Form.Item>
      )}
    </Form>
  );
}

export default TranslationForm;
