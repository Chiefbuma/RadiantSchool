import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Roboto_Condensed } from "next/font/google";
import "./globals.css";
import { FirebaseProvider } from "@/components/FirebaseProvider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "Radiant Hospital Training Institute",
  description: "Enhancing Paramount Care-Team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${robotoCondensed.variable} font-sans antialiased`}>
        <FirebaseProvider>
          {children}
          <Toaster position="top-right" />
        </FirebaseProvider>
      </body>
    </html>
  );
}
