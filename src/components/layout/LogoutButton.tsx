"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="text-red-500 hover:text-red-700 font-medium cursor-pointer transition-all duration-300"
    >
      Выйти
    </button>
  );
}
