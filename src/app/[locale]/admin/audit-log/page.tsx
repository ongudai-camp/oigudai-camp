"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

interface AuditLogEntry {
  id: number;
  action: string;
  entity: string;
  entityId: string;
  metadata: string | null;
  createdAt: string;
  user: { name: string | null; email: string | null } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const ENitY_COLORS: Record<string, string> = {
  booking: "text-blue-600 bg-blue-50",
  user: "text-green-600 bg-green-50",
  post: "text-purple-600 bg-purple-50",
  review: "text-orange-600 bg-orange-50",
  addon: "text-indigo-600 bg-indigo-50",
  promocode: "text-rose-600 bg-rose-50",
  setting: "text-gray-600 bg-gray-50",
};

export default function AdminAuditLogPage() {
  const t = useTranslations('admin');
  const [page, setPage] = useState(1);
  const [entityFilter, setEntityFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit-log", page, entityFilter, actionFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (entityFilter) params.set("entity", entityFilter);
      if (actionFilter) params.set("action", actionFilter);
      const r = await fetch(`/api/admin/audit-log?${params}`);
      return r.json() as Promise<{ logs: AuditLogEntry[]; pagination: Pagination }>;
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('auditLog.title')}</h1>

      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex gap-4 items-center">
          <select
            value={entityFilter}
            onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer"
          >
            <option value="">{t('auditLog.allEntities')}</option>
            <option value="booking">Booking</option>
            <option value="user">User</option>
            <option value="post">Post</option>
            <option value="review">Review</option>
            <option value="addon">Add-on</option>
            <option value="promocode">PromoCode</option>
            <option value="setting">Setting</option>
          </select>
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer"
          >
            <option value="">{t('auditLog.allActions')}</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </select>
          {data?.pagination && (
            <span className="text-sm text-gray-500 ml-auto">
              {data.pagination.total} {t('auditLog.entries')}
            </span>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
          <div className="p-8 space-y-4">
            {[...Array(8)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded" />)}
          </div>
        </div>
      ) : data?.logs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <p className="text-gray-500">{t('auditLog.empty')}</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">{t('auditLog.action')}</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">{t('auditLog.entity')}</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">{t('auditLog.entityId')}</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">{t('auditLog.user')}</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">{t('auditLog.date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{log.id}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        log.action === "CREATE" ? "bg-green-100 text-green-700" :
                        log.action === "UPDATE" ? "bg-blue-100 text-blue-700" :
                        log.action === "DELETE" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${ENitY_COLORS[log.entity] || "bg-gray-100 text-gray-700"}`}>
                        {log.entity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-mono">{log.entityId}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{log.user?.name || log.user?.email || "—"}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString("ru-RU")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data?.pagination && data.pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: data.pagination.pages }, (_, i) => i + 1)
                .filter(p => Math.abs(p - page) <= 2 || p === 1 || p === data.pagination.pages)
                .map((p, idx, arr) => (
                  <>
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span key={`e-${p}`} className="px-2 py-1 text-gray-400">...</span>}
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                        page === p ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {p}
                    </button>
                  </>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
