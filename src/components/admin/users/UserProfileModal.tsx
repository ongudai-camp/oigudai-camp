"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { 
  X, 
  Mail, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  ShieldAlert, 
  MapPin, 
  User as UserIcon,
  CreditCard,
  FileText,
  Clock,
  ChevronRight,
  ExternalLink,
  MessageCircle
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import clsx from "clsx";
import ChatInterface from "@/components/chat/ChatInterface";

interface UserProfileModalProps {
  userId: number;
  onClose: () => void;
}

export default function UserProfileModal({ userId, onClose }: UserProfileModalProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"info" | "chat">("info");
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["admin-user-profile", userId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch user profile");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl h-[80vh] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-lg bg-white rounded-3xl p-8 text-center">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Ошибка загрузки</h3>
          <p className="text-gray-500 mb-6">Не удалось загрузить профиль пользователя.</p>
          <button onClick={onClose} className="px-6 py-2 bg-gray-100 rounded-xl font-bold">Закрыть</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-gray-50 rounded-[2.5rem] shadow-2xl h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-200">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{user.name || "Без имени"}</h2>
                <span className={clsx(
                  "px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border",
                  user.role === 'admin' || user.role === 'superadmin' ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-blue-600 border-blue-100"
                )}>
                  {user.role}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> ID: {user.id}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> С {format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: ru })}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 p-1 rounded-2xl flex gap-1 mr-4">
              <button 
                onClick={() => setActiveTab("info")}
                className={clsx(
                  "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  activeTab === "info" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                )}
              >
                Инфо
              </button>
              <button 
                onClick={() => setActiveTab("chat")}
                className={clsx(
                  "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  activeTab === "chat" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <MessageCircle size={14} />
                Чат
              </button>
            </div>
            <button onClick={onClose} className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 rounded-2xl transition-all cursor-pointer">
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {activeTab === "chat" ? (
            <div className="flex-1 bg-white">
              <ChatInterface 
                userId={session?.user?.id ? parseInt(session.user.id) : 0} 
                isAdmin={true} 
                targetUserId={user.id} 
              />
            </div>
          ) : (
            <>
              {/* Sidebar Info */}
              <div className="w-full md:w-80 bg-white border-r border-gray-100 p-8 space-y-8 shrink-0 overflow-y-auto">
                <section className="space-y-4">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Контакты</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{user.email || "тАФ"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className={clsx(
                        "w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm",
                        user.phoneVerified ? "text-green-500" : "text-gray-400"
                      )}>
                        <Phone className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Телефон</p>
                        <p className={clsx("text-sm font-bold truncate", user.phoneVerified ? "text-gray-900" : "text-gray-400")}>
                          {user.phone || "тАФ"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-orange-500 shadow-sm">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Гражданство</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{user.citizenship || "Не указано"}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Верификация</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className={clsx(
                      "p-4 rounded-2xl border text-center space-y-2 transition-all",
                      user.identityVerified ? "bg-green-50 border-green-100 text-green-700" : "bg-gray-50 border-gray-100 text-gray-400"
                    )}>
                      {user.identityVerified ? <ShieldCheck className="w-6 h-6 mx-auto" /> : <ShieldAlert className="w-6 h-6 mx-auto" />}
                      <p className="text-[10px] font-black uppercase tracking-tighter leading-none">Личность</p>
                    </div>
                    <div className={clsx(
                      "p-4 rounded-2xl border text-center space-y-2 transition-all",
                      user.phoneVerified ? "bg-green-50 border-green-100 text-green-700" : "bg-gray-50 border-gray-100 text-gray-400"
                    )}>
                      <Phone className="w-6 h-6 mx-auto" />
                      <p className="text-[10px] font-black uppercase tracking-tighter leading-none">Телефон</p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-gray-500">Бронирований</span>
                    <span className="font-black text-gray-900">{user._count?.bookings || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-gray-500">Отзывов</span>
                    <span className="font-black text-gray-900">{user._count?.reviews || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-gray-500">Документов</span>
                    <span className="font-black text-gray-900">{user._count?.identityDocuments || 0}</span>
                  </div>
                </section>
              </div>

              {/* Main Content (History) */}
              <div className="flex-1 p-8 overflow-y-auto space-y-10 custom-scrollbar">
                {/* Bookings */}
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-blue-500" />
                      История бронирований
                    </h3>
                  </div>

                  {user.bookings?.length === 0 ? (
                    <div className="p-12 bg-white rounded-[2rem] border border-dashed border-gray-200 text-center">
                      <Clock className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400 font-bold">Бронирований пока нет</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {user.bookings.map((booking: any) => (
                        <div key={booking.id} className="group bg-white p-5 rounded-[2rem] border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-blue-600 font-black shadow-inner">
                                BK
                              </div>
                              <div>
                                <p className="font-black text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{booking.post?.title}</p>
                                <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                                  <span>ID: {booking.bookingId}</span>
                                  <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                  <span>{format(new Date(booking.checkIn), 'dd.MM.yyyy')}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-6">
                              <div className="text-right">
                                <p className="text-lg font-black text-gray-900">{booking.totalPrice} ₽</p>
                                <span className={clsx(
                                  "text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full",
                                  booking.status === 'confirmed' ? "bg-green-100 text-green-700" :
                                  booking.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                                  "bg-gray-100 text-gray-500"
                                )}>
                                  {booking.status}
                                </span>
                              </div>
                              <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <ChevronRight size={20} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Documents & Contracts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <section className="space-y-6">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                      <FileText className="w-6 h-6 text-purple-500" />
                      Договоры
                    </h3>
                    {user.contracts?.length === 0 ? (
                      <p className="text-gray-400 text-sm font-bold bg-white p-6 rounded-2xl border border-dashed border-gray-200 text-center">Нет подписанных договоров</p>
                    ) : (
                      <div className="space-y-3">
                        {user.contracts.map((c: any) => (
                          <div key={c.id} className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between group hover:border-purple-200 transition-all">
                             <div className="min-w-0">
                               <p className="font-bold text-gray-900 text-sm truncate">#{c.bookingId}</p>
                               <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{format(new Date(c.signedAt), 'dd.MM.yyyy')}</p>
                             </div>
                             <button className="p-2 text-purple-500 hover:bg-purple-50 rounded-xl transition-all">
                               <ExternalLink size={16} />
                             </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  <section className="space-y-6">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                      <ShieldCheck className="w-6 h-6 text-green-500" />
                      Документы
                    </h3>
                    {user.identityDocuments?.length === 0 ? (
                      <p className="text-gray-400 text-sm font-bold bg-white p-6 rounded-2xl border border-dashed border-gray-200 text-center">Документы не загружены</p>
                    ) : (
                      <div className="space-y-3">
                        {user.identityDocuments.map((d: any) => (
                          <div key={d.id} className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between group hover:border-green-200 transition-all">
                             <div className="min-w-0">
                               <p className="font-bold text-gray-900 text-sm truncate uppercase">{d.docType}</p>
                               <p className={clsx(
                                 "text-[10px] font-black uppercase tracking-widest",
                                 d.status === 'verified' ? "text-green-500" : "text-orange-500"
                               )}>{d.status}</p>
                             </div>
                             <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
                               <ExternalLink size={16} />
                             </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
