"use client";

import { 
  Search, 
  ChevronDown, 
  Plus, 
  Maximize2,
  Minus,
  Navigation,
  X,
  Compass,
  ArrowRight,
  Star
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import clsx from "clsx";

export default function InteractiveMap() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentType = searchParams.get("type");
  const mockPins = [
    { id: 1, x: "25%", y: "35%", price: "4500", title: "Коттедж Кедр" },
    { id: 2, x: "45%", y: "45%", price: "3200", count: 3, title: "Основной корпус" },
    { id: 3, x: "65%", y: "55%", price: "2800", title: "Эко-аил" },
    { id: 4, x: "30%", y: "70%", price: "5500", title: "VIP Коттедж" },
  ];

  const removeType = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("type");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="relative w-full h-[450px] md:h-[650px] bg-sky-50 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden border border-white/50 shadow-2xl group/map selection:bg-none">
      {/* Map Background - Gradient & Grid */}
      <div className="absolute inset-0 bg-[#E5E7EB] opacity-40 pattern-grid-lg" />
      <div className="absolute inset-0 bg-gradient-to-tr from-sky-200/20 via-transparent to-orange-100/10" />
      
      {/* Map Overlay Elements */}
      <div className="absolute inset-0 p-4 md:p-10 flex flex-col pointer-events-none z-20">
        {/* Top Controls */}
        <div className="flex flex-wrap gap-3 md:gap-4 pointer-events-auto">
          <div className="flex gap-2 bg-sky-950 p-1.5 rounded-[1.5rem] shadow-2xl border border-white/10 backdrop-blur-md">
            {currentType ? (
              <button 
                onClick={removeType}
                className="px-4 py-2 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl bg-orange-500 text-white flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600"
              >
                Тип: {currentType === "cottage" ? "Коттедж" : currentType.replace("-", " ")}
                <X size={14} className="stroke-[3px]" />
              </button>
            ) : (
              <button className="px-5 py-2 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl bg-white/10 text-white/90 hover:bg-white/20 transition-all">Все категории</button>
            )}
            <button className="hidden sm:flex px-5 py-2 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white/10 text-white/60 transition-all items-center gap-2">
              Цена <ChevronDown size={14} />
            </button>
          </div>
          
          <button className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-[1.25rem] text-[10px] md:text-xs font-black uppercase tracking-widest text-sky-950 shadow-xl border border-white flex items-center gap-2 hover:bg-white transition-all active:scale-95">
            Район <ChevronDown size={14} className="text-sky-300" />
          </button>
        </div>

        {/* Search Bar Overlay */}
        <div className="hidden sm:block mt-6 w-full max-w-sm pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="bg-white/90 backdrop-blur-2xl border border-white p-2.5 rounded-[1.75rem] shadow-2xl flex items-center gap-4 group/search ring-1 ring-sky-950/5">
            <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl group-focus-within/search:bg-sky-950 group-focus-within/search:text-white transition-all duration-500">
              <Search size={18} />
            </div>
            <div className="flex-1">
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-300 mb-0.5">Поиск по карте</div>
              <input type="text" placeholder="с. Онгудай, Алтай" className="bg-transparent border-none outline-none font-bold text-sky-950 w-full text-sm placeholder:text-sky-900/20" />
            </div>
            <button className="p-3 text-sky-200 hover:text-sky-950 transition-colors">
              <Compass size={20} className="animate-spin-slow" />
            </button>
          </div>
        </div>

        {/* Pins Layer */}
        <div className="absolute inset-0 z-10 overflow-hidden">
          {/* Topographical Lines Decor */}
          <svg className="absolute inset-0 w-full h-full text-sky-950/5 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 20 Q 25 15, 50 25 T 100 20" fill="none" stroke="currentColor" strokeWidth="0.1" />
            <path d="M0 40 Q 30 45, 60 35 T 100 45" fill="none" stroke="currentColor" strokeWidth="0.1" />
            <path d="M0 70 Q 20 65, 50 75 T 100 65" fill="none" stroke="currentColor" strokeWidth="0.1" />
          </svg>

          {mockPins.map((pin) => (
            <div 
              key={pin.id}
              className="absolute pointer-events-auto group/pin cursor-pointer animate-in fade-in zoom-in duration-1000 fill-mode-both"
              style={{ top: pin.y, left: pin.x, animationDelay: `${pin.id * 150}ms` }}
            >
              <div className="relative">
                <div className="bg-white text-sky-950 px-3 py-2 rounded-2xl shadow-2xl border border-white font-black text-xs transition-all duration-300 group-hover/pin:scale-110 group-hover/pin:bg-sky-950 group-hover/pin:text-white flex items-center gap-2">
                  {pin.count && <span className="w-5 h-5 bg-orange-500 text-white flex items-center justify-center rounded-lg text-[9px] shadow-lg shadow-orange-500/20">{pin.count}</span>}
                  {pin.price} ₽
                </div>
                {/* Pin Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-sky-950 text-white text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover/pin:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap translate-y-2 group-hover/pin:translate-y-0">
                  {pin.title}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-sky-950" />
                </div>
                {/* Point */}
                <div className="w-2 h-2 bg-sky-950 rounded-full mx-auto mt-2 shadow-[0_0_15px_rgba(14,165,233,0.5)] group-hover/pin:scale-150 transition-transform duration-300" />
              </div>
            </div>
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="mt-auto flex flex-col gap-2 pointer-events-auto w-fit animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
          <button className="p-3.5 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl text-sky-950 hover:bg-sky-950 hover:text-white transition-all duration-300 border border-white active:scale-90">
            <Plus size={20} className="stroke-[3px]" />
          </button>
          <button className="p-3.5 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl text-sky-950 hover:bg-sky-950 hover:text-white transition-all duration-300 border border-white active:scale-90">
            <Minus size={20} className="stroke-[3px]" />
          </button>
        </div>
      </div>

      {/* Floating Card Overlay */}
      <div className={clsx(
        "absolute z-30 transition-all duration-700 pointer-events-auto ease-out animate-in fade-in slide-in-from-right-12",
        "left-4 right-4 bottom-4 md:left-auto md:right-10 md:top-10 md:bottom-10 md:w-[440px]",
        "bg-white/80 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[3rem] border border-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col"
      )}>
        <div className="relative h-40 md:h-72 shrink-0 group/img overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="https://images.unsplash.com/photo-1445013541594-448f4a949ca0" 
            alt="Кедровая Усадьба"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover/img:scale-110" 
          />
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-black shadow-xl border border-white flex items-center gap-1.5">
            <Star size={12} className="text-orange-500 fill-orange-500" /> 4.9
          </div>
          <button className="absolute top-4 right-4 bg-sky-950/20 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-sky-950 transition-all border border-white/20">
            <Maximize2 size={18} />
          </button>
          {/* Image Pagination */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            <div className="w-8 h-1 rounded-full bg-white shadow-sm" />
            <div className="w-2 h-1 rounded-full bg-white/40" />
            <div className="w-2 h-1 rounded-full bg-white/40" />
          </div>
        </div>

        <div className="p-6 md:p-10 space-y-5 md:space-y-8 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Выбор путешественников</div>
              <h3 className="text-xl md:text-3xl font-black text-sky-950 tracking-tighter leading-tight">Кедровая Усадьба</h3>
            </div>
            <button className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all duration-500 hover:rotate-12 shadow-inner">
              <Navigation size={22} />
            </button>
          </div>

          <div className="flex flex-wrap gap-4 md:gap-6">
            {[
              { label: '4', sub: 'Гостей', icon: 'User' },
              { label: '2', sub: 'Кровати', icon: 'Bed' },
              { label: '1', sub: 'Ванная', icon: 'Bath' },
              { label: '120', sub: 'м²', icon: 'Maximize' }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-xl font-black text-sky-950">{stat.label}</span>
                <span className="text-[9px] font-black text-sky-300 uppercase tracking-widest">{stat.sub}</span>
              </div>
            ))}
          </div>

          <p className="text-sm md:text-base font-medium text-sky-900/50 leading-relaxed">
            Уникальный эко-отель, построенный полностью из векового кедра. Насладитесь ароматом хвои и панорамным видом на слияние рек...
          </p>

          <div className="mt-auto pt-6 border-t border-sky-50 flex items-center justify-between gap-6">
            <div className="space-y-0.5">
              <div className="text-[10px] font-black text-sky-300 uppercase tracking-widest">Цена за ночь</div>
              <div className="text-2xl md:text-4xl font-black text-sky-950 tracking-tighter">
                5500 ₽ <span className="text-xs md:text-sm font-bold text-sky-300 ml-1">/ ночь</span>
              </div>
            </div>
            <button className="flex-1 md:flex-none bg-sky-950 hover:bg-orange-500 text-white px-8 py-5 rounded-[1.5rem] font-black text-[11px] md:text-xs uppercase tracking-[0.2em] transition-all duration-500 shadow-2xl shadow-sky-950/20 hover:shadow-orange-500/40 active:scale-95 flex items-center justify-center gap-3 group/btn">
              Забронировать <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
