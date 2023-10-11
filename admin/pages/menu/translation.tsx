import { HomeOutlined } from '@ant-design/icons';
import Page from '@components/common/layout/page';
import TranslationForm from '@components/translation/translation-form';
import { menuService } from '@services/index';
import { Breadcrumb } from 'antd';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

function MenuTranslateUpdate() {
  const [item, setItem] = useState(null);
  const router = useRouter();

  const loadItem = async () => {
    try {
      const id = router.query.id as string;
      const resp = await menuService.findById(id);
      setItem(resp.data);
    } catch {
      router.push('/menu');
    }
  };

  const rows = [{
    field: 'title',
    props: {
      name: 'title',
      label: 'Title',
      rules: [{ required: true, message: 'Please input title!' }]
    },
    editable: true
  }];

  useEffect(() => {
    loadItem();
  }, []);

  return (
    <>
      <Head>
        <title>Update menu</title>
      </Head>
      <div style={{ marginBottom: '16px' }}>
        <Breadcrumb>
          <Breadcrumb.Item href="/">
            <HomeOutlined />
          </Breadcrumb.Item>
          <Breadcrumb.Item href="/posts">
            <span>Menus</span>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{item?.title}</Breadcrumb.Item>
          <Breadcrumb.Item>Translation</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <Page>
        <h1>{item?.title}</h1>
        {item && (
          <TranslationForm item={item} rows={rows} itemType="menu" />
        )}

      </Page>
    </>
  );
}

export default MenuTranslateUpdate;
