"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/auth";
import { useToast } from "@/context/toast";

/** Avisa quando a sessão expira (token JWT com validade de 1h). */
export function SessionNotice() {
  const { expiredNotice, clearExpiredNotice } = useAuth();
  const toast = useToast();
  useEffect(() => {
    if (expiredNotice) {
      toast("Sua sessão expirou. Entre novamente para continuar.", "error");
      clearExpiredNotice();
    }
  }, [expiredNotice, clearExpiredNotice, toast]);
  return null;
}
