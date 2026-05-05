"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Room {
  id: number;
  title: string;
  price: number;
  salePrice: number | null;
}

interface BookingFormProps {
  hotelId: number;
  rooms: Room[];
}

export default function BookingForm({ hotelId, rooms }: BookingFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
    roomId: rooms.length > 0 ? rooms[0].id : "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedRoom = rooms.find((r) => r.id === parseInt(formData.roomId as string));
  const pricePerNight = selectedRoom
    ? selectedRoom.salePrice || selectedRoom.price
    : 0;

  const calculateTotal = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const start = new Date(formData.checkIn);
    const end = new Date(formData.checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights * pricePerNight : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      router.push("/auth/signin?callbackUrl=" + encodeURIComponent(window.location.href));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postId: hotelId,
            roomId: formData.roomId ? parseInt(formData.roomId as string) : null,
            checkIn: formData.checkIn,
            checkOut: formData.checkOut,
            guests: formData.guests,
            totalPrice: calculateTotal(),
          }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Ошибка бронирования");
      }

      const booking = await res.json();
      router.push(`/dashboard/bookings/${booking.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">Забронировать</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {rooms.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Номер
            </label>
            <select
              value={formData.roomId}
              onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.title} - {room.salePrice || room.price} ₽/ночь
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Заезд *
          </label>
          <input
            type="date"
            required
            min={new Date().toISOString().split("T")[0]}
            value={formData.checkIn}
            onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Выезд *
          </label>
          <input
            type="date"
            required
            min={formData.checkIn || new Date().toISOString().split("T")[0]}
            value={formData.checkOut}
            onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Гости *
          </label>
          <input
            type="number"
            required
            min="1"
            max="10"
            value={formData.guests}
            onChange={(e) =>
              setFormData({ ...formData, guests: parseInt(e.target.value) })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Price Summary */}
        <div className="border-t pt-4">
          <div className="flex justify-between mb-2">
            <span>Цена за ночь:</span>
            <span>{pricePerNight} ₽</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Итого:</span>
            <span>{calculateTotal()} ₽</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Обработка..." : "Забронировать"}
        </button>
      </form>
    </div>
  );
}
