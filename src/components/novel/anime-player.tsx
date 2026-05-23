"use client";

import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Settings,
  Subtitles,
  Loader2,
  FastForward,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AnimePayload } from "@/models/chapter";

interface AnimePlayerProps {
  payload: AnimePayload;
  title: string;
  chapterNumber: number;
  onNextEpisode?: () => void;
  onPrevEpisode?: () => void;
  hasNextEpisode?: boolean;
  hasPrevEpisode?: boolean;
  onProgress?: (progressSeconds: number) => void;
}

export default function AnimePlayer({
  payload,
  title,
  chapterNumber,
  onNextEpisode,
  onPrevEpisode,
  hasNextEpisode = true,
  hasPrevEpisode = true,
  onProgress,
}: AnimePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hlsInstance, setHlsInstance] = useState<Hls | null>(null);
  
  // State variables for custom controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [qualities, setQualities] = useState<string[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // Auto
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubtitle, setActiveSubtitle] = useState<string>("off");

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Setup HLS or standard HTML5 video player
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    let hls: Hls | null = null;

    if (Hls.isSupported() && payload.playlistUrl.includes(".m3u8")) {
      hls = new Hls({
        maxMaxBufferLength: 30,
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(payload.playlistUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setIsLoading(false);
        const qualityLabels = data.levels.map(
          (lvl, idx) => lvl.name || `${lvl.height}p` || `Level ${idx}`
        );
        setQualities(["Auto", ...qualityLabels]);
        setCurrentQuality(-1);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error("HLS fatal network error, trying to recover...");
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("HLS fatal media error, trying to recover...");
              hls?.recoverMediaError();
              break;
            default:
              console.error("HLS fatal unrecoverable error.");
              setIsLoading(false);
              break;
          }
        }
      });

      setHlsInstance(hls);
    } else {
      // Fallback to standard source
      video.src = payload.playlistUrl;
      video.addEventListener("loadedmetadata", () => {
        setIsLoading(false);
        setDuration(video.duration);
      });
      video.addEventListener("error", () => {
        setIsLoading(false);
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
      setHlsInstance(null);
    };
  }, [payload.playlistUrl]);

  // Handle play/pause, time update, duration changes, volume settings
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (onProgress) {
        onProgress(Math.floor(video.currentTime));
      }
    };
    const onDurationChange = () => setDuration(video.duration);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
    };
  }, [onProgress]);

  // Handle custom overlay timeout
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  // Hotkey bindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;

      // Ignore hotkeys when user is writing in input fields or textareas
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          video.currentTime = Math.min(video.duration, video.currentTime + 10);
          break;
        case "ArrowLeft":
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case "KeyF":
          e.preventDefault();
          toggleFullscreen();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch((err) => console.error("Play failed:", err));
    }
  };

  const handleSeek = (val: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = val[0];
    setCurrentTime(val[0]);
  };

  const handleVolumeChange = (val: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    const newVol = val[0];
    video.volume = newVol;
    setVolume(newVol);
    setIsMuted(newVol === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        console.error(`Fullscreen enable error: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleSpeedChange = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const handleQualityChange = (levelIdx: number) => {
    if (!hlsInstance) return;
    hlsInstance.currentLevel = levelIdx;
    setCurrentQuality(levelIdx);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const formattedMins = mins < 10 ? `0${mins}` : mins;
    const formattedSecs = secs < 10 ? `0${secs}` : secs;

    if (hrs > 0) {
      const formattedHrs = hrs < 10 ? `0${hrs}` : hrs;
      return `${formattedHrs}:${formattedMins}:${formattedSecs}`;
    }
    return `${formattedMins}:${formattedSecs}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative flex flex-col items-center justify-center w-full h-full min-h-[480px] bg-neutral-950 text-white rounded-xl overflow-hidden border border-neutral-850 shadow-2xl transition-all duration-300 ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-none" : ""
      }`}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        onClick={togglePlay}
        className="w-full h-full max-h-[80vh] object-contain cursor-pointer"
        playsInline
      >
        {/* Render inline subtitle tracks */}
        {(payload.subtitles || []).map((sub) => (
          <track
            key={sub.language}
            kind="subtitles"
            src={sub.url}
            srcLang={sub.language}
            label={sub.label}
            default={activeSubtitle === sub.language}
          />
        ))}
      </video>

      {/* Loading state indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950/80 z-20 backdrop-blur-md">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
          <span className="text-sm font-semibold tracking-wide text-neutral-300">
            Buffering Stream...
          </span>
        </div>
      )}

      {/* Premium Glassmorphic Controls Bar */}
      <div
        className={`absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-neutral-950/90 via-transparent to-neutral-950/40 px-6 py-4 z-10 transition-opacity duration-300 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Top Control Bar Info */}
        <div className="flex items-center justify-between w-full">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-900/30 text-purple-400 border border-purple-800/40 mb-1">
              Episode {chapterNumber}
            </span>
            <h3 className="text-base font-bold text-neutral-100 tracking-tight">
              {title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-300 hover:bg-neutral-800/60 rounded-full"
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Middle play overlay helper */}
        <div className="flex items-center justify-center flex-1">
          {!isPlaying && !isLoading && (
            <button
              onClick={togglePlay}
              className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-600/90 hover:bg-purple-500 hover:scale-105 active:scale-95 text-white shadow-xl transition-all duration-300 backdrop-blur-sm border border-purple-400/20"
            >
              <Play className="h-8 w-8 fill-current ml-1" />
            </button>
          )}
        </div>

        {/* Bottom Panel */}
        <div className="flex flex-col gap-3 w-full bg-neutral-900/45 border border-white/5 rounded-2xl p-4 backdrop-blur-md shadow-2xl">
          {/* Progress Timeline Slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-neutral-400 select-none">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="flex-1 cursor-pointer transition-colors"
            />
            <span className="text-xs font-mono text-neutral-400 select-none">
              {formatTime(duration)}
            </span>
          </div>

          {/* Buttons & Settings Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Play Pause */}
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="text-neutral-200 hover:bg-white/10 rounded-lg"
              >
                {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
              </Button>

              {/* Skip back 10s */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
                  }
                }}
                className="text-neutral-400 hover:bg-white/10 rounded-lg"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              {/* Volume Controller */}
              <div className="flex items-center gap-1 group/volume">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-neutral-200 hover:bg-white/10 rounded-lg"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
                <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    min={0}
                    max={1}
                    step={0.05}
                    onValueChange={handleVolumeChange}
                    className="w-16 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Right side options */}
            <div className="flex items-center gap-2">
              {/* Playback speed */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-neutral-200 hover:bg-white/10 gap-1 rounded-lg text-xs">
                    <span>{playbackRate}x</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-neutral-900 border-neutral-800 text-white">
                  <DropdownMenuLabel className="text-neutral-400">Speed</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-neutral-800" />
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <DropdownMenuItem
                      key={rate}
                      onClick={() => handleSpeedChange(rate)}
                      className={`cursor-pointer hover:bg-neutral-800 focus:bg-neutral-800 text-white ${
                        playbackRate === rate ? "bg-purple-900/30 text-purple-400 font-bold" : ""
                      }`}
                    >
                      {rate === 1 ? "Normal" : `${rate}x`}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* HLS Stream Quality Select */}
              {qualities.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-neutral-200 hover:bg-white/10 gap-1 rounded-lg text-xs">
                      <Settings className="h-4 w-4" />
                      <span>{currentQuality === -1 ? "Auto" : qualities[currentQuality + 1]}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-neutral-900 border-neutral-800 text-white">
                    <DropdownMenuLabel className="text-neutral-400">Quality</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-neutral-800" />
                    {qualities.map((q, idx) => (
                      <DropdownMenuItem
                        key={q}
                        onClick={() => handleQualityChange(idx - 1)}
                        className={`cursor-pointer hover:bg-neutral-800 focus:bg-neutral-800 text-white ${
                          currentQuality === idx - 1 ? "bg-purple-900/30 text-purple-400 font-bold" : ""
                        }`}
                      >
                        {q}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Subtitle Selector */}
              {payload.subtitles && payload.subtitles.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-neutral-200 hover:bg-white/10 rounded-lg">
                      <Subtitles className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-neutral-900 border-neutral-800 text-white">
                    <DropdownMenuLabel className="text-neutral-400">Subtitles</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-neutral-800" />
                    <DropdownMenuItem
                      onClick={() => {
                        const video = videoRef.current;
                        if (video) {
                          for (let i = 0; i < video.textTracks.length; i++) {
                            video.textTracks[i].mode = "disabled";
                          }
                        }
                        setActiveSubtitle("off");
                      }}
                      className={`cursor-pointer hover:bg-neutral-800 focus:bg-neutral-800 text-white ${
                        activeSubtitle === "off" ? "bg-purple-900/30 text-purple-400 font-bold" : ""
                      }`}
                    >
                      Off
                    </DropdownMenuItem>
                    {payload.subtitles.map((sub) => (
                      <DropdownMenuItem
                        key={sub.language}
                        onClick={() => {
                          const video = videoRef.current;
                          if (video) {
                            for (let i = 0; i < video.textTracks.length; i++) {
                              if (video.textTracks[i].language === sub.language) {
                                video.textTracks[i].mode = "showing";
                              } else {
                                video.textTracks[i].mode = "disabled";
                              }
                            }
                          }
                          setActiveSubtitle(sub.language);
                        }}
                        className={`cursor-pointer hover:bg-neutral-800 focus:bg-neutral-800 text-white ${
                          activeSubtitle === sub.language ? "bg-purple-900/30 text-purple-400 font-bold" : ""
                        }`}
                      >
                        {sub.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Fullscreen control */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-neutral-200 hover:bg-white/10 rounded-lg"
              >
                {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
