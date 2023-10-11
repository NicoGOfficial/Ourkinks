import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import { FormSubscription } from '@components/subscription/form-subscription';
import { subscriptionService } from '@services/subscription.service';
import { Layout, message } from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';
import { ISubscription } from 'src/interfaces';

class SubscriptionCreate extends PureComponent {
  state = {
    submiting: false
  };

  async submit(data: ISubscription) {
    try {
      if (!data.userId) {
        message.error('Please select user');
        return;
      }
      if (!data.performerId) {
        message.error('Please select performer');
        return;
      }
      await this.setState({ submiting: true });
      await subscriptionService.create(data);
      message.success('Created successfully');
      Router.push('/subscription');
    } catch (e) {
      const err = (await Promise.resolve(e)) || {};
      message.error(err.message || 'Something went wrong, please try again!');
      this.setState({ submiting: false });
    }
  }

  render() {
    const { submiting } = this.state;
    return (
      <Layout>
        <Head>
          <title>New Subscription</title>
        </Head>
        <BreadcrumbComponent
          breadcrumbs={[{ title: 'Subscriptions', href: '/subscription' }, { title: 'New subscription' }]}
        />
        <Page>
          <FormSubscription onFinish={this.submit.bind(this)} submiting={submiting} />
        </Page>
      </Layout>
    );
  }
}

export default SubscriptionCreate;
