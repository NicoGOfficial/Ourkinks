import { Alert } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

const mapState = (state: any) => ({
  currentUser: state.user.current
});

const connector = connect(mapState);

type PropsFromRedux = ConnectedProps<typeof connector>;

function ModelUnverifiedAlert({
  currentUser
}: PropsFromRedux) {
  const { t } = useTranslation();
  const [showAlert, setShowAlert] = useState(false);

  const handleModelInactive = () => {
    if (
      currentUser.isPerformer
      && (currentUser.status !== 'active' || !currentUser.verifiedDocument)
    ) {
      setShowAlert(true);
    }
  };

  useEffect(() => {
    if (!currentUser._id) return;

    handleModelInactive();
  }, [currentUser]);

  if (!showAlert) return null;

  return (
    <Alert
      type="info"
      description={(
        <>
          <p className="text-center" style={{ margin: 0 }}>
            {t('common:alertInfoModelUnverified')}
          </p>
          <a
            href="/contact"
            style={{ position: 'absolute', bottom: '5px', right: '5px' }}
          >
            {t('common:contactUs')}
          </a>
        </>
        )}
      message={(
        <h4 className="text-center">
          {t('common:processApprovingYourAccount')}
        </h4>
        )}
      closable
    />
  );
}

export default connector(ModelUnverifiedAlert);
