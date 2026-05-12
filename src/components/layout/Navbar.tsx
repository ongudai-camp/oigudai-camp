import { auth } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";
import LocaleSwitcher from "./LocaleSwitcher";
import { getLocale } from "next-intl/server";
import { cookies } from "next/headers";
import ClientNav from "./ClientNav";
import RealcreaNav from "./variations/RealcreaNav";
import FloatingNav from "./variations/FloatingNav";
import SidebarNav from "./variations/SidebarNav";

export default async function Navbar() {
  const session = await auth();
  const locale = await getLocale();
  const cookieStore = await cookies();
  const variation = cookieStore.get("nav-variation")?.value || "realcrea";

  const commonProps = {
    locale,
    session,
    logoutButton: <LogoutButton />,
    localeSwitcher: <LocaleSwitcher />,
  };

  switch (variation) {
    case "mega":
      return <ClientNav {...commonProps} />;
    case "floating":
      return <FloatingNav {...commonProps} />;
    case "sidebar":
      return <SidebarNav {...commonProps} />;
    case "realcrea":
    default:
      return <RealcreaNav {...commonProps} />;
  }
}
