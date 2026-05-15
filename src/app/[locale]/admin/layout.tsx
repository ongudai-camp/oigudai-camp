import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  return <AdminLayout params={params}>{children}</AdminLayout>;
}
