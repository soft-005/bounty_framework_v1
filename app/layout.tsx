import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KSA Bug Bounty Framework",
  description: "Reconnaissance and vulnerability tracking system for bug bounty hunters",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
