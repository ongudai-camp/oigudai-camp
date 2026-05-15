"use client";

import { useState, useEffect } from "react";
import { Settings, Check } from "lucide-react";
import clsx from "clsx";

export default function VariationSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [current, setCurrent] = useState(() => {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/nav-variation=([^;]+)/);
      return match ? match[1] : "realcrea";
    }
    return "realcrea";
  });

  const variations = [
    { id: "realcrea", name: "Realcrea (Centered)", desc: "Modern real estate style" },
    { id: "mega", name: "Mega Menu", desc: "Immersive immersive layout" },
    { id: "floating", name: "Glass Floating", desc: "Detached glassmorphism" },
    { id: "sidebar", name: "Side Sidebar", desc: "Professional dashboard look" },
  ];

  const switchVariation = (id: string) => {
    setCurrent(id);
    window.location.reload();
  };

  useEffect(() => {
    document.cookie = `nav-variation=${current}; path=/; max-age=31536000`;
  }, [current]);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100]">
       <button 
         onClick={() => setIsOpen(!isOpen)}
         className="w-12 h-12 sm:w-14 sm:h-14 bg-sky-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
       >
         <Settings className={clsx("w-5 h-5 sm:w-6 sm:h-6", isOpen && "rotate-90")} />
       </button>

       {isOpen && (
         <div className="absolute bottom-16 sm:bottom-20 right-0 w-[calc(100vw-2rem)] sm:w-72 bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="font-black text-sky-900 text-base sm:text-lg mb-4 tracking-tight text-center">Menu Variations</h3>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
               {variations.map((v) => (
                 <button
                   key={v.id}
                   onClick={() => switchVariation(v.id)}
                   className={clsx(
                     "w-full flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all border-2 text-left",
                     current === v.id 
                       ? "bg-orange-50 border-orange-500 text-orange-900" 
                       : "bg-gray-50 border-transparent text-gray-900 hover:bg-gray-100"
                   )}
                 >
                    <div>
                       <div className="font-bold text-xs sm:text-sm">{v.name}</div>
                       <div className="text-[9px] sm:text-[10px] opacity-60 font-medium">{v.desc}</div>
                    </div>
                    {current === v.id && <Check className="w-4 h-4" />}
                 </button>
               ))}
            </div>
            <p className="mt-4 text-[9px] sm:text-[10px] text-gray-900 text-center font-medium uppercase tracking-widest">Select to reload system</p>
         </div>
       )}
    </div>
  );
}
