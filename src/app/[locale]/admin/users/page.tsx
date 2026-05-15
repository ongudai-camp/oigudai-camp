"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

interface User {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
  _count: { bookings: number };
}

export default function AdminUsersPage() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [role, setRole] = useState("all");

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users", role],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (role !== "all") params.set("role", role);
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      return (Array.isArray(data) ? data : data.users) as User[];
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: number; role: string }) => {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const getRoleBadge = (r: string) => {
    const styles: Record<string, string> = {
      admin: "bg-purple-100 text-purple-800",
      subscriber: "bg-gray-100 text-gray-800",
    };
    return <span className={`px-3 py-1 text-xs rounded-full ${styles[r] || "bg-gray-100 text-gray-800"}`}>{r}</span>;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('admin.users.title')}</h1>

      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex gap-2">
          {["all", "admin", "subscriber"].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 ${
                role === r ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {r === "all" ? t('admin.users.filters.all') : t(`admin.users.filters.${r}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="animate-pulse p-8 space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded" />)}</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">{t('admin.users.columns.name')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">{t('admin.users.columns.email')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">{t('admin.users.columns.role')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">{t('admin.users.columns.bookings')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">{t('admin.users.columns.registered')}</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">{t('admin.users.columns.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users?.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4"><div className="font-medium text-gray-900">{user.name || t('admin.users.noName')}</div></td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                  <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user._count?.bookings ?? 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{new Date(user.createdAt).toLocaleDateString("ru-RU")}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <select
                      value={user.role}
                      onChange={(e) => updateRoleMutation.mutate({ id: user.id, role: e.target.value })}
                      className="text-xs border border-gray-200 rounded px-2 py-1 cursor-pointer text-indigo-700 mr-2"
                    >
                      <option value="subscriber">subscriber</option>
                      <option value="admin">admin</option>
                    </select>
                    <button
                      onClick={() => { if (confirm("Удалить пользователя?")) deleteMutation.mutate(user.id); }}
                      className="text-red-500 hover:text-red-700 cursor-pointer text-xs"
                    >{t('admin.users.delete') || "✕"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
        {users?.length === 0 && <div className="text-center py-8 text-gray-900">{t('admin.users.notFound')}</div>}
      </div>
    </div>
  );
}