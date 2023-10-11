import { getResponseError } from '@lib/utils';
import { i18nService } from '@services/i18n.service';
import { message, Select } from 'antd';
import { SelectProps } from 'antd/lib/select';
import { useEffect, useMemo, useState } from 'react';

const { Option } = Select;

interface P extends SelectProps<string[]> {
  initialLocales?: any[];
}

// eslint-disable-next-line react/require-default-props
function SearchLocales({ initialLocales, ...props }: P) {
  const [locales, setLocales] = useState(initialLocales || []);
  useEffect(() => {
    const getLocales = async () => {
      try {
        const resp = await i18nService.locales();
        setLocales(resp.data);
      } catch (e) {
        const error = await Promise.resolve(e);
        message.error(getResponseError(error));
      }
    };
    !locales.length && getLocales();
  }, []);

  const renderLocaleOption = useMemo(
    () => locales.map((locale) => (
      <Option key={locale.code} value={locale.code}>
        {locale.code}
        -
        {locale.name}
      </Option>
    )),
    [locales]
  );

  return <Select {...props}>{renderLocaleOption}</Select>;
}

SearchLocales.defaultProps = {
  initialLocales: []
};
export default SearchLocales;
