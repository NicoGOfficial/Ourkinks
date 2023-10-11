import { HomeOutlined } from '@ant-design/icons';
import Page from '@components/common/layout/page';
import TranslationForm from '@components/translation/translation-form';
import { postService } from '@services/index';
import { Breadcrumb } from 'antd';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

function PostTranslateUpdate() {
  const [post, setPost] = useState(null);
  const router = useRouter();

  const loadPost = async () => {
    try {
      const postId = router.query.id as string;
      const resp = await postService.findById(postId);
      setPost(resp.data);
    } catch {
      router.push('/posts');
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
  }, {
    field: 'shortDescription',
    props: {
      name: 'shortDescription',
      label: 'Short description'
    },
    editable: true,
    textarea: true
  }, {
    field: 'content',
    props: {
      name: 'content',
      label: 'Content'
    },
    editable: true,
    editor: true
  }];

  useEffect(() => {
    loadPost();
  }, []);

  return (
    <>
      <Head>
        <title>Update Post</title>
      </Head>
      <div style={{ marginBottom: '16px' }}>
        <Breadcrumb>
          <Breadcrumb.Item href="/">
            <HomeOutlined />
          </Breadcrumb.Item>
          <Breadcrumb.Item href="/posts">
            <span>Posts</span>
          </Breadcrumb.Item>
          {post && <Breadcrumb.Item>{post.title}</Breadcrumb.Item>}
          <Breadcrumb.Item>Translation</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <Page>
        <h1>{post?.title}</h1>
        {post && (
          <TranslationForm item={post} rows={rows} itemType="post" />
        )}

      </Page>
    </>
  );
}

export default PostTranslateUpdate;
