/* eslint-disable camelcase */
import { Button, message } from 'antd';
import classnames from 'classnames';
import Router from 'next/router';
import withTranslation from 'next-translate/withTranslation';
import React, { PureComponent } from 'react';
import { isMobile } from 'react-device-detect';
import withAntmedia from 'src/antmedia';
import { WEBRTC_ADAPTOR_INFORMATIONS } from 'src/antmedia/constants';
import {
  WebRTCAdaptorConfigs,
  WebRTCAdaptorProps
} from 'src/antmedia/interfaces';
import { StreamSettings } from 'src/interfaces';
import { streamService } from 'src/services';
import { SocketContext } from 'src/socket';
import { ISocketContext } from 'src/socket/SocketContext';
import videojs from 'video.js';

const STREAM_JOINED = 'private-stream/streamJoined';
const STREAM_LEAVED = 'private-stream/streamLeaved';
const JOINED_THE_ROOM = 'JOINED_THE_ROOM';

interface IProps extends WebRTCAdaptorProps {
  onClick: any;
  settings: StreamSettings;
  configs: Partial<WebRTCAdaptorConfigs>;
  setStreamRef?: Function;
  i18n: any;
}

interface IState {
  conversationId: string;
  streamId: string;
  loading: boolean;
}

class PrivateStreamingContainer extends PureComponent<IProps, IState> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    setStreamRef: () => { }
  };

  private activeStreams = [];

  private getLiveStreamOrVodURLInterval: NodeJS.Timeout;

  private publisher: videojs.Player;

  private player: videojs.Player;

  constructor(props: IProps) {
    super(props);
    this.state = {
      streamId: null,
      conversationId: null,
      loading: false
    };
  }

  componentDidMount() {
    const { setStreamRef = null } = this.props;
    if (setStreamRef) {
      setStreamRef({
        start: this.start.bind(this),
        stop: this.stop.bind(this)
      });
    }

    Router.events.on('routeChangeStart', this.onbeforeunload);
    window.addEventListener('beforeunload', this.onbeforeunload);
  }

  componentDidUpdate(_, prevStates: IState) {
    const { conversationId } = this.state;
    if (conversationId && conversationId !== prevStates.conversationId) {
      this.initSocketEvent();
    }
  }

  componentWillUnmount() {
    Router.events.off('routeChangeStart', this.onbeforeunload);
    window.removeEventListener('beforeunload', this.onbeforeunload);
  }

  onbeforeunload = () => {
    this.leaveStream();
  };

  async handelWebRTCAdaptorCallback(
    info: WEBRTC_ADAPTOR_INFORMATIONS,
    obj: any
  ) {
    const { conversationId, streamId } = this.state;
    const { settings, webRTCAdaptor, configs } = this.props;
    if (info === WEBRTC_ADAPTOR_INFORMATIONS.INITIALIZED) {
      if (settings.optionForPrivate === 'hls') {
        const token = await streamService.getPublishToken({
          streamId,
          settings
        });
        webRTCAdaptor.publish(streamId, token);
      }

      webRTCAdaptor.joinRoom(conversationId, streamId);
    } else if (info === WEBRTC_ADAPTOR_INFORMATIONS.NEW_STREAM_AVAILABLE) {
      const activeStream = this.activeStreams.find((id) => id === obj.streamId);
      if (!activeStream) {
        this.activeStreams.push(obj.streamId);
        this.createRemoteVideo(obj.stream);
      }
    } else if (info === WEBRTC_ADAPTOR_INFORMATIONS.JOINED_THE_ROOM) {
      if (settings.optionForPrivate === 'webrtc') {
        const token = await streamService.getPublishToken({
          streamId,
          settings
        });
        webRTCAdaptor.publish(streamId, token);
      }
    } else if (info === WEBRTC_ADAPTOR_INFORMATIONS.PUBLISH_STARTED) {
      if (!isMobile) {
        const player = videojs(configs.localVideoId, {
          liveui: true,
          controls: true,
          muted: true,
          bigPlayButton: false,
          controlBar: {
            playToggle: false,
            currentTimeDisplay: false,
            volumePanel: false,
            pictureInPictureToggle: false
          }
        });
        player.on('error', () => {
          player.error(null);
        });
        player.one('play', () => {
          this.publisher = player;
        });
      }

      const { getSocket } = this.context as ISocketContext;
      const socket = getSocket();
      socket.emit('private-stream/join', {
        conversationId,
        streamId: obj.streamId
      });
      this.setState({ loading: false });
    } else if (info === WEBRTC_ADAPTOR_INFORMATIONS.PUBLISH_FINISHED) {
      const { getSocket } = this.context as ISocketContext;
      const socket = getSocket();
      socket.emit('private-stream/leave', {
        conversationId,
        streamId: obj.streamId
      });
      this.setState({ loading: false });
    }
  }

  initSocketEvent() {
    const { initWebRTCAdaptor, i18n } = this.props;
    const { t } = i18n;
    const { getSocket } = this.context as ISocketContext;
    const socket = getSocket();
    socket?.on(
      JOINED_THE_ROOM,
      ({ streamId, streamList, conversationId: _id }) => {
        const { conversationId } = this.state;
        if (_id !== conversationId) return;

        this.setState({ streamId });
        initWebRTCAdaptor(this.handelWebRTCAdaptorCallback.bind(this));
        if (streamList.length) {
          this.playHLS(streamList[0]);
        }
      }
    );
    socket?.on(
      STREAM_JOINED,
      (data: { streamId: string; conversationId: string }) => {
        const { streamId, conversationId } = this.state;
        if (conversationId !== data.conversationId) return;

        if (streamId !== data.streamId) {
          this.playHLS(data.streamId);
        }
      }
    );
    socket?.on(
      STREAM_LEAVED,
      (data: { streamId: string; conversationId: string }) => {
        const { conversationId, streamId } = this.state;
        if (
          !conversationId
          || conversationId !== data.conversationId
          || streamId === data.streamId
        ) { return; }

        message.error(t('common:privateCallEnded'));
        window.setTimeout(() => {
          Router.push('/');
        }, 10 * 1000);
      }
    );
  }

  start(sessionId: string, conversationId: string) {
    this.setState({ conversationId });
  }

  leaveStream() {
    const { publish_started, webRTCAdaptor } = this.props;
    const { conversationId, streamId } = this.state;
    const { getSocket } = this.context as ISocketContext;
    const socket = getSocket();
    if (this.publisher) {
      this.publisher.dispose();
      this.publisher = undefined;
    }
    if (this.player) {
      this.player.dispose();
      this.player = undefined;
    }
    this.getLiveStreamOrVodURLInterval
      && clearInterval(this.getLiveStreamOrVodURLInterval);
    socket?.off(JOINED_THE_ROOM);
    socket?.off(STREAM_JOINED);
    socket?.off(STREAM_LEAVED);
    if (streamId && publish_started) {
      webRTCAdaptor && webRTCAdaptor.leaveFromRoom(conversationId);
      socket?.emit('private-stream/leave', {
        conversationId,
        streamId
      });
    }

    this.setState({
      streamId: null,
      conversationId: null
    });
  }

  async ended(streamId: string) {
    this.player && this.player.error(null);
    const { settings } = this.props;
    const src = await streamService.getLiveStreamOrVodURL({
      streamId,
      settings,
      appName: settings.AntMediaAppname
    });
    if (src) {
      this.getLiveStreamOrVodURLInterval = setInterval(() => {
        fetch(src, { method: 'HEAD' }).then(() => {
          this.playHLS(streamId);
          this.getLiveStreamOrVodURLInterval
            && clearInterval(this.getLiveStreamOrVodURLInterval);
        });
      }, 5000);
    }
  }

  async playHLS(streamId: string) {
    const { settings, configs } = this.props;
    const appName = configs.appName || settings.AntMediaAppname;
    this.getLiveStreamOrVodURLInterval
      && clearInterval(this.getLiveStreamOrVodURLInterval);
    const src = await streamService.getLiveStreamOrVodURL({
      appName,
      settings,
      streamId
    });
    if (!src) {
      return;
    }

    let video = document.querySelector('#private-subscriber');
    if (!video) {
      video = document.createElement('video') as any;
      video.setAttribute('id', 'private-subscriber');
      video.setAttribute('class', 'video-js broadcaster vjs-waiting');
      video.setAttribute('autoplay', 'autoplay');
      video.setAttribute('data-setup', '{"fluid": true}');
      document.querySelector('.private-streaming-container').append(video);
    }

    if (!this.player) {
      this.player = videojs('private-subscriber', {
        liveui: true,
        controls: true,
        autoplay: true
      });
      this.player.on('ended', () => this.ended(streamId));
      this.player.on('error', () => this.ended(streamId));
    }

    setTimeout(() => {
      if (!this.player) return;
      this.player.src({
        type: 'application/x-mpegURL',
        src
      });
    }, 10 * 1000);
  }

  createRemoteVideo(stream: any) {
    const video = document.createElement('video') as any;
    video.setAttribute('id', 'private-subscriber');
    video.setAttribute('class', 'video-js broadcaster');
    video.setAttribute('autoplay', 'autoplay');
    video.setAttribute('controls', 'controls');
    video.srcObject = stream;
    document.querySelector('.private-streaming-container').append(video);
  }

  leave() {
    if (typeof window !== 'undefined') {
      this.setState({ loading: true });
      this.leaveStream();
      setTimeout(() => {
        window.location.href = '/';
      }, 10 * 1000);

      const { t } = this.props.i18n;
      message.success(t('common:streamStoppedAlert'));
    }
  }

  stop() {
    const { leaveSession } = this.props;
    leaveSession();
  }

  // eslint-disable-next-line react/no-unused-class-component-methods
  async play(streamId: string) {
    const { settings, webRTCAdaptor } = this.props;
    const token = await streamService.getSubscriberToken({
      streamId,
      settings
    });
    webRTCAdaptor.play(streamId, token);
  }

  render() {
    const {
      onClick,
      initialized,
      containerClassName,
      publish_started,
      configs,
      i18n
    } = this.props;
    const { loading } = this.state;
    const { t } = i18n;
    return (
      <>
        <div
          className={classnames(
            'private-streaming-container',
            containerClassName
          )}
          hidden={!publish_started}
        >
          <video
            disablePictureInPicture
            data-setup='{"controlBar": {"pictureInPictureToggle": false}}'
            id={configs.localVideoId}
            controls
            className="video-js broadcaster"
            autoPlay
            muted
            playsInline
          />
        </div>
        <div>
          {!initialized ? (
            <Button
              type="primary"
              onClick={onClick}
              loading={loading}
              disabled={loading}
              block
            >
              {t('common:startStream')}
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={this.leave.bind(this)}
              block
              disabled={loading}
            >
              {t('common:stopStream')}
            </Button>
          )}
        </div>
      </>
    );
  }
}

PrivateStreamingContainer.contextType = SocketContext;
export default withAntmedia(
  withTranslation(PrivateStreamingContainer)
);
