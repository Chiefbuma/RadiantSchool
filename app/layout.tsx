import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#c85828",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Radiant Hospital Training Institute | Educating Hearts and Minds for Health",
    template: "%s | Radiant Hospital Training Institute"
  },
  description: "Premier healthcare training institution in Kasarani offering CNA, Dental Assistant, and Health Records & IT certificate programs with guaranteed hospital attachments.",
  keywords: ["Medical Training Kenya", "CNA Course Nairobi", "Health Records IT training", "Dental Assisting certificate", "Radiant Hospital Training", "Medical Institute Kasarani", "Healthcare Training Nairobi"],
  authors: [{ name: "Radiant Hospital Training Institute" }],
  creator: "Radiant Group of Hospitals",
  publisher: "Radiant Group of Hospitals",
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "https://radianttraining.co.ke",
    siteName: "Radiant Hospital Training Institute",
    title: "Radiant Hospital Training Institute | Educating Hearts and Minds for Health",
    description: "Launch your healthcare career with accredited certificate programs, modern facilities, flexible fee payment, and guaranteed hospital attachments.",
    images: [
      {
        url: "https://radianttraining.co.ke/images/web/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Radiant Hospital Training Institute",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Radiant Hospital Training Institute",
    description: "CNA, Dental Assistant, and Health Records & IT certificate training with guaranteed hospital attachments.",
    images: ["https://radianttraining.co.ke/images/web/og-image.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
