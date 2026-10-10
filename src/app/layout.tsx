import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const sans = Inter({ variable: "--font-sans", subsets: ["latin"] });
const display = Fraunces({ variable: "--font-display", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Anabia Brownies",
  description: "Controle de produção, vendas e entregas de brownies",
  appleWebApp: { capable: true, title: "Anabia", statusBarStyle: "default" },
  icons: { apple: "/pwa-icon/192" },
};

export const viewport: Viewport = {
  themeColor: "#5b3a29",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
