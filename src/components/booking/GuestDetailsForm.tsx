"use client";

import { User, Phone, Mail, MessageSquare } from "lucide-react";

interface GuestDetailsFormProps {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests: string;
  onChange: (field: string, value: string) => void;
}

export default function GuestDetailsForm({
  guestName,
  guestEmail,
  guestPhone,
  specialRequests,
  onChange,
}: GuestDetailsFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
          <User size={12} /> Full name
        </label>
        <input
          type="text"
          value={guestName}
          onChange={(e) => onChange("guestName", e.target.value)}
          placeholder="Your full name"
          className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <Mail size={12} /> Email
          </label>
          <input
            type="email"
            value={guestEmail}
            onChange={(e) => onChange("guestEmail", e.target.value)}
            placeholder="your@email.com"
            className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <Phone size={12} /> Phone
          </label>
          <input
            type="tel"
            value={guestPhone}
            onChange={(e) => onChange("guestPhone", e.target.value)}
            placeholder="+7 (___) ___-__-__"
            className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
          <MessageSquare size={12} /> Special requests
        </label>
        <textarea
          value={specialRequests}
          onChange={(e) => onChange("specialRequests", e.target.value)}
          placeholder="Any special requests? (optional)"
          rows={2}
          className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all resize-none"
        />
      </div>
    </div>
  );
}
