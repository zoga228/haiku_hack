import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, ShoppingBag, ChevronUp, ChevronDown, Home } from "lucide-react";
import { useLocation } from "wouter";
import { COINS_VIDEOS } from "@/lib/coinsData";

// Мы НЕ используем DashboardLayout здесь, чтобы исключить влияние его скелетонов и логики загрузки
export default function CoinsPage() {
  const [, setLocation] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Принудительно ставим статус загрузки в true через небольшую паузу
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const currentVideo = COINS_VIDEOS[currentIndex];

  const nextVideo = () => {
    setCurrentIndex((prev) => (prev + 1) % COINS_VIDEOS.length);
  };

  const prevVideo = () => {
    setCurrentIndex((prev) => (prev - 1 + COINS_VIDEOS.length) % COINS_VIDEOS.length);
  };

  const toggleLike = (videoId: string) => {
    setLiked((prev) => ({
      ...prev,
      [videoId]: !prev[videoId],
    }));
  };

  if (!isLoaded) return <div className="fixed inset-0 bg-black flex items-center justify-center text-white">Loading Reels...</div>;

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center overflow-hidden font-sans">
      {/* Кнопка возврата на главную */}
      <button 
        onClick={() => setLocation("/")}
        className="absolute top-6 left-6 z-[10000] p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition"
      >
        <Home className="w-6 h-6" />
      </button>

      {/* Main Reels Container */}
      <div className="relative w-full max-w-[450px] h-full bg-[#121212] shadow-2xl flex flex-col z-10">
        
        {/* Video Area */}
        <div className="relative flex-1 bg-black overflow-hidden group">
          <video
            key={currentVideo.id}
            src={currentVideo.url}
            className="w-full h-full object-contain"
            autoPlay
            loop
            playsInline
          />

          {/* Controls Overlay */}
          <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
            {/* Top Bar */}
            <div className="flex justify-center items-center pt-2">
              <div className="flex gap-4">
                <span className="text-white/60 text-sm font-bold">Подписки</span>
                <span className="text-white text-sm font-bold border-b-2 border-white pb-1">Для вас</span>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="absolute right-4 bottom-32 flex flex-col gap-6 items-center pointer-events-auto">
              <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden mb-2">
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                  COIN
                </div>
              </div>

              <button 
                onClick={() => toggleLike(currentVideo.id)}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/60 transition">
                  <Heart className={`w-7 h-7 ${liked[currentVideo.id] ? "fill-red-500 text-red-500" : "text-white"}`} />
                </div>
                <span className="text-white text-xs font-bold shadow-sm">
                  {liked[currentVideo.id] ? currentVideo.likes + 1 : currentVideo.likes}
                </span>
              </button>

              <button className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/60 transition">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <span className="text-white text-xs font-bold shadow-sm">{currentVideo.comments}</span>
              </button>

              <button className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/60 transition">
                  <Share2 className="w-7 h-7 text-white" />
                </div>
                <span className="text-white text-xs font-bold shadow-sm">Share</span>
              </button>
            </div>

            {/* Bottom Info */}
            <div className="pointer-events-auto bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 pt-20 -mx-4 -mb-4">
              <h3 className="text-white font-bold text-lg mb-1">@{currentVideo.author}</h3>
              <p className="text-white text-sm leading-snug mb-4 line-clamp-2">
                {currentVideo.title} #coinis #shopping #deals
              </p>
              
              <button 
                onClick={() => setLocation("/catalog")}
                className="w-full bg-[#00f2ea] text-black font-black py-4 rounded-lg flex items-center justify-center gap-2 hover:brightness-110 transition active:scale-95 uppercase tracking-wider"
              >
                <ShoppingBag className="w-6 h-6" />
                Купить сейчас
              </button>
            </div>
          </div>

          {/* Navigation Arrows (Desktop) */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
            <button onClick={prevVideo} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 pointer-events-auto">
              <ChevronUp className="w-6 h-6" />
            </button>
            <button onClick={nextVideo} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 pointer-events-auto">
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="hidden xl:block absolute left-20 top-1/2 -translate-y-1/2 text-white/5 pointer-events-none select-none">
        <h1 className="text-[180px] font-black leading-none">REELS</h1>
      </div>
      <div className="hidden xl:block absolute right-20 top-1/2 -translate-y-1/2 text-white/5 pointer-events-none select-none">
        <h1 className="text-[180px] font-black leading-none">COIN</h1>
      </div>
    </div>
  );
}
