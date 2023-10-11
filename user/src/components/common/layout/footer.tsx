import { isUrl } from '@lib/string';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { connect } from 'react-redux';
import { IUser } from 'src/interfaces';

const ChangeLanguageDropdown = dynamic(() => import('../change-language-dropdown'), {
  ssr: false
});

type IProps = {
  currentUser: IUser;
  settings: any;
}

function Footer({
  currentUser,
  settings
}: IProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const getSocialLink = (url, media) => {
    if (!url) return null;
    const newLink = !['http://', 'https://'].includes(url) ? `https://${url}` : url;

    let img;
    switch (media) {
      case 'twitter':
        img = '/twitter-w.png';
        break;
      case 'instagram':
        img = '/instagram.png';
        break;
      case 'facebook':
        img = '/facebook.png';
        break;
      default:
        img = '/youtube.png';
        break;
    }

    return (
      <a href={newLink} target="_blank" rel="noreferrer">
        <img src={img} alt={media} width={35} />
      </a>
    );
  };

  const menus = settings.menus.filter((m) => m.section === 'footer');
  return (
    <div className="main-footer">
      <div className="main-container">
        <ul>
          {menus?.map((item) => (
            <li key={item.path} className={router.pathname === item.path ? 'active' : ''}>
              {
                isUrl(item.path)
                  ? <a rel="noreferrer" href={item.path} target={item.isNewTab ? '_blank' : ''}>{item.title}</a>
                  : (
                    <Link href={item.path}>
                      <a>{item.title}</a>
                    </Link>
                  )
              }
            </li>
          ))}

          {!currentUser._id && [
            <li className={router.pathname === '/auth/login' ? 'active' : ''} key="login">
              <Link href="/auth/login">
                <a>{t('common:login')}</a>
              </Link>
            </li>,
            <li className={router.pathname === '/auth/register' ? 'active' : ''} key="signup">
              <Link href={{ pathname: '/auth/register' }} as="/auth/register">
                <a>{t('common:signup')}</a>
              </Link>
            </li>
          ]}
        </ul>
        <div className="social-link">
          {getSocialLink(settings.twitterLink, 'twitter')}
          {getSocialLink(settings.instagramLink, 'instagram')}
          {getSocialLink(settings.facebookLink, 'facebook')}
          {getSocialLink(settings.youtubeLink, 'youtube')}
        </div>
        <div>
          <div style={{
            display: 'flex',
            margin: '0 auto',
            marginBottom: '10px'
          }}
          >
            <ChangeLanguageDropdown />
          </div>
        </div>
        {/* eslint-disable-next-line react/no-danger */}
        {settings.footerContent ? <div className="footer-content"><div className="sun-editor-editable" dangerouslySetInnerHTML={{ __html: settings.footerContent }} /></div>
          : (
            <div className="copyright-text">
              <span>
                <Link href="/">
                  <a>{settings?.siteName}</a>
                </Link>
                {' '}
                © Copyright
                {' '}
                {new Date().getFullYear()}
              </span>
            </div>
          )}
      </div>
    </div>
  );
}
const mapState = (state: any) => ({
  currentUser: state.user.current,
  settings: state.settings
});
export default connect(mapState)(Footer);
