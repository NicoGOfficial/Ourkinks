import './index.module.less';

import { } from '@ant-design/icons';
import {
  Button,
  Col, Modal,
  Row
} from 'antd';
import withTranslation from 'next-translate/withTranslation';
import { PureComponent } from 'react';

interface IProps {
  onAddPollDuration: Function;
  openDurationPollModal: boolean;
  i18n: any;
}

class AddPollDurationForm extends PureComponent<IProps> {
  state = {
    limitTime: 7
  };

  async onChangePoll(value) {
    this.setState({ limitTime: value });
  }

  render() {
    const { t } = this.props.i18n;
    const { onAddPollDuration, openDurationPollModal = false } = this.props;
    const { limitTime } = this.state;

    return (
      <Modal
        title={`${t('common:AddPollDurationForm')} - ${!limitTime ? t('common:noLimit') : `${t('common:limitTime', { limitTime })}`}`}
        visible={openDurationPollModal}
        onCancel={() => onAddPollDuration(7)}
        onOk={() => onAddPollDuration(limitTime)}
      >
        <Row>
          <Col span={4.5}>
            <Button type={limitTime === 1 ? 'primary' : 'default'} onClick={this.onChangePoll.bind(this, 1)}>
              1
              {' '}
              {t('common:day')}
            </Button>
          </Col>
          <Col span={4.5}>
            <Button type={limitTime === 3 ? 'primary' : 'default'} onClick={this.onChangePoll.bind(this, 3)}>
              3
              {' '}
              {t('common:day')}
            </Button>
          </Col>
          <Col span={4.5}>
            <Button type={limitTime === 7 ? 'primary' : 'default'} onClick={this.onChangePoll.bind(this, 7)}>
              7
              {' '}
              {t('common:day')}
            </Button>
          </Col>
          <Col span={4.5}>
            <Button type={limitTime === 30 ? 'primary' : 'default'} onClick={this.onChangePoll.bind(this, 30)}>
              30
              {' '}
              {t('common:day')}
            </Button>
          </Col>
          <Col span={6}>
            <Button type={limitTime === 0 ? 'primary' : 'default'} onClick={this.onChangePoll.bind(this, 0)}>{t('common:noLimit')}</Button>
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default withTranslation(AddPollDurationForm);
