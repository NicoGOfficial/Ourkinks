import Page from '@components/common/layout/page';
import { logout } from '@redux/auth/actions';
import Head from 'next/head';
import { Fragment, useEffect } from 'react';
import { connect } from 'react-redux';

interface IProps {
  logout: Function;
}

function Logout({ logout: handleLogout }: IProps) {
  useEffect(() => {
    handleLogout();
  }, []);

  return (
    <>
      <Head>
        <title>Log out</title>
      </Head>
      <Page>
        <span>Logout...</span>
      </Page>
    </>
  );
}

Logout.authenticate = false;

export default connect(null, { logout })(Logout);
