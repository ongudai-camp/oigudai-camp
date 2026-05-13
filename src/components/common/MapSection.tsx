"use client";

import dynamic from "next/dynamic";

const LocationMap = dynamic(() => import("@/components/common/LocationMap"), { ssr: false });

interface MapSectionProps {
  latitude: number;
  longitude: number;
  title: string;
  address: string | null;
}

export default function MapSection({ latitude, longitude, title, address }: MapSectionProps) {
  return (
    <LocationMap
      latitude={latitude}
      longitude={longitude}
      title={title}
      address={address}
    />
  );
}
