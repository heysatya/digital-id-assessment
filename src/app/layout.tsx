// File: src/app/layout.tsx
import { Inter } from 'next/font/google';
import "./globals.css";

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: "Barbados | Digital ID Governance Assessment",
  description: "Comprehensive maturity assessment framework for the diagnostic evaluation of digital ID systems based on UNDP and DPI Safeguards principles.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}