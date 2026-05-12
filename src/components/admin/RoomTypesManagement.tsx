"use client";

import { useState, useEffect } from "react";
import { getRoomTypesAction } from "@/app/actions/room-meta";

export default function RoomTypesManagement() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTypes() {
      const res = await getRoomTypesAction();
      if (res.types) {
        setTypes(res.types);
      }
      setLoading(false);
    }
    fetchTypes();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-sky-950">Типы размещения</h1>
        <button className="bg-orange-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-orange-600 transition-colors">
          + Добавить тип
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-sky-50 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-sky-50 text-sky-950 text-sm font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Название</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">Описание</th>
              <th className="px-6 py-4">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-50">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sky-600">Загрузка...</td>
              </tr>
            ) : types.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sky-600">Типы не найдены</td>
              </tr>
            ) : (
              types.map((t) => (
                <tr key={t.id} className="hover:bg-sky-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-sky-950">{t.name}</td>
                  <td className="px-6 py-4 text-sky-600 font-mono text-sm">{t.slug}</td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{t.description}</td>
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
