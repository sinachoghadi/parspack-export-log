import type { Metadata } from "next";
import type { ReactNode } from "react";

import { TokenModal } from "@/components/auth/token-modal";
import { QueryProvider } from "@/providers/query-provider";
import { TokenSessionProvider } from "@/providers/token-session-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "CDN Access Log Explorer",
  description: "Explore and export Parspack CDN access logs.",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <TokenSessionProvider>
            {children}
            <TokenModal />
          </TokenSessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
