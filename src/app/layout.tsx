import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Goldtype - Tecla Certa | A Energia na Ponta dos Teus Dedos",
  description: "Plataforma de treino de dactilografia para a equipa Goldenergy em Vila Real, Portugal. Transforma cada clique numa vitória!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" data-theme="goldenergy">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col antialiased`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
