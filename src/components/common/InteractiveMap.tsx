"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapPost {
  id: number;
  title: string;
  price: number;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface InteractiveMapProps {
  posts: MapPost[];
}

export default function InteractiveMap({ posts }: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const validPosts = posts.filter((p) => p.latitude && p.longitude);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const defaultIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    L.Marker.prototype.options.icon = defaultIcon;

    const map = L.map(containerRef.current, {
      center: [50.75, 86.0],
      zoom: 9,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    if (validPosts.length > 0) {
      const bounds = L.latLngBounds(validPosts.map((p) => [p.latitude!, p.longitude!]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    validPosts.forEach((post) => {
      const marker = L.marker([post.latitude!, post.longitude!]).addTo(map);
      marker.bindPopup(
        `<b>${post.title}</b><br/>${post.address || ""}<br/><b>${post.price} ₽</b>`
      );
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full h-[450px] md:h-[650px] rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden border border-white/50 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-tr from-sky-200/20 via-transparent to-orange-100/10 pointer-events-none z-[500]" />
      {validPosts.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-sky-50 z-10">
          <p className="text-sky-700 font-medium">Нет объектов с координатами на карте</p>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full z-0" />
    </div>
  );
}
