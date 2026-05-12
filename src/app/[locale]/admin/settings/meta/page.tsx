"use client";

import { useState } from "react";
import FacilitiesManagement from "@/components/admin/FacilitiesManagement";
import RoomTypesManagement from "@/components/admin/RoomTypesManagement";

export default function MetaManagementPage() {
  const [activeTab, setActiveTab] = useState<"facilities" | "types">("facilities");

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex gap-4 mb-8 border-b border-sky-100 pb-px">
        <button
          onClick={() => setActiveTab("facilities")}
          className={`px-6 py-3 font-bold transition-all ${
            activeTab === "facilities"
              ? "text-orange-500 border-b-2 border-orange-500"
              : "text-sky-950/40 hover:text-sky-950"
          }`}
        >
          Удобства
        </button>
        <button
          onClick={() => setActiveTab("types")}
          className={`px-6 py-3 font-bold transition-all ${
            activeTab === "types"
              ? "text-orange-500 border-b-2 border-orange-500"
              : "text-sky-950/40 hover:text-sky-950"
          }`}
        >
          Типы размещения
        </button>
      </div>

      {activeTab === "facilities" ? <FacilitiesManagement /> : <RoomTypesManagement />}
    </div>
  );
}
