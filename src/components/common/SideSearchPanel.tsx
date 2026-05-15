"use client";

import { useState } from "react";
import { 
  Search, 
  MapPin, 
  ChevronDown, 
  Plus, 
  Check,
  X,
  SlidersHorizontal,
  ArrowRight
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";

export default function SideSearchPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentType = searchParams.get("type");

  const [activeTab, setActiveTab] = useState("rent"); 
  const [includeSurrounding, setIncludeSurrounding] = useState(true);
  const [query, setQ] = useState(searchParams.get("q") || "");

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) params.set("q", query);
    else params.delete("q");
    router.push(`?${params.toString()}`);
  };

  const filterSections = [
    {
      label: "Удобства",
      options: [
        { label: "Можно с питомцами", id: "pets" },
        { label: "Шкафы купе", id: "wardrobes" },
        { label: "Газ", id: "gas" },
        { label: "Отопление", id: "heating" },
        { label: "Балкон", id: "balcony" },
        { label: "Кондиционер", id: "ac" },
        { label: "Кабинет", id: "study" },
        { label: "Прачечная", id: "laundry" },
        { label: "Посудомойка", id: "dishwasher" },
        { label: "Сад", id: "garden" },
      ]
    }
  ];

  return (
    <div className="w-full max-w-[320px] bg-white rounded-[2rem] shadow-xl border border-sky-100/50 overflow-hidden flex flex-col h-fit animate-in fade-in slide-in-from-left-4 duration-1000">
      {/* Tabs */}
      <div className="flex bg-sky-50/50 p-1.5 rounded-[1.5rem] m-3">
        {["Купить", "Аренда", "Продано"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={clsx(
              "flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all duration-300 rounded-2xl",
              activeTab === tab.toLowerCase() 
                ? "text-white bg-sky-950 shadow-lg shadow-sky-950/20" 
                : "text-indigo-700/40 hover:text-indigo-700 hover:bg-white"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-8 overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar">
        {/* Location */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-sky-600 flex items-center justify-between">
            <span className="flex items-center gap-2"><MapPin size={12} className="text-orange-500" /> Местоположение</span>
            <button className="hover:text-orange-500 transition-colors">Очистить</button>
          </label>
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Поиск по району..."
              value={query}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-sky-50/50 border border-sky-100 rounded-2xl px-5 py-4 text-sm font-bold text-indigo-700 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 transition-all placeholder:text-sky-900/20"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-sky-500 w-4 h-4 pointer-events-none group-focus-within:text-sky-700 transition-colors" />
          </div>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={clsx(
              "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
              includeSurrounding ? "bg-orange-500 border-orange-500 shadow-lg shadow-orange-500/20" : "bg-white border-sky-100 group-hover:border-sky-300"
            )}
            onClick={() => setIncludeSurrounding(!includeSurrounding)}
            >
              {includeSurrounding && <Check className="w-3.5 h-3.5 text-white stroke-[4px] animate-in zoom-in-50 duration-300" />}
            </div>
            <span className="text-xs font-bold text-indigo-700/60 group-hover:text-indigo-700 transition-colors">Включая окрестности</span>
          </label>
        </div>

        {/* Price Range */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-sky-600">Ценовой диапазон (₽)</label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative group">
              <select className="w-full appearance-none bg-sky-50/50 border border-sky-100 rounded-2xl px-5 py-4 text-sm font-bold text-indigo-700 outline-none cursor-pointer focus:border-sky-500 transition-all">
                <option>Любая</option>
                <option>2000</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-sky-500 pointer-events-none group-hover:text-sky-700 transition-colors" />
            </div>
            <div className="relative group">
              <select className="w-full appearance-none bg-sky-50/50 border border-sky-100 rounded-2xl px-5 py-4 text-sm font-bold text-indigo-700 outline-none cursor-pointer focus:border-sky-500 transition-all">
                <option>Любая</option>
                <option>15000</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-sky-500 pointer-events-none group-hover:text-sky-700 transition-colors" />
            </div>
          </div>
        </div>

        {/* Beds & Bathrooms */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-sky-600 whitespace-nowrap">Мин. спален</label>
            <div className="relative group">
              <select className="w-full appearance-none bg-sky-50/50 border border-sky-100 rounded-2xl px-5 py-4 text-sm font-bold text-indigo-700 outline-none cursor-pointer focus:border-sky-500 transition-all">
                <option>1</option>
                <option>2</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-sky-500 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-sky-600 whitespace-nowrap">Макс. спален</label>
            <div className="relative group">
              <select className="w-full appearance-none bg-sky-50/50 border border-sky-100 rounded-2xl px-5 py-4 text-sm font-bold text-indigo-700 outline-none cursor-pointer focus:border-sky-500 transition-all">
                <option>Любое</option>
                <option>3</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-sky-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Property Type */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-sky-600">Тип проживания</label>
          <div className="space-y-3">
            {(currentType ? [currentType] : ["cottage", "hotel-room"]).map((type) => (
              <div key={type} className="flex items-center justify-between bg-white border-2 border-sky-50 rounded-2xl px-5 py-3.5 group hover:border-sky-500 hover:shadow-md transition-all duration-300 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-sky-100 bg-sky-50 flex items-center justify-center transition-colors group-hover:bg-sky-500 group-hover:border-sky-500">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-black text-indigo-700 tracking-tight">
                    {type === "cottage" ? "Коттедж" : type === "hotel-room" ? "Отельный номер" : type?.replace("-", " ")}
                  </span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("type");
                    router.push(`?${params.toString()}`);
                  }}
                  className="text-sky-500 hover:text-red-500 transition-colors p-1"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-sky-700 hover:text-indigo-700 transition-all flex items-center justify-center gap-2 border-2 border-dashed border-sky-100 rounded-2xl hover:border-sky-300">
              <Plus size={14} /> Добавить тип
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4 pt-6 border-t border-sky-100/50">
          <label className="text-[10px] font-black uppercase tracking-widest text-sky-600 flex items-center justify-between">
            {filterSections[0].label} <SlidersHorizontal size={12} className="text-sky-500" />
          </label>
          <div className="grid grid-cols-1 gap-3">
            {filterSections[0].options.slice(0, 5).map((option) => (
              <label key={option.id} className="flex items-center gap-3 cursor-pointer group p-1">
                <div className="w-5 h-5 rounded border-2 border-sky-100 bg-sky-50/30 group-hover:border-sky-500 transition-all" />
                <span className="text-xs font-bold text-indigo-700/60 group-hover:text-indigo-700 transition-colors">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 pt-2 bg-white sticky bottom-0 space-y-3">
        <button 
          onClick={handleSearch}
          className="w-full bg-sky-950 hover:bg-sky-900 text-white py-5 rounded-[1.25rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-sky-950/20 transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          Обновить поиск <ArrowRight size={16} className="text-sky-700" />
        </button>
        <button className="w-full bg-white border-2 border-sky-100 text-indigo-700 hover:border-sky-200 py-4 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">
          Сохранить параметры
        </button>
      </div>
    </div>
  );
}
