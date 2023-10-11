import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import FormFeed from '@components/feed/feed-form';
import Head from 'next/head';
import { PureComponent } from 'react';

class FeedCreate extends PureComponent {
  render() {
    return (
      <>
        <Head>
          <title>New post</title>
        </Head>
        <BreadcrumbComponent
          breadcrumbs={[{ title: 'Feed', href: '/feed' }, { title: 'New post' }]}
        />
        <Page>
          <FormFeed />
        </Page>
      </>
    );
  }
}

export default FeedCreate;
