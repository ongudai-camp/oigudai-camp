"use client";

import dynamic from "next/dynamic";
import { ComponentProps } from "react";

const InteractiveMap = dynamic(() => import("@/components/common/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] md:h-[650px] rounded-[2.5rem] md:rounded-[3.5rem] bg-sky-50 animate-pulse flex items-center justify-center">
      <span className="text-sky-700 font-medium">Загрузка карты...</span>
    </div>
  ),
});

type InteractiveMapProps = ComponentProps<typeof InteractiveMap>;

export default function DynamicMap(props: InteractiveMapProps) {
  return <InteractiveMap {...props} />;
}
