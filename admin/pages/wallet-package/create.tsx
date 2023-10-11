import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import FormTokenPackage from '@components/wallet-package/form';
import { walletPackageService } from '@services/wallet-package.service';
import { message } from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { Fragment, PureComponent } from 'react';

class CreateToken extends PureComponent {
  state = {
    submitting: false
  };

  async submit(data: any) {
    try {
      this.setState({ submitting: true });
      await walletPackageService.create(data);
      message.success('Created successfully');
      // TODO - redirect
      await this.setState(
        {
          submitting: false
        },
        () => window.setTimeout(() => {
          Router.push(
            {
              pathname: '/wallet-package'
            },
            '/wallet-package'
          );
        }, 1000)
      );
    } catch (e) {
      // TODO - check and show error here
      const err = (await Promise.resolve(e)) || {};
      message.error(err.message || 'Something went wrong, please try again!');
      this.setState({ submitting: false });
    }
  }

  render() {
    const { submitting } = this.state;
    return (
      <>
        <Head>
          <title>Create new Wallet Package</title>
        </Head>
        <BreadcrumbComponent
          breadcrumbs={[{ title: 'Wallet Packages', href: '/token' }, { title: 'Create new Wallet package' }]}
        />
        <Page>
          <FormTokenPackage onFinish={this.submit.bind(this)} packageToken={null} submitting={submitting} />
        </Page>
      </>
    );
  }
}

export default CreateToken;
