/* eslint-disable no-shadow */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { settingService } from '@services/setting.service';
import { utilsService } from '@services/utils.service';
import { Select } from 'antd';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

function ChangeLanguageDropdown() {
  const [lang, setLang] = useState('');
  const [languages, setLanguages] = useState([]);
  const router = useRouter();

  const loadLang = async () => {
    const settings = await settingService.valueByKeys(['languages']);
    if (settings.languages?.length) {
      const languageList = await utilsService.languagesList();
      const results = settings.languages.map((lang) => {
        const country = languageList.data.find((c) => c.code.toLowerCase() === lang.toLowerCase());
        return {
          lang,
          ...(country || {})
        };
      });
      setLanguages(results);
    }
  };

  const onChange = (lang) => {
    router.push(router.pathname, router.asPath, { locale: lang });

    router.events.on('routeChangeComplete', () => {
      router.reload();
    });
  };

  useEffect(() => {
    loadLang();
    const { locale } = router;
    setLang(locale);
  }, []);

  if (!languages.length) return null;

  return (
    <div style={{ margin: '0 auto' }}>
      <label style={{ color: '#fff' }}>Select language </label>
      <Select
        style={{ width: '150px' }}
        value={lang}
        placeholder="Select your language"
        onChange={onChange}
      >
        {languages.map((lang) => (
          <Select.Option key={lang.code} value={lang.code}>
            <div className="option-label-item">
              {lang.code}
              {' '}
              -
              {lang.name}
            </div>
          </Select.Option>
        ))}
      </Select>
    </div>

  );
}

export default ChangeLanguageDropdown;
