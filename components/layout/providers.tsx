"use client";

import { AuthProvider } from "@/context/auth";
import { CartProvider } from "@/context/cart";
import { ToastProvider } from "@/context/toast";
import { SessionNotice } from "./session-notice";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <SessionNotice />
          {children}
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
