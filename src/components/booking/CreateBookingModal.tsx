"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Loader2, Search, Plus, AlertCircle } from "lucide-react";
import UnifiedCalendar from "@/components/calendar/UnifiedCalendar";

interface User {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
}

interface Post {
  id: number;
  title: string;
  type: string;
  price: number;
  salePrice: number | null;
}

interface Room {
  id: number;
  title: string;
  price: number;
  guests: number;
}

interface CreateBookingModalProps {
  onClose: () => void;
}

export default function CreateBookingModal({ onClose }: CreateBookingModalProps) {
  const queryClient = useQueryClient();

  const [userQuery, setUserQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [postType, setPostType] = useState<"hotel" | "tour" | "activity">("hotel");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [status, setStatus] = useState("pending");
  const [paymentStatus, setPaymentStatus] = useState("unpaid");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const { data: users } = useQuery({
    queryKey: ["admin-users-search", userQuery],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(userQuery)}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json() as Promise<User[]>;
    },
    enabled: userQuery.length > 0,
  });

  const { data: posts } = useQuery({
    queryKey: ["admin-posts-by-type", postType],
    queryFn: async () => {
      const res = await fetch(`/api/admin/${postType === "hotel" ? "hotels" : postType === "tour" ? "tours" : "activities"}`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json() as Promise<Post[]>;
    },
  });

  const { data: rooms } = useQuery({
    queryKey: ["admin-rooms-for-post", selectedPost?.id],
    queryFn: async () => {
      if (!selectedPost) return [];
      const res = await fetch(`/api/admin/hotels/${selectedPost.id}`);
      if (!res.ok) throw new Error("Failed to fetch rooms");
      const data = await res.json();
      return data.rooms as Room[];
    },
    enabled: postType === "hotel" && !!selectedPost,
  });

  const handlePostSelect = (post: Post) => {
    setSelectedPost(post);
    setSelectedRoom(null);
    const basePrice = post.salePrice || post.price;
    setTotalPrice(postType === "hotel" ? basePrice : basePrice * guests);
  };

  const handleGuestsChange = (n: number) => {
    setGuests(n);
    if (selectedPost && postType !== "hotel") {
      setTotalPrice((selectedPost.salePrice || selectedPost.price) * n);
    }
  };

  const handleDateSelect = (dateStr: string) => {
    setCheckIn(dateStr);
    setError("");
  };

  const handleRangeSelect = (start: string, end: string) => {
    setCheckIn(start);
    setCheckOut(start === end ? "" : end);
    setError("");
  };

  const createMutation = useMutation({
    mutationFn: async (data: {
      userId: number;
      postId: number;
      roomId?: number | null;
      checkIn: string;
      checkOut?: string;
      guests: number;
      totalPrice: number;
      status: string;
      paymentStatus: string;
    }) => {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create booking");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      onClose();
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedPost || !checkIn) {
      setError("Заполните все обязательные поля");
      return;
    }

    if (postType === "hotel" && !checkOut) {
      setError("Выберите дату выезда для отеля");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const checkRes = await fetch(
        `/api/availability/check?postId=${selectedPost.id}${postType === "hotel" && selectedRoom?.id ? `&roomId=${selectedRoom.id}` : ""}&checkIn=${checkIn}${checkOut ? `&checkOut=${checkOut}` : ""}`
      );
      const checkData = await checkRes.json();
      if (!checkData.available) {
        throw new Error(checkData.conflict || "Selected dates are not available");
      }
    } catch (err: unknown) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : String(err));
      return;
    }

    createMutation.mutate({
      userId: selectedUser.id,
      postId: selectedPost.id,
      roomId: postType === "hotel" ? selectedRoom?.id : null,
      checkIn,
      checkOut: postType === "hotel" ? checkOut : undefined,
      guests,
      totalPrice,
      status,
      paymentStatus,
    });
  };

  const isHotel = postType === "hotel";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Создать бронирование</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {/* User Select */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600">Пользователь *</label>
            {selectedUser ? (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                <div>
                  <span className="font-medium text-sm text-gray-900">{selectedUser.name || "Без имени"}</span>
                  <span className="text-xs text-gray-500 ml-2">{selectedUser.email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedUser(null); setUserQuery(""); }}
                  className="text-red-500 hover:text-red-700 text-sm font-medium cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="text"
                  value={userQuery}
                  onChange={(e) => { setUserQuery(e.target.value); setShowUserDropdown(true); }}
                  onFocus={() => setShowUserDropdown(true)}
                  placeholder="Поиск пользователя по имени или email..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                />
                {showUserDropdown && users && users.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {users.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => { setSelectedUser(user); setShowUserDropdown(false); setUserQuery(""); }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0"
                      >
                        <span className="font-medium text-sm text-gray-900">{user.name || "Без имени"}</span>
                        <span className="text-xs text-gray-500 ml-2">{user.email || user.phone}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Post Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600">Тип объекта *</label>
            <div className="flex gap-2">
              {(["hotel", "tour", "activity"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setPostType(t); setSelectedPost(null); setSelectedRoom(null); setCheckIn(""); setCheckOut(""); }}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    postType === t
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {t === "hotel" ? "Отель" : t === "tour" ? "Тур" : "Активность"}
                </button>
              ))}
            </div>
          </div>

          {/* Post Select */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600">Объект *</label>
            <select
              value={selectedPost?.id || ""}
              onChange={(e) => {
                const post = posts?.find((p) => p.id === parseInt(e.target.value));
                if (post) handlePostSelect(post);
              }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer"
            >
              <option value="">Выберите объект</option>
              {posts?.map((post) => (
                <option key={post.id} value={post.id}>
                  {post.title} — {(post.salePrice || post.price).toLocaleString()} ₽
                </option>
              ))}
            </select>
          </div>

          {/* Room Select (hotels only) */}
          {isHotel && rooms && rooms.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600">Комната</label>
              <select
                value={selectedRoom?.id || ""}
                onChange={(e) => {
                  const room = rooms.find((r) => r.id === parseInt(e.target.value));
                  setSelectedRoom(room || null);
                  if (room) setTotalPrice(room.price);
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer"
              >
                <option value="">Без комнаты</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.title} — {room.price.toLocaleString()} ₽ ({room.guests} чел.)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Calendar */}
          {selectedPost && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                {isHotel ? "Даты заезда/выезда *" : "Дата *"}
              </label>
              <UnifiedCalendar
                type="customer"
                postId={selectedPost.id}
                propertyType={postType}
                selectionMode={isHotel ? "range" : "single"}
                rangeStart={checkIn || undefined}
                rangeEnd={checkOut || undefined}
                onRangeSelect={isHotel ? handleRangeSelect : undefined}
                onDateSelect={!isHotel ? handleDateSelect : undefined}
                selectedDate={!isHotel ? checkIn : undefined}
                locale="ru"
                compact
              />
            </div>
          )}

          {/* Guests */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600">Гостей</label>
            <input
              type="number"
              min={1}
              max={50}
              value={guests}
              onChange={(e) => handleGuestsChange(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600">Сумма (₽) *</label>
            <input
              type="number"
              required
              min={0}
              value={totalPrice}
              onChange={(e) => setTotalPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
            />
          </div>

          {/* Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600">Статус</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer"
              >
                <option value="pending">Ожидание</option>
                <option value="confirmed">Подтверждено</option>
                <option value="completed">Завершено</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600">Оплата</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer"
              >
                <option value="unpaid">Не оплачено</option>
                <option value="paid">Оплачено</option>
                <option value="refunded">Возвращено</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !selectedUser || !selectedPost || !checkIn}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
          >
            {submitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <><Plus size={18} /> Создать бронирование</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
