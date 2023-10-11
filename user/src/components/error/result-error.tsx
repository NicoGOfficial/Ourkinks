import {
  ContactsOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { IError } from '@interfaces/setting';
import { Button, Result } from 'antd';
import Router from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { connect, ConnectedProps } from 'react-redux';

export interface IResultErrorProps {
  error: IError
}

const mapStates = (state: any) => ({
  user: state.user.current
});

const connector = connect(mapStates);

type PropsFromRedux = ConnectedProps<typeof connector>;

function ResultError({
  error,
  user
}: PropsFromRedux & IResultErrorProps) {
  const { t } = useTranslation();

  return (
    <Result
      status={error?.statusCode === 404 ? '404' : 'error'}
      title={error?.statusCode === 404 ? null : error?.statusCode}
      subTitle={
          error?.statusCode === 404
            ? t('common:errNotFound')
            : error?.message
        }
      extra={[
        <Button
          className="secondary"
          key="console"
          onClick={() => {
            user?.isPerformer
              ? Router.push(`/model/${user.username}`)
              : Router.push('/');
          }}
        >
          <HomeOutlined />
          {t('common:backHome')}
        </Button>,
        <Button
          key="buy"
          className="primary"
          onClick={() => Router.push('/contact')}
        >
          <ContactsOutlined />
          {t('common:contactUs')}
        </Button>
      ]}
    />
  );
}

export default connector(ResultError);
