import React, { useRef, useEffect, useState } from 'react';
import mpegts from 'mpegts.js';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { loginState } from '../../atoms';
import { GoMute, GoUnmute } from "react-icons/go";
import NiceLoader from '../NiceViews/NiceLoader';
import PropTypes from 'prop-types';

mpegts.LoggingControl.enableAll = false;

const RTSPPlayer = ({ videoId }) => {
  const videoRef = useRef(null);
  const params = useParams();
  const loginData = useRecoilValue(loginState);
  const [isComponentVisible, setIsComponentVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isEverFullscreen, setIsEverFullscreen] = useState(false);
  const [fullscreenState, setFullscreenState] = useState(false);

  if (!videoId) {
    videoId = params?.videoId;
  }

  useEffect(() => {
    if (!fullscreenState && document?.fullscreenElement && videoRef.current === document.fullscreenElement) {
      try {
        document.exitFullscreen?.();
      } catch (error) {
        console.error("Error exiting fullscreen:", error);
      }
    }
  }, [fullscreenState]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (document.fullscreenElement) {
        // The document is in fullscreen mode
        setFullscreenState(true);
        setIsEverFullscreen(true);
      } else {
        // The document is not in fullscreen mode
        setFullscreenState(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [setFullscreenState, videoId, fullscreenState.currentFullscreenVideo]);

  useEffect(() => {
    let player;
    const host = import.meta.env.VITE_API_WS_URL || `ws://${window.location.host}`;
    const videoElement = videoRef.current;
    let keepAliveInterval;
    let pendingFrames = [];

    const setupPlayer = () => {
      console.log("Setting up player...");
      setIsLoading(true);

      if (mpegts.getFeatureList().mseLivePlayback && videoId) {
        player = mpegts.createPlayer({
          type: 'mpegts',
          isLive: true,
          url: `${host}/${videoId}?token=${loginData?.token}`,
          config: {
            enableWorker: true,
            liveBufferLatencyChasing: true,
            liveSyncDurationCount: 4,
            autoRecoveryMaxRetry: 3,
          }
        });

        player.attachMediaElement(videoElement);
        player.load();
        player.play();

        const ws = player.ioController?.mseController?.ws;
        if (ws) {
          keepAliveInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              if (ws.bufferedAmount > 1048576) {
                console.warn("WebSocket buffer full, skipping frames.");
                pendingFrames = [];
              } else {
                if (pendingFrames.length > 0) {
                  const latestFrame = pendingFrames.pop();
                  ws.send(latestFrame);
                }
                ws.send(JSON.stringify({ type: "keep-alive" }));
              }
            }
          }, 5000);
        }

        player.on(mpegts.Events.ERROR, () => {
          console.error("Player error detected. Reloading...");
          setTimeout(() => {
            if (player) {
              player.unload();
              player.load();
              player.play();
            }
          }, 5000);
        });
      }
    };

    const handlePlay = () => {
      console.log("Video playing...");
    }

    const handleVolumeChange = () => setIsMuted(videoElement.muted);

    if (videoElement) {
      videoElement.addEventListener('play', handlePlay);
      videoElement.addEventListener('volumechange', handleVolumeChange);
    }

    if (isComponentVisible) {
      setupPlayer();
    }

    return () => {
      if (keepAliveInterval) clearInterval(keepAliveInterval);
      if (player) {
        player.destroy();
      }
      if (videoElement) {
        videoElement.removeEventListener('play', handlePlay);
        videoElement.removeEventListener('volumechange', handleVolumeChange);
      }
      setIsLoading(false);
    };
  }, [videoId, loginData, isComponentVisible]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsComponentVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleMuteToggle = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const goFullScreen = (e) => {
    if (e) e.stopPropagation();
    const videoElement = videoRef.current;
    if (videoElement) {
      try {
        videoElement.requestFullscreen?.().then(() => {
          if (!isEverFullscreen) {
            videoElement.muted = false;
            setIsMuted(false);
          }
        }).catch((error) => {
          console.error("Error requesting fullscreen:", error);
        });
      } catch (error) {
        console.error("Error going fullscreen:", error);
      }
    }
  };

  const playerItemClicked = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (fullscreenState) {
      try {
        if (document.fullscreenElement) {
          document.exitFullscreen?.();
        } else {
          //goFullScreen(e);
          console.warn("Document is not in fullscreen mode");
        }
      } catch (error) {
        console.error("Error exiting fullscreen:", error);
      }
    } else {
      goFullScreen(e);
    }
  }

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  return (
    <div role="button" className="relative w-full h-full cursor-pointer" onClick={playerItemClicked}>
      <video
        ref={videoRef}
        autoPlay
        muted={isMuted}
        controls={false}
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        playsInline
        onCanPlay={handleCanPlay}
        className="w-full h-full [&::-webkit-media-controls-play-button]:hidden [&::-webkit-media-controls-picture-in-picture-button]:hidden"
      >
        <track kind="captions" default />
      </video>
      <div className="absolute top-2 left-2 z-5">
        <img src="/live.png" width={28} alt="live" />
      </div>
      {
        isLoading && (
          <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-20">
            <NiceLoader className="text-loaderColor" />
          </div>
        )
      }
      {
        !isLoading && (
          <div
            role="button"
            className={`absolute bottom-2 left-2 z-20 ${!isMuted ? 'bg-itemCardBorder' : 'bg-black bg-opacity-50'} p-2 rounded-full`}
            onClick={handleMuteToggle}
          >
            {isMuted ? <GoMute size={18} /> : <GoUnmute size={18} />}
          </div>
        )
      }
    </div>
  );
};

RTSPPlayer.propTypes = {
  videoId: PropTypes.string,
};

const MemoizedComponent = React.memo(RTSPPlayer);
export default MemoizedComponent;
