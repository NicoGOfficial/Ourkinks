import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import FormFeed from '@components/feed/feed-form';
import { feedService } from '@services/feed.service';
import { message } from 'antd';
import Head from 'next/head';
import { Fragment, PureComponent } from 'react';

interface IProps {
    id: string;
}

class FeedUpdate extends PureComponent<IProps> {
  state = {
    feed: null
  };

  static async getInitialProps(ctx) {
    return ctx.query;
  }

  componentDidMount() {
    this.getFeed();
  }

  async getFeed() {
    const { id } = this.props;
    try {
      const resp = await (await feedService.findById(id)).data;
      this.setState({ feed: resp });
    } catch (e) {
      message.error('Error occured');
    }
  }

  render() {
    const { feed } = this.state;
    return (
      <>
        <Head>
          <title>Edit Post</title>
        </Head>
        <BreadcrumbComponent
          breadcrumbs={[
            { title: 'Posts', href: '/feed' },
            { title: 'Edit' }
          ]}
        />
        <Page>
          {feed && (
            <FormFeed
              feed={feed}
            />
          )}
        </Page>
      </>
    );
  }
}

export default FeedUpdate;
