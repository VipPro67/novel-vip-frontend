"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Layout, 
  Maximize2, 
  Minimize2, 
  Settings, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import type { MangaPayload } from "@/models/chapter";

interface MangaReaderProps {
  payload: MangaPayload;
  title: string;
  chapterNumber: number;
  onNextChapter?: () => void;
  onPrevChapter?: () => void;
  hasNextChapter?: boolean;
  hasPrevChapter?: boolean;
}

type LayoutMode = "webtoon" | "single-page";

export default function MangaReader({
  payload,
  title,
  chapterNumber,
  onNextChapter,
  onPrevChapter,
  hasNextChapter = true,
  hasPrevChapter = true,
}: MangaReaderProps) {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("webtoon");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const totalPages = payload.pages?.length || 0;

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
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

  // Webtoon scroll tracker to update current page indicator
  useEffect(() => {
    if (layoutMode !== "webtoon") return;

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px", // Trigger when page occupies major center view
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Number.parseInt(entry.target.getAttribute("data-page-index") || "0");
          setCurrentPage(index);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    Object.values(pageRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [layoutMode, payload.pages]);

  // Handle single-page navigation
  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    } else if (onNextChapter && hasNextChapter) {
      onNextChapter();
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    } else if (onPrevChapter && hasPrevChapter) {
      onPrevChapter();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        if (layoutMode === "single-page") {
          handleNextPage();
        }
      } else if (e.key === "ArrowLeft") {
        if (layoutMode === "single-page") {
          handlePrevPage();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [layoutMode, currentPage, totalPages]);

  const handleImageLoad = (index: number) => {
    setImagesLoaded((prev) => ({ ...prev, [index]: true }));
  };

  const sortedPages = [...(payload.pages || [])].sort((a, b) => a.pageNumber - b.pageNumber);

  return (
    <div 
      ref={containerRef}
      className={`relative flex flex-col w-full h-full min-h-[600px] select-none text-white overflow-hidden rounded-xl border border-neutral-850 bg-neutral-950 transition-all duration-300 ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-none" : ""
      }`}
    >
      {/* Top Floating Control Bar */}
      <div className="z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-neutral-900/90 to-transparent backdrop-blur-sm border-b border-neutral-800/20">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-neutral-100">{title}</h2>
          <p className="text-xs text-neutral-400">Chapter {chapterNumber}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Layout switch */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-neutral-800 text-neutral-300">
                {layoutMode === "webtoon" ? <Layout className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-neutral-900 border-neutral-800 text-white">
              <DropdownMenuLabel className="text-neutral-400">Reader Mode</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-neutral-800" />
              <DropdownMenuItem 
                onClick={() => setLayoutMode("webtoon")} 
                className="flex items-center gap-2 cursor-pointer hover:bg-neutral-800 focus:bg-neutral-800 text-white"
              >
                <Layout className="h-4 w-4" /> Webtoon (Vertical Scroll)
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setLayoutMode("single-page");
                  setCurrentPage(0);
                }} 
                className="flex items-center gap-2 cursor-pointer hover:bg-neutral-800 focus:bg-neutral-800 text-white"
              >
                <BookOpen className="h-4 w-4" /> Page-by-Page
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Zoom controls */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-neutral-800 text-neutral-300">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 p-4 bg-neutral-900 border-neutral-800 text-white">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-300">Zoom: {zoomLevel}%</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 hover:bg-neutral-800 text-neutral-400"
                    onClick={() => setZoomLevel(100)}
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 hover:bg-neutral-800 text-neutral-400"
                    onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Slider 
                    value={[zoomLevel]} 
                    min={50} 
                    max={150} 
                    step={10}
                    onValueChange={(val) => setZoomLevel(val[0])}
                    className="flex-1 cursor-pointer"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 hover:bg-neutral-800 text-neutral-400"
                    onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Fullscreen */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleFullscreen}
            className="hover:bg-neutral-800 text-neutral-300"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        className={`flex-1 overflow-y-auto overflow-x-hidden flex justify-center bg-neutral-950 p-4 min-h-0 ${
          layoutMode === "single-page" ? "items-center overflow-hidden" : "items-start"
        }`}
      >
        {/* Webtoon layout: Scrollable list of images */}
        {layoutMode === "webtoon" && (
          <div 
            className="flex flex-col items-center gap-1 mx-auto"
            style={{ width: `${zoomLevel}%`, maxWidth: "100%" }}
          >
            {sortedPages.map((page, index) => (
              <div
                key={page.pageNumber}
                ref={(el) => { pageRefs.current[index] = el; }}
                data-page-index={index}
                className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-900/50 rounded-lg overflow-hidden flex items-center justify-center transition-all duration-300"
                style={{
                  aspectRatio: page.width && page.height ? `${page.width}/${page.height}` : "2/3"
                }}
              >
                {!imagesLoaded[index] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/40 backdrop-blur-md">
                    <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
                  </div>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={page.url}
                  alt={`Page ${page.pageNumber}`}
                  className={`w-full h-auto select-none transition-opacity duration-300 ${
                    imagesLoaded[index] ? "opacity-100" : "opacity-0"
                  }`}
                  loading="lazy"
                  onLoad={() => handleImageLoad(index)}
                />
              </div>
            ))}

            {/* End of chapter vertical navigator */}
            <div className="flex flex-col items-center gap-4 py-16 w-full max-w-md">
              <p className="text-sm text-neutral-500">You reached the end of the chapter.</p>
              <div className="flex gap-4">
                {hasPrevChapter && (
                  <Button 
                    variant="outline" 
                    onClick={onPrevChapter}
                    className="bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-white"
                  >
                    Previous Chapter
                  </Button>
                )}
                {hasNextChapter && (
                  <Button 
                    variant="outline" 
                    onClick={onNextChapter}
                    className="bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-white"
                  >
                    Next Chapter
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Page-by-page layout: one image at a time */}
        {layoutMode === "single-page" && totalPages > 0 && (
          <div className="relative flex flex-col items-center justify-center w-full h-full max-h-[85vh]">
            <div 
              className="relative flex items-center justify-center max-w-full max-h-[75vh] bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800/40 shadow-2xl transition-all duration-300"
              style={{
                width: `calc(${zoomLevel}% * 0.7)`,
                aspectRatio: sortedPages[currentPage]?.width && sortedPages[currentPage]?.height
                  ? `${sortedPages[currentPage].width}/${sortedPages[currentPage].height}`
                  : "2/3"
              }}
            >
              {!imagesLoaded[currentPage] && (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/60">
                  <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
                </div>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sortedPages[currentPage]?.url}
                alt={`Page ${sortedPages[currentPage]?.pageNumber}`}
                className={`max-w-full max-h-full object-contain select-none transition-opacity duration-300 ${
                  imagesLoaded[currentPage] ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => handleImageLoad(currentPage)}
              />

              {/* Navigation overlays */}
              <div 
                className="absolute left-0 top-0 w-1/3 h-full cursor-west-resize opacity-0 hover:opacity-10 flex items-center justify-start pl-4 bg-gradient-to-r from-black/40 to-transparent transition-opacity"
                onClick={handlePrevPage}
              >
                <ChevronLeft className="h-8 w-8 text-white" />
              </div>
              <div 
                className="absolute right-0 top-0 w-1/3 h-full cursor-east-resize opacity-0 hover:opacity-10 flex items-center justify-end pr-4 bg-gradient-to-l from-black/40 to-transparent transition-opacity"
                onClick={handleNextPage}
              >
                <ChevronRight className="h-8 w-8 text-white" />
              </div>
            </div>

            {/* In-view Single Page Navigator */}
            <div className="flex items-center gap-6 mt-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handlePrevPage}
                disabled={currentPage === 0 && !hasPrevChapter}
                className="hover:bg-neutral-800 text-neutral-300 disabled:opacity-30"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="text-sm font-medium text-neutral-400">
                Page {currentPage + 1} / {totalPages}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1 && !hasNextChapter}
                className="hover:bg-neutral-800 text-neutral-300 disabled:opacity-30"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom status/nav bar */}
      <div className="z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-t from-neutral-900/90 to-transparent backdrop-blur-sm border-t border-neutral-800/20">
        <div className="text-xs text-neutral-400">
          {layoutMode === "webtoon" ? (
            <span>Scrolling View • Reading page {currentPage + 1} of {totalPages}</span>
          ) : (
            <span>Single Page View • Page {currentPage + 1} of {totalPages}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasPrevChapter && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onPrevChapter}
              className="bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300 text-xs px-3 h-8"
            >
              Prev Chapter
            </Button>
          )}
          {hasNextChapter && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onNextChapter}
              className="bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300 text-xs px-3 h-8"
            >
              Next Chapter
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
