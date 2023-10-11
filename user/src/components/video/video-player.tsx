import 'node_modules/video.js/dist/video-js.min.css';

import { useIsInViewport } from '@lib/hooks';
import { setVideoPlaying } from '@redux/video/actions';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import videojs from 'video.js';

export function VideoPlayer({ pauseHiddenVideo = false, id, ...props }: any) {
  const videoNode = useRef<HTMLVideoElement>(null);
  const player = useRef(null);
  const isIntersecting = useIsInViewport(videoNode);
  const [isPlayed, setIsPlay] = useState(false);
  const dispatch = useDispatch();
  // const playingVideo = useSelector((state: any) => state.video.playingVideo);

  const handleOnPlay = () => {
    if (isPlayed) return;
    !isPlayed && setIsPlay(true);
    // eslint-disable-next-line react/prop-types
    const { onPlay } = props;
    onPlay && onPlay();
    dispatch(setVideoPlaying(id));

    if (pauseHiddenVideo) {
      const videos = document.querySelectorAll<HTMLVideoElement>(`video:not(video[data-id=video-${id}])`);
      videos.forEach((video) => video.pause());
    }
  };

  const stop = () => {
    setIsPlay(false);
  };

  useEffect(() => {
    player.current = videojs(videoNode.current, { ...props } as any);
    player.current.addClass('video-js');
    player.current.on('play', handleOnPlay);
    videoNode.current.addEventListener('ended', stop);
    videoNode.current.addEventListener('error', stop);
    videoNode.current.addEventListener('pause', stop);

    return () => {
      if (player.current) {
        // player.current.dispose();
        player.current.off('play', handleOnPlay);
      }
    };
  }, []);

  // useEffect(() => {
  //   if (playingVideo && playingVideo !== id) {
  //     videoNode.current && videoNode.current.pause();
  //   }
  // }, [playingVideo]);

  useEffect(() => {
    if (pauseHiddenVideo && !isIntersecting) {
      videoNode.current && videoNode.current.pause();
    }
  }, [isIntersecting, pauseHiddenVideo]);

  return (
    <div className="videojs-player" style={{ paddingTop: '5px', paddingBottom: '5px' }}>
      <div data-vjs-player>
        <video data-id={`video-${id}`} disablePictureInPicture data-setup='{"controlBar": {"pictureInPictureToggle": false}}' ref={videoNode} className="video-js" />
      </div>
    </div>
  );
}

export default VideoPlayer;
