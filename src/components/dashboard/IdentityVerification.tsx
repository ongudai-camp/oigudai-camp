"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Shield, FileText, Trash2, Upload, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import clsx from "clsx";

interface IdentityDocument {
  id: number;
  docType: string;
  status: string;
  uploadedAt: string;
  fileUrl: string | null;
}

export default function IdentityVerification() {
  const t = useTranslations("dashboard.identity");
  const [documents, setDocuments] = useState<IdentityDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState("passport");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/user/identity");
      const data = await res.json();
      if (data.documents) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error("Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("document", file);
    formData.append("docType", docType);

    try {
      const res = await fetch("/api/user/identity", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(t("success"));
        fetchDocuments();
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("deleteConfirm"))) return;

    try {
      const res = await fetch(`/api/user/identity/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchDocuments();
      }
    } catch (err) {
      setError("Failed to delete document");
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 w-full bg-gray-100 rounded mb-8"></div>
        <div className="space-y-4">
          <div className="h-12 bg-gray-50 rounded-xl"></div>
          <div className="h-12 bg-gray-50 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mt-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>
          <p className="text-sm text-gray-500">{t("description")}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 text-sm animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 text-green-700 text-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">{t("docType")}</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 transition-all"
              >
                <option value="passport">{t("passport")}</option>
                <option value="id_card">{t("idCard")}</option>
                <option value="driver_license">{t("driverLicense")}</option>
              </select>
            </div>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full group relative flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-sky-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-sky-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-100 active:scale-[0.98] cursor-pointer"
            >
              {uploading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Upload className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                  {t("uploadBtn")}
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleUpload}
              className="hidden"
            />
            <p className="text-[11px] text-center text-gray-400">
              Max size: 10MB. Formats: JPG, PNG, PDF
            </p>
          </div>
        </div>

        {/* Documents List */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            {t("uploadedDocs")}
          </h3>
          
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
              <FileText className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400 font-medium">{t("noDocs")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-100 hover:shadow-md hover:shadow-blue-50/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={clsx(
                      "p-3 rounded-xl",
                      doc.status === 'verified' ? 'bg-green-50 text-green-600' :
                      doc.status === 'rejected' ? 'bg-red-50 text-red-600' :
                      'bg-yellow-50 text-yellow-600'
                    )}>
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-gray-900">
                          {t(doc.docType as any) || doc.docType}
                        </p>
                        <span className={clsx(
                          "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight",
                          doc.status === 'verified' ? 'bg-green-100 text-green-700' :
                          doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        )}>
                          {doc.status === 'verified' && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                          {doc.status === 'pending' && <Clock className="w-3 h-3 inline mr-1" />}
                          {doc.status === 'rejected' && <XCircle className="w-3 h-3 inline mr-1" />}
                          {t(doc.status as any)}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400">
                        {new Date(doc.uploadedAt).toLocaleDateString(undefined, { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {doc.fileUrl && (
                      <a 
                        href={doc.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Upload className="w-5 h-5 rotate-180" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
