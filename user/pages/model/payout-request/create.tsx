import { ArrowLeftOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import PayoutRequestForm from '@components/payout-request/form';
import { Layout, message, PageHeader } from 'antd';
import Router from 'next/router';
import withTranslation from 'next-translate/withTranslation';
import React from 'react';
import { connect } from 'react-redux';
import { payoutRequestService } from 'src/services';

interface Props {
  user: any;
  i18n: any;
}

class PayoutRequestCreatePage extends React.PureComponent<Props> {
  static authenticate = true;

  static onlyPerformer = true;

  state = {
    submiting: false,
    statsPayout: {
      totalPrice: 0,
      paidPrice: 0,
      unpaidPrice: 0
    }
  };

  componentDidMount() {
    const { t } = this.props.i18n;
    const { user } = this.props;
    if (!user.bankingInformation && !user.paypalSetting) {
      message.error(t('common:errUpdateBanking'));
      Router.push('/model/account');
    } else {
      this.calculateStatsPayout();
    }
  }

  calculateStatsPayout = async () => {
    const { t } = this.props.i18n;
    try {
      const resp = await payoutRequestService.stats();
      this.setState({ statsPayout: resp.data });
    } catch {
      message.error(t('common:errCommon'));
    }
  };

  async submit(data: {
    request: number;
    requestNote: string;
  }) {
    const { t } = this.props.i18n;
    try {
      const { totalPrice } = this.state.statsPayout;
      if (!totalPrice) {
        message.error(t('common:errBalaceRequest'));
        return;
      }

      await this.setState({ submiting: true });
      const body = { ...data };
      await payoutRequestService.create(body);
      message.success(t('common:requestedPayout'));
      Router.push('/model/payout-request');
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(error?.message || t('common:errCommon'));
    } finally {
      this.setState({ submiting: false });
    }
  }

  render() {
    const { t } = this.props.i18n;
    const { submiting, statsPayout } = this.state;
    const { user } = this.props;
    return (
      <Layout>
        <PageTitle title={t('common:newPayoutRequest')} />
        <div className="main-container">
          <PageHeader
            onBack={() => Router.back()}
            backIcon={<ArrowLeftOutlined />}
            title={t('common:newPayoutRequest')}
          />
          <PayoutRequestForm
            statsPayout={statsPayout}
            submit={this.submit.bind(this)}
            submiting={submiting}
            performer={user as any}
          />
        </div>
      </Layout>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user.current
});

export default connect(mapStateToProps)(withTranslation(PayoutRequestCreatePage));
