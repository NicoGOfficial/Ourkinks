import { TabPane, Tabs } from '@components/common/base/tabs';
import StreamMessenger from '@components/stream-chat/Messenger';
import { getResponseError } from '@lib/utils';
import { Button, message } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import React from 'react';
import { IUser } from 'src/interfaces';
import { messageService } from 'src/services';

import style from './chat-box.module.less';
import StreamingChatUsers from './streaming-chat-view';

type IProps = {
  resetAllStreamMessage?: Function;
  user?: any;
  activeConversation?: any;
  totalParticipant?: number;
  members?: IUser[];
}

const checkPermission = (performer, conversation) => {
  if (performer && conversation && conversation.data && performer._id === conversation.data.performerId) {
    return true;
  }

  return false;
};

function ChatBox({
  totalParticipant = 0,
  members = [],
  user = null,
  activeConversation = null,
  resetAllStreamMessage = null
}: IProps) {
  const { t } = useTranslation();
  const [removing, setRemoving] = React.useState(false);
  const [canReset, setCanReset] = React.useState(false);

  React.useEffect(() => {
    setCanReset(checkPermission(user, activeConversation));
  }, [user, activeConversation]);

  const removeAllMessage = async () => {
    if (!canReset) {
      return;
    }

    try {
      setRemoving(true);
      if (!window.confirm(t('common:confirmRemoveChatHistory'))) {
        return;
      }
      await messageService.deleteAllMessageInConversation(
        activeConversation.data._id
      );
      resetAllStreamMessage && resetAllStreamMessage({ conversationId: activeConversation.data._id });
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(getResponseError(error));
    } finally {
      setRemoving(false);
    }
  };

  return (
    <>
      <div className={style['conversation-stream']}>
        <Tabs
          animated={{
            inkBar: false,
            tabPane: false
          }}
          defaultActiveKey="chat_content"
        >
          <TabPane tab={t('common:chatTabTitle')} key="chat_content">
            {activeConversation?.data?.streamId && (
              <StreamMessenger />
            )}
          </TabPane>
          <TabPane tab={t('common:chatTabUserTitle', { count: totalParticipant || 0 })} key="chat_user">
            <StreamingChatUsers members={members} />
          </TabPane>
        </Tabs>
      </div>
      {canReset && (
        <div style={{ margin: '10px' }}>
          <Button
            type="primary"
            loading={removing}
            onClick={() => removeAllMessage()}
          >
            {t('common:clearMessageHistory')}
          </Button>
        </div>
      )}
    </>
  );
}

export default ChatBox;
