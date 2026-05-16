"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, Filter, Edit3, Wand2, LayoutGrid, CalendarDays } from "lucide-react";
import UnifiedCalendar from "@/components/calendar/UnifiedCalendar";
import InlineDateEditor from "@/components/calendar/InlineDateEditor";
import AdminOverviewCalendar from "@/components/calendar/AdminOverviewCalendar";
import type { CalendarResponse } from "@/components/calendar/types";

const STATUS_OPTIONS = ["available", "booked", "blocked"] as const;
const TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "hotel", label: "Hotels" },
  { value: "tour", label: "Tours" },
  { value: "activity", label: "Activities" },
];

export default function AdminCalendarPage() {
  const queryClient = useQueryClient();
  const today = useMemo(() => new Date(), []);
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>("available");
  const [bulkPrice, setBulkPrice] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [editDate, setEditDate] = useState<string | null>(null);
  const [quickPrice, setQuickPrice] = useState<string>("");
  const [overview, setOverview] = useState(false);

  const handleQuickPrice = () => {
    if (!selectedProperty || !quickPrice) return;
    const price = parseFloat(quickPrice);
    if (isNaN(price)) return;

    const cached = queryClient.getQueryData<CalendarResponse>(["calendar", today.getFullYear(), today.getMonth() + 1, selectedProperty, filterType || undefined]);
    if (!cached?.dates) return;

    const availableDates = Object.entries(cached.dates)
      .filter(([, info]) => info.status === "available" || info.status === "limited")
      .map(([dateStr]) => dateStr);

    if (availableDates.length === 0) return;

    saveMutation.mutate({
      postId: selectedProperty,
      roomId: selectedRoom,
      dates: availableDates,
      status: "available",
      price,
    });

    setQuickPrice("");
  };

  const { data: properties } = useQuery({
    queryKey: ["admin-all-properties", filterType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterType) params.set("type", filterType);
      const res = await fetch(`/api/admin/hotels${filterType ? `?${params}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch properties");
      const data = await res.json();
      return (Array.isArray(data) ? data : data.hotels || data.posts || data) as Array<{
        id: number; title: string; type: string;
      }>;
    },
  });

  const { data: rooms } = useQuery({
    queryKey: ["admin-property-rooms", selectedProperty],
    queryFn: async () => {
      if (!selectedProperty) return [];
      const res = await fetch(`/api/admin/hotels/${selectedProperty}`);
      if (!res.ok) throw new Error("Failed to fetch rooms");
      const data = await res.json();
      return data.rooms || [];
    },
    enabled: !!selectedProperty,
  });

  const saveMutation = useMutation({
    mutationFn: async (body: {
      postId: number; roomId: number | null; dates: string[]; status: string; price?: number;
    }) => {
      const res = await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      setSelectedDates(new Set());
    },
  });

  const handleToggleDate = useCallback((dateStr: string) => {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr);
      else next.add(dateStr);
      return next;
    });
  }, []);

  const handleSave = () => {
    if (!selectedProperty || selectedDates.size === 0) return;
    saveMutation.mutate({
      postId: selectedProperty,
      roomId: selectedRoom,
      dates: Array.from(selectedDates),
      status: bulkStatus,
      ...(bulkPrice ? { price: parseFloat(bulkPrice) } : {}),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">Manage availability across all property types</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOverview(!overview)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-colors cursor-pointer ${
              overview ? "bg-blue-600 text-white" : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {overview ? <LayoutGrid size={16} /> : <CalendarDays size={16} />}
            {overview ? "Grid" : "Overview"}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Filter size={16} />
            Filters
          </button>
        </div>
      </div>

      {overview ? (
        <div className="mb-6">
          <AdminOverviewCalendar locale="ru" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Property
              </label>
              <select
                value={selectedProperty ?? ""}
                onChange={(e) => {
                  setSelectedProperty(e.target.value ? parseInt(e.target.value) : null);
                  setSelectedRoom(null);
                }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm cursor-pointer bg-white text-gray-900"
              >
                <option value="">Select property...</option>
                {(properties || []).map((p: { id: number; title: string }) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Room (optional)
              </label>
              <select
                value={selectedRoom ?? ""}
                onChange={(e) => setSelectedRoom(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm cursor-pointer bg-white text-gray-900"
                disabled={!selectedProperty}
              >
                <option value="">All rooms</option>
                {(rooms || []).map((r: { id: number; title: string }) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>
          </div>

          {showFilters && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Property type
              </label>
              <div className="flex flex-wrap gap-2">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFilterType(opt.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer ${
                      filterType === opt.value
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <UnifiedCalendar
            type="admin"
            postId={selectedProperty ?? undefined}
            propertyType={filterType || undefined}
            selectedDates={selectedDates}
            onToggleDate={handleToggleDate}
            locale="ru"
          />
        </div>
      )}

      {selectedProperty && selectedDates.size > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-gray-900">
              {selectedDates.size} day{selectedDates.size > 1 ? "s" : ""} selected
            </h3>
            {selectedDates.size === 1 && (
              <button
                onClick={() => setEditDate(Array.from(selectedDates)[0])}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
              >
                <Edit3 size={12} />
                Edit date
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-medium">Status</label>
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm cursor-pointer bg-white"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s === "available" ? "Available" : s === "booked" ? "Booked" : "Blocked"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-medium">
                Price (₽, optional)
              </label>
              <input
                type="number"
                value={bulkPrice}
                onChange={(e) => setBulkPrice(e.target.value)}
                placeholder="Keep current"
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-36"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {saveMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Apply
            </button>
          </div>
        </div>
      )}

      {selectedProperty && !editDate && (
        <div className="bg-white rounded-xl shadow-lg p-6 mt-4">
          <h3 className="font-bold text-sm text-gray-900 mb-3">Quick price</h3>
          <p className="text-xs text-gray-500 mb-3">
            Set a price for all available/limited dates in the current month
          </p>
          <div className="flex items-end gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-medium">Price (₽)</label>
              <input
                type="number"
                value={quickPrice}
                onChange={(e) => setQuickPrice(e.target.value)}
                placeholder="Enter price"
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm w-36"
              />
            </div>
            <button
              onClick={handleQuickPrice}
              disabled={saveMutation.isPending || !quickPrice}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {saveMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Wand2 size={16} />
              )}
              Apply to month
            </button>
          </div>
        </div>
      )}

      {editDate && selectedProperty && (
        <InlineDateEditor
          dateStr={editDate}
          postId={selectedProperty}
          roomId={selectedRoom}
          onClose={() => setEditDate(null)}
        />
      )}
    </div>
  );
}
