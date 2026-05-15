"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface LocationPickerProps {
  address: string;
  latitude: number | null;
  longitude: number | null;
  onChange: (data: { address: string; latitude: number | null; longitude: number | null }) => void;
}

export default function LocationPicker({ address, latitude, longitude, onChange }: LocationPickerProps) {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState(address || "");
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const updateMarker = useCallback((lat: number, lng: number) => {
    const L = LRef.current;
    if (!L) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else if (mapRef.current) {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(mapRef.current);
      markerRef.current.on("dragend", () => {
        const pos = markerRef.current!.getLatLng();
        reverseGeocode(pos.lat, pos.lng);
      });
    }
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], mapRef.current.getZoom());
    }
  }, []);

  async function reverseGeocode(lat: number, lng: number) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ru`,
        { headers: { "User-Agent": "OngudaiCamp/1.0" } }
      );
      const data = await res.json();
      const displayName = data.display_name || "";
      setSearchQuery(displayName);
      onChange({ address: displayName, latitude: lat, longitude: lng });
    } catch {
      setSearchQuery(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      onChange({ address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, latitude: lat, longitude: lng });
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&accept-language=ru`,
        { headers: { "User-Agent": "OngudaiCamp/1.0" } }
      );
      const data: { lat: string; lon: string; display_name: string }[] = await res.json();
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setSearchQuery(data[0].display_name);
        updateMarker(lat, lng);
        onChange({ address: data[0].display_name, latitude: lat, longitude: lng });
      }
    } catch {
      // silent
    }
    setSearching(false);
    setSuggestions([]);
  }

  async function handleSuggestionClick(displayName: string) {
    setSearchQuery(displayName);
    setSuggestions([]);
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(displayName)}&limit=1&accept-language=ru`,
        { headers: { "User-Agent": "OngudaiCamp/1.0" } }
      );
      const data: { lat: string; lon: string }[] = await res.json();
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        updateMarker(lat, lng);
        onChange({ address: displayName, latitude: lat, longitude: lng });
      }
    } catch {
      // silent
    }
    setSearching(false);
  }

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    async function initMap() {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      if (cancelled || mapRef.current) return;

      LRef.current = L;

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

      const container = containerRef.current!;
      delete (container as any)._leaflet_id;

      const map = L.map(container, {
        center: [50.75, 86.0],
        zoom: 9,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      map.on("click", (e: any) => {
        reverseGeocode(e.latlng.lat, e.latlng.lng);
        updateMarker(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = map;

      if (latitude && longitude) {
        updateMarker(latitude, longitude);
      }
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        (mapRef.current as any).remove();
      }
      mapRef.current = null;
      markerRef.current = null;
      LRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSearchQuery(address || "");
  }, [address]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={async (e) => {
              const val = e.target.value;
              setSearchQuery(val);
              if (val.length > 2) {
                try {
                  const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5&accept-language=ru`,
                    { headers: { "User-Agent": "OngudaiCamp/1.0" } }
                  );
                  const data: { display_name: string }[] = await res.json();
                  setSuggestions(data.map((d) => d.display_name));
                } catch {
                  setSuggestions([]);
                }
              } else {
                setSuggestions([]);
              }
            }}
            placeholder="Поиск места на карте..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all font-medium cursor-pointer"
          >
            {searching ? "..." : "Найти"}
          </button>
        </div>
        {suggestions.length > 0 && (
          <ul className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 z-[1000] max-h-48 overflow-y-auto">
            {suggestions.map((s, i) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick(s)}
                  className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm text-gray-700 transition-colors cursor-pointer"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div ref={containerRef} className="w-full h-[350px] rounded-xl border border-gray-300 overflow-hidden z-0" />

      {latitude && longitude && (
        <div className="flex gap-4 text-sm text-gray-900">
          <span>Широта: {latitude.toFixed(6)}</span>
          <span>Долгота: {longitude.toFixed(6)}</span>
        </div>
      )}
    </div>
  );
}
