import { type NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/auth/signin",
    newUser: "/auth/register",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");

      if (isDashboardRoute && !isLoggedIn) {
        return false;
      }

      if (isAdminRoute && (!isLoggedIn || (auth?.user as any)?.role !== "admin")) {
        return false;
      }

      return true;
    },
  },
  providers: [], // Add providers in the main auth route
};
