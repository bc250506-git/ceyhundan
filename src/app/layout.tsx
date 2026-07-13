import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import "swiper/css";
import "swiper/css/autoplay";
import FloatingContact from "@/components/FloatingContact";
import BackToTop from "@/components/BackToTop";
import StickyPanel from "@/components/StickyPanel";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Ceyhun Gayrimenkul  | Tokat'ta Emlak ve Gayrimenkul",
  description: "Tokat'ın güvenilir emlak ofisi. Satılık-kiralık ev, daire, arsa ve iş yeri ilanları.",
  keywords: "emlak, gayrimenkul, Tokat emlak, konut, iş yeri, arsa, otomotiv, satılık, kiralık, daire, villa, arazi",
  metadataBase: new URL("https://www.ceyhundan.com"),
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://www.ceyhundan.com",
    title: "Ceyhun Gayrimenkul Emlak | Tokat'ta Emlak ve Gayrimenkul",
    description: "Tokat'ın güvenilir emlak ofisi. Satılık-kiralık ev, daire, arsa ve iş yeri ilanları.",
    siteName: "Ceyhun Gayrimenkul Emlak",
    images: [
      {
        url: "/images/logo_black.png",
        width: 1200,
        height: 630,
        alt: "Ceyhun Gayrimenkul Emlak Logo",
      },
    ],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${poppins.variable} ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased mobile-scroll-fix">
        {children}
        <StickyPanel />
        <FloatingContact defaultPhone="5323850420" />
        <BackToTop />
        <Analytics />
        
        
        
        {/* Script to prevent text selection 
           Removed problematic script that was blocking touch events and scrolling
        */}
        
        {/* Schema.org structured data for Real Estate Agent */}
        <Script id="schema-real-estate-agent" type="application/ld+json">
          {`
{
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "Ceyhun Gayrimenkul",
  "url": "https://www.ceyhundan.com",
  "logo": "https://www.ceyhundan.com/images/logo_black.png",
  "image": "https://www.ceyhundan.com/images/ce.png",
  "description": "Tokat'ın güvenilir emlak ofisi. Satılık-kiralık ev, daire, arsa ve iş yeri ilanları.",
  "telephone": "+9005323850420",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Tokat",
    "addressRegion": "Tokat",
    "addressCountry": "TR"
  },
  "openingHours": "Mo,Tu,We,Th,Fr 09:00-18:00",
  "priceRange": "$$",
  "sameAs": [
    "https://www.facebook.com/CeyhunGayrimenkulEmlak",
    "https://www.instagram.com/ceyhungayrimenkul"
  ]
}
          `}
        </Script>
        
        {/* Script to fix mobile viewport height */}
        <Script id="fix-viewport-height" strategy="afterInteractive">
          {`
            // Fix for mobile 100vh issue
            function setVH() {
              let vh = window.innerHeight * 0.01;
              document.documentElement.style.setProperty('--vh', \`\${vh}px\`);
            }
            
            // Set the value on page load
            setVH();
            
            // Update the value on resize and orientation change
            window.addEventListener('resize', setVH);
            window.addEventListener('orientationchange', setVH);
          `}
        </Script>

        
      </body>
    </html>
  );
}
