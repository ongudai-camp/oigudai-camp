"use client";

import { useState, useEffect } from "react";
import { getFacilitiesAction } from "@/app/actions/room-meta";
import LucideIcon from "@/components/common/LucideIcon";

export default function FacilitiesManagement() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFacilities() {
      const res = await getFacilitiesAction();
      if (res.facilities) {
        setFacilities(res.facilities);
      }
      setLoading(false);
    }
    fetchFacilities();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-sky-950">Управление удобствами</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          + Добавить удобство
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-sky-50 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-sky-50 text-sky-950 text-sm font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Иконка</th>
              <th className="px-6 py-4">Название</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-50">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sky-600">Загрузка...</td>
              </tr>
            ) : facilities.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sky-600">Удобства не найдены</td>
              </tr>
            ) : (
              facilities.map((f) => (
                <tr key={f.id} className="hover:bg-sky-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="p-2 bg-sky-100 text-sky-600 rounded-lg w-fit">
                      <LucideIcon name={f.icon || "HelpCircle"} size={20} />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-sky-950">{f.name}</td>
                  <td className="px-6 py-4 text-sky-600 font-mono text-sm">{f.slug}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="text-sky-600 hover:text-sky-800 transition-colors">Изменить</button>
                      <button className="text-red-500 hover:text-red-700 transition-colors">Удалить</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
