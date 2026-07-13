import { useEffect, useRef } from "react";

let youtubeApiPromise = null;

function loadYouTubeApi() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube API is only available in the browser"));
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve, reject) => {
      const previousReady = window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        if (window.YT?.Player) {
          resolve(window.YT);
          return;
        }
        reject(new Error("YouTube iframe API failed to load"));
      };

      const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (!existingScript) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.head.appendChild(script);
      }
    });
  }

  return youtubeApiPromise;
}

export function useYouTubeIntroPlayer({ videoId, active, mapReadyRef, onEnded }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const onEndedRef = useRef(onEnded);

  onEndedRef.current = onEnded;

  useEffect(() => {
    if (!active || !videoId || !containerRef.current) return;

    let cancelled = false;

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !containerRef.current) return;

        playerRef.current = new YT.Player(containerRef.current, {
          videoId,
          playerVars: {
            autoplay: 1,
            playsinline: 1,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            enablejsapi: 1,
          },
          events: {
            onReady: (event) => {
              event.target.unMute();
              event.target.setVolume(100);
              event.target.playVideo();
            },
            onStateChange: (event) => {
              if (event.data !== YT.PlayerState.ENDED) return;

              if (mapReadyRef.current) {
                onEndedRef.current?.();
                return;
              }

              event.target.seekTo(0);
              event.target.unMute();
              event.target.setVolume(100);
              event.target.playVideo();
            },
          },
        });
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      cancelled = true;
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, [active, videoId, mapReadyRef]);

  return { containerRef };
}
