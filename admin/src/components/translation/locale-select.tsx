import { i18nService } from '@services/i18n.service';
import { Select } from 'antd';
import { useEffect, useMemo, useState } from 'react';

type TLocaleSelect = {
  onChange(val): Function;
  defaultValue?: string | string[];
  multiple?: boolean;
  style?: any;
}

function LocaleSelect({
  onChange,
  defaultValue = '',
  multiple = false,
  style = { width: '200px' }
}: TLocaleSelect) {
  const [val, setVal] = useState(defaultValue);
  const [locales, setLocales] = useState([]);
  const loadLocales = async () => {
    const res = await i18nService.locales();
    setLocales(res.data);
  };

  const renderLocaleOption = useMemo(
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

  if (multiple) {
    return (
      <Select
        style={style}
        onChange={(value) => {
          setVal(value);
          onChange(value);
        }}
        showSearch
        filterOption={(value, option) => {
          const searchStr = `${option.val?.code}-${option.val?.name}`;
          return (searchStr as string).toLowerCase().indexOf(value.toLowerCase()) > -1;
        }}
        value={val}
        defaultValue={val}
        mode="multiple"
      >
        <Select.Option key="" value="">Select your language</Select.Option>
        {renderLocaleOption}
      </Select>
    );
  }

  return (
    <Select
      style={style}
      onChange={(value) => {
        setVal(value);
        onChange(value);
      }}
      showSearch
      filterOption={(value, option) => {
        const searchStr = `${option.val?.code}-${option.val?.name}`;
        return (searchStr as string).toLowerCase().indexOf(value.toLowerCase()) > -1;
      }}
      value={val}
      defaultValue={val}
    >
      <Select.Option key="" value="">Select your language</Select.Option>
      {renderLocaleOption}
    </Select>
  );
}

export default LocaleSelect;
