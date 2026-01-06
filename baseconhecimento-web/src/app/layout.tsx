import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Base de Conhecimento",
  description: "Sistema de base de conhecimento",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  );
}
