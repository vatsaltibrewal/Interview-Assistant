import type { Metadata } from "next";
import Providers from "./providers"; 
import SessionWatcher from '@/components/persistence/session-watcher';
import WelcomeBackGate from "@/components/persistence/welcome-back";
import "./globals.css";

export const metadata: Metadata = {
  title: "Swipe AI",
  description: "AI Interview Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-svh bg-background text-foreground antialiased">
        <Providers>
          <SessionWatcher />
          <WelcomeBackGate />
          {children}
        </Providers>
      </body>
    </html>
  );
}
