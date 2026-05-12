import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const ADMIN_ROLES = ["admin", "superadmin"];

export async function requireAdmin(locale?: string) {
  const session = await auth();
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role)) {
    if (locale) redirect(`/${locale}/dashboard`);
    else redirect("/dashboard");
  }
  return session;
}

export function isAdmin(role: string) {
  return ADMIN_ROLES.includes(role);
}

export function isSuperAdmin(role: string) {
  return role === "superadmin";
}

export { ADMIN_ROLES };
