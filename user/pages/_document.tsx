import { settingService } from '@services/setting.service';
import parse from 'html-react-parser';
import Document, {
  Head, Html, Main, NextScript
} from 'next/document';

class CustomDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    const resp = await settingService.all();
    const settings = resp.data;
    return {
      ...initialProps,
      settings
    };
  }

  render() {
    const { settings } = this.props as any;
    return (
      <Html>
        <Head>
          <link rel="icon" href={settings.favicon || '/favicon.ico'} sizes="64x64" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
          <meta charSet="utf-8" />
          <link
            href="https://cdnjs.cloudflare.com/ajax/libs/video.js/7.9.5/alt/video-js-cdn.min.css"
            rel="stylesheet"
            id="videojs-style"
          />
          {settings.headerScript && parse(settings.headerScript)}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
        <script src="https://unpkg.com/video.js@7.8.3/dist/video.js" />
        <script src="https://unpkg.com/@videojs/http-streaming@1.13.3/dist/videojs-http-streaming.js" />
        <script type="application/javascript" src="/lib/adapter-latest.js" />
        <script type="application/javascript" src="/lib/webrtc_adaptor.js" />
        {settings && settings.afterBodyScript && (
          // eslint-disable-next-line react/no-danger
          <div dangerouslySetInnerHTML={{ __html: settings.afterBodyScript }} />
        )}
      </Html>
    );
  }
}

export default CustomDocument;
