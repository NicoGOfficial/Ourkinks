import {
  ArrowLeftOutlined
} from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import Messenger from '@components/messages/Messenger';
import { Layout, PageHeader } from 'antd';
import Router from 'next/router';
import useTranslation from 'next-translate/useTranslation';

interface IMessageProps {
  query: Record<string, string>
}

function Messages({
  query
}: IMessageProps) {
  const { t } = useTranslation();

  return (
    <Layout>
      <PageTitle title={t('common:chats')} />
      <div className="main-container">
        <PageHeader
          onBack={() => Router.back()}
          backIcon={<ArrowLeftOutlined />}
          title={t('common:chats')}
        />
        <Messenger toSource={query.toSource} toId={query.toId} />
      </div>
    </Layout>
  );
}

Messages.authenticate = true;

Messages.getInitialProps = (ctx) => {
  const { query } = ctx;
  return {
    query
  };
};

export default Messages;
