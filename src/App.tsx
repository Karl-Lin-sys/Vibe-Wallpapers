import React, { useState, useEffect, FormEvent } from "react";
import { generateWallpapers } from "./services/imageService";
import { ImageCard, FullScreenView } from "./components/ImageComponents";
import { ImageIcon, Sparkles, X, KeyRound, Loader2 } from "lucide-react";

export default function App() {
  const [hasKey, setHasKey] = useState<boolean>(true);
  const [checkingKey, setCheckingKey] = useState(true);

  const [vibe, setVibe] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  useEffect(() => {
    async function checkKey() {
      if (window.aistudio?.hasSelectedApiKey) {
        const has = await window.aistudio.hasSelectedApiKey();
        setHasKey(has);
      } else {
        // Fallback for standard environments where API key is in process.env
        setHasKey(true);
      }
      setCheckingKey(false);
    }
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Assume successful selection immediately to mitigate race conditions
      setHasKey(true);
    }
  };

  const handleGenerate = async (overrideVibe?: string, overrideRef?: string | null) => {
    if (isLoading) return;
    const currentVibe = overrideVibe ?? vibe;
    const currentRef = overrideRef !== undefined ? overrideRef : referenceImage;
    
    // We shouldn't block empty vibes if there is a reference
    if (!currentVibe.trim() && !currentRef) {
        setError("Please enter a vibe to generate.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setImages([]); // clear existing for a fresh feel, or maybe keep them? Let's clear.
    setSelectedImage(null);

    try {
      const generated = await generateWallpapers(currentVibe, 4, currentRef ?? undefined);
      setImages(generated);
    } catch (err: any) {
      setError(err?.message || "Failed to generate images. Please try again.");
      if (err?.message?.includes("Requested entity was not found")) {
        setHasKey(false);
        setError("Your API key session expired or is invalid. Please select your key again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleGenerate();
  };

  const downloadImage = (base64Url: string) => {
    const link = document.createElement("a");
    link.href = base64Url;
    link.download = `vibe-wallpaper-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (checkingKey) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  }

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/30">
          <KeyRound className="w-10 h-10 text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">API Key Required</h1>
        <p className="text-neutral-400 max-w-md mb-8">
          To generate high-quality phone wallpapers (9:16 aspect ratio), you need to provide a Google Cloud API key with billing enabled.
        </p>
        <button
          onClick={handleSelectKey}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-full transition-colors shadow-lg shadow-indigo-600/20 mb-4"
        >
          Select Paid API Key
        </button>
        <a
          href="https://ai.google.dev/gemini-api/docs/billing"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
        >
          Learn more about billing
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-indigo-500/30 pb-20">
      {selectedImage && (
        <FullScreenView
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
          onRemix={() => {
            setReferenceImage(selectedImage);
            setSelectedImage(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onDownload={() => downloadImage(selectedImage)}
        />
      )}

      <header className="sticky top-0 z-10 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-inner shadow-white/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Vibe Wallpapers</h1>
            <p className="text-xs text-neutral-400">9:16 AI image generator</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="mb-10 space-y-4">
          {referenceImage && (
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
              <div className="relative w-16 h-24 rounded-lg overflow-hidden shrink-0">
                <img src={referenceImage} alt="Reference" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white mb-1">Remixing Image</h3>
                <p className="text-sm text-neutral-400 leading-snug">
                  This image will be used as a reference to generate new variations.
                </p>
                <button
                  type="button"
                  onClick={() => setReferenceImage(null)}
                  className="mt-2 text-xs font-medium text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Remove Reference
                </button>
              </div>
            </div>
          )}

          <div className="relative">
            <textarea
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              placeholder="Describe your vibe... (e.g. 'rainy cyberpunk lo-fi', 'pastel spring morning')"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-3xl py-4 px-6 pr-14 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-none transition-all"
              rows={3}
            />
          </div>

          {error && <p className="text-red-400 text-sm px-2 animate-in slide-in-from-top-2">{error}</p>}

          <button
            type="submit"
            disabled={isLoading || (!vibe.trim() && !referenceImage)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-medium py-4 px-6 rounded-3xl transition-colors shadow-lg shadow-indigo-600/10 disabled:shadow-none flex items-center justify-center gap-2 group"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Generate Wallpapers
              </>
            )}
          </button>
        </form>

        {images.length > 0 && !isLoading && (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-medium text-white">Results</h2>
              <span className="text-xs text-neutral-500">Tap to expand</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {images.map((img, i) => (
                <ImageCard
                  key={i}
                  imageUrl={img}
                  onSelect={() => setSelectedImage(img)}
                  // Staggered entrance
                  className={`animate-in zoom-in-95 duration-500 fade-in fill-mode-both delay-[${i * 100}ms]`}
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[9/16] w-full rounded-xl bg-neutral-900 animate-pulse border border-neutral-800" />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
