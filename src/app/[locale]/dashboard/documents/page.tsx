"use client";

import { useTranslations } from "next-intl";
import IdentityVerification from "@/components/dashboard/IdentityVerification";
import { FileText, Download, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";

export default function DocumentsPage() {
  const t = useTranslations("dashboard");

  const { data, isLoading } = useQuery({
    queryKey: ["user-documents-and-contracts"],
    queryFn: async () => {
      // Reusing a private API or creating a new one. 
      // For now let's assume we can fetch identity and contracts together.
      const res = await fetch("/api/user/identity");
      const identityData = await res.json();
      
      const contractsRes = await fetch("/api/user/contracts"); // We might need this API
      const contractsData = await contractsRes.json();
      
      return {
        documents: identityData.documents || [],
        contracts: contractsData.contracts || []
      };
    }
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t("documents") || "Мои документы"}</h1>
        </div>
        <p className="text-gray-500">Управление документами, удостоверяющими личность, и подписанными договорами.</p>
      </div>

      {/* Identity Verification Component */}
      <IdentityVerification />

      {/* Contracts Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-500" />
          Подписанные договора
        </h2>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : data?.contracts?.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400 font-medium">У вас пока нет подписанных договоров</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data?.contracts?.map((contract: any) => (
              <div key={contract.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:border-purple-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Договор бронирования #{contract.bookingId}</p>
                    <p className="text-xs text-gray-500">
                      Подписан {new Date(contract.signedAt).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                </div>
                <button 
                  className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-all cursor-pointer"
                  onClick={() => {/* Download contract */}}
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
