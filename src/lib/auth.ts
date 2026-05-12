import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      phone?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    phone?: string | null;
  }
}



const formatPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return "+" + digits;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/auth/signin",
    newUser: "/auth/register",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        phone: { label: "Phone", type: "text" },
      },
      async authorize(credentials) {
        // Phone-based auth (SMS verified — one-time sign-in token)
        if (credentials?.phone) {
          const formattedPhone = formatPhone(credentials.phone as string);

          const smsRecord = await prisma.smsCode.findUnique({
            where: { phone: formattedPhone },
          });

          if (!smsRecord || smsRecord.code !== credentials.password) return null;

          if (smsRecord.createdAt < new Date(Date.now() - 5 * 60 * 1000)) {
            return null;
          }

          await prisma.smsCode.delete({
            where: { phone: formattedPhone },
          });

          const user = await prisma.user.findFirst({
            where: { phone: formattedPhone },
          });

          if (!user) return null;

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone,
          };
        }

        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as Record<string, unknown>).id = user.id;
        (token as Record<string, unknown>).role = user.role;
        (token as Record<string, unknown>).phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token as Record<string, string>).id;
        session.user.role = (token as Record<string, string>).role;
        session.user.phone = (token as Record<string, string | null>).phone;
      }
      return session;
    },
  },
});
