import { Download, IterationCcw, X, ZoomIn } from "lucide-react";
import React from "react";
import { cn } from "../lib/utils";

interface ImageCardProps {
  imageUrl: string;
  onSelect: () => void;
  className?: string;
}

export function ImageCard({ imageUrl, onSelect, className }: ImageCardProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-gray-100 cursor-pointer",
        className
      )}
    >
      <img
        src={imageUrl}
        alt="Generated Wallpaper"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <ZoomIn className="w-8 h-8 text-white" />
      </div>
    </div>
  );
}

interface FullScreenViewProps {
  imageUrl: string;
  onClose: () => void;
  onRemix: () => void;
  onDownload: () => void;
}

export function FullScreenView({
  imageUrl,
  onClose,
  onRemix,
  onDownload,
}: FullScreenViewProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 animate-in fade-in duration-200">
      <div className="absolute top-0 right-0 p-4 z-10">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 min-h-0">
        <img
          src={imageUrl}
          alt="Generated Wallpaper Fullscreen"
          className="max-w-full max-h-full object-contain rounded-md"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="p-6 bg-gradient-to-t from-black/80 to-transparent flex gap-4 justify-center">
        <button
          onClick={onRemix}
          className="flex-1 max-w-[200px] flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-full font-medium transition-colors"
        >
          <IterationCcw className="w-5 h-5" />
          Remix
        </button>
        <button
          onClick={onDownload}
          className="flex-1 max-w-[200px] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-full font-medium transition-colors shadow-lg shadow-indigo-600/20"
        >
          <Download className="w-5 h-5" />
          Download
        </button>
      </div>
    </div>
  );
}
