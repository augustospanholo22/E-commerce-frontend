import type { Metadata } from "next";

export const metadata: Metadata = { title: "Painel do vendedor" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
