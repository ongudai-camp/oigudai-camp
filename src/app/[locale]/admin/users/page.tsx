"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Phone, 
  PhoneCall, 
  Mail, 
  Edit2, 
  Trash2, 
  UserPlus, 
  Search,
  FileText,
  X,
  Check,
  MoreVertical
} from "lucide-react";
import clsx from "clsx";

interface User {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  phoneVerified: boolean;
  identityVerified: boolean;
  citizenship: string | null;
  createdAt: string;
  _count: { 
    bookings: number;
    identityDocuments: number;
    contracts: number;
  };
}

export default function AdminUsersPage() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditUser] = useState<User | null>(null);
  const [viewingDocsUser, setViewingDocsUser] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users", roleFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (searchQuery) params.set("q", searchQuery);
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      return await res.json() as User[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update user");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditUser(null);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create user");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setIsCreateModalOpen(false);
    },
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
      admin: "bg-purple-100 text-purple-700 border-purple-200",
      superadmin: "bg-red-100 text-red-700 border-red-200",
      subscriber: "bg-blue-50 text-blue-700 border-blue-100",
    };
    return (
      <span className={clsx(
        "px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border",
        styles[r] || "bg-gray-100 text-gray-700 border-gray-200"
      )}>
        {r}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.users.title')}</h1>
          <p className="text-sm text-gray-500">Управление пользователями и правами доступа</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 cursor-pointer active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Добавить пользователя</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по имени, email или телефону..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 md:col-span-2">
          {["all", "admin", "subscriber"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={clsx(
                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-tight transition-all cursor-pointer whitespace-nowrap",
                roleFilter === r 
                  ? "bg-gray-900 text-white shadow-md shadow-gray-200" 
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              )}
            >
              {r === "all" ? t('admin.users.filters.all') : t(`admin.users.filters.${r}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-12 h-12 bg-gray-100 rounded-full" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-100 rounded w-1/4" />
                  <div className="h-3 bg-gray-50 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('admin.users.columns.name')}</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Контакты</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('admin.users.columns.role')}</th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Статус</th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Документы</th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('admin.users.columns.bookings')}</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('admin.users.columns.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users?.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50/30 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          {user.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 leading-none mb-1">
                            {user.name || t('admin.users.noName')}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            ID: {user.id} тАв с {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span>{user.email || "тАФ"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span className={clsx(user.phoneVerified ? "text-green-600 font-medium" : "text-gray-600")}>
                            {user.phone || "тАФ"}
                          </span>
                          {user.phoneVerified && <Check className="w-3 h-3 text-green-500" />}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <div title={user.identityVerified ? "Личность подтверждена" : "Личность не подтверждена"}>
                          {user.identityVerified ? (
                            <ShieldCheck className="w-5 h-5 text-green-500" />
                          ) : (
                            <ShieldAlert className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div title={user.phoneVerified ? "Телефон подтвержден" : "Телефон не подтвержден"}>
                          {user.phoneVerified ? (
                            <PhoneCall className="w-5 h-5 text-green-500" />
                          ) : (
                            <Phone className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all text-xs font-semibold border border-gray-100 cursor-pointer"
                        onClick={() => setViewingDocsUser(user)}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{user._count?.identityDocuments || 0}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-bold text-gray-900">{user._count?.bookings ?? 0}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditUser(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                          title="Редактировать"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { if (confirm("Удалить пользователя?")) deleteMutation.mutate(user.id); }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && users?.length === 0 && (
          <div className="text-center py-16 bg-gray-50/50">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">{t('admin.users.notFound')}</p>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <UserModal 
          user={editingUser} 
          onClose={() => setEditUser(null)} 
          onSave={(data) => updateMutation.mutate({ id: editingUser.id, ...data })}
          isLoading={updateMutation.isPending}
        />
      )}

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <UserModal 
          onClose={() => setIsCreateModalOpen(false)} 
          onSave={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
          isNew
        />
      )}

      {/* User Documents Modal */}
      {viewingDocsUser && (
        <UserDocumentsModal 
          user={viewingDocsUser} 
          onClose={() => setViewingDocsUser(null)} 
        />
      )}
    </div>
  );
}

function UserDocumentsModal({ user, onClose }: { user: User; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-user-docs", user.id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users/${user.id}/documents`);
      if (!res.ok) throw new Error("Failed to fetch documents");
      return res.json();
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ docId, status, statusNote }: { docId: number; status: string; statusNote?: string }) => {
      const res = await fetch(`/api/admin/users/${user.id}/documents`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docId, status, statusNote }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-docs", user.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Документы пользователя</h3>
              <p className="text-sm text-gray-500">{user.name} тАв ID: {user.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all cursor-pointer">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-20 flex justify-center">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Identity Documents */}
              <section className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  Подтверждение личности
                </h4>
                
                {data?.documents?.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                    <p className="text-sm text-gray-400">Документы не загружены</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data?.documents?.map((doc: any) => (
                      <div key={doc.id} className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={clsx(
                              "p-2.5 rounded-xl",
                              doc.status === 'verified' ? 'bg-green-50 text-green-600' :
                              doc.status === 'rejected' ? 'bg-red-50 text-red-600' :
                              'bg-yellow-50 text-yellow-600'
                            )}>
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 leading-tight capitalize">{doc.docType}</p>
                              <p className="text-[10px] text-gray-400">{new Date(doc.uploadedAt).toLocaleString("ru-RU")}</p>
                            </div>
                          </div>
                          <span className={clsx(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight",
                            doc.status === 'verified' ? 'bg-green-100 text-green-700' :
                            doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          )}>
                            {doc.status}
                          </span>
                        </div>

                        {doc.fileUrl && (
                          <div className="aspect-video relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                            {doc.fileType?.startsWith('image/') ? (
                              <img src={doc.fileUrl} alt="Doc" className="w-full h-full object-contain" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                <FileText className="w-10 h-10 text-gray-300" />
                                <span className="text-xs text-gray-500 font-medium">PDF Document</span>
                              </div>
                            )}
                            <a 
                              href={doc.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100"
                            >
                              <div className="px-4 py-2 bg-white text-gray-900 text-xs font-bold rounded-lg shadow-xl">Открыть оригинал</div>
                            </a>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => verifyMutation.mutate({ docId: doc.id, status: "verified" })}
                            disabled={doc.status === "verified" || verifyMutation.isPending}
                            className="flex-1 py-2 bg-green-500 text-white text-xs font-bold rounded-xl hover:bg-green-600 disabled:opacity-50 transition-all shadow-lg shadow-green-100 cursor-pointer"
                          >
                            Подтвердить
                          </button>
                          <button
                            onClick={() => {
                              const note = prompt("Причина отклонения:");
                              if (note) verifyMutation.mutate({ docId: doc.id, status: "rejected", statusNote: note });
                            }}
                            disabled={doc.status === "rejected" || verifyMutation.isPending}
                            className="flex-1 py-2 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 disabled:opacity-50 transition-all shadow-lg shadow-red-100 cursor-pointer"
                          >
                            Отклонить
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Signed Contracts */}
              <section className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-500" />
                  Подписанные договора
                </h4>
                
                {data?.contracts?.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                    <p className="text-sm text-gray-400">Нет подписанных договоров</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data?.contracts?.map((contract: any) => (
                      <div key={contract.id} className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-100 rounded-2xl hover:border-purple-200 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">Договор бронирования #{contract.bookingId}</p>
                            <p className="text-[10px] text-gray-400">
                              {contract.booking.post?.title} тАв {new Date(contract.signedAt).toLocaleString("ru-RU")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-gray-900">{contract.booking.totalPrice} тВ╜</p>
                            <p className="text-[10px] text-gray-500">{contract.booking.status}</p>
                          </div>
                          <button 
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all cursor-pointer"
                            onClick={() => {/* TODO: Preview contract content */}}
                          >
                            <Search className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface UserModalProps {
  user?: User;
  onClose: () => void;
  onSave: (data: any) => void;
  isLoading: boolean;
  isNew?: boolean;
}

function UserModal({ user, onClose, onSave, isLoading, isNew }: UserModalProps) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    role: user?.role || "subscriber",
    phoneVerified: user?.phoneVerified || false,
    identityVerified: user?.identityVerified || false,
    citizenship: user?.citizenship || "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {isNew ? "Добавить пользователя" : "Редактировать данные"}
            </h3>
            {!isNew && <p className="text-xs text-gray-500">ID: {user?.id}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all cursor-pointer">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Имя</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Роль</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              >
                <option value="subscriber">Subscriber</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Телефон</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="+7..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Гражданство</label>
              <input
                type="text"
                value={formData.citizenship}
                onChange={(e) => setFormData({ ...formData, citizenship: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {!isNew && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.phoneVerified}
                  onChange={(e) => setFormData({ ...formData, phoneVerified: e.target.checked })}
                  className="w-5 h-5 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">Телефон подтвержден</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.identityVerified}
                  onChange={(e) => setFormData({ ...formData, identityVerified: e.target.checked })}
                  className="w-5 h-5 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">Личность подтверждена</span>
              </label>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">
              {isNew ? "Пароль" : "Новый пароль (оставьте пустым, чтобы не менять)"}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-100 cursor-pointer active:scale-95"
            >
              {isLoading ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}