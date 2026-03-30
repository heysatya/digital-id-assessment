// File: src/app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "Digital ID Assessment",
  description: "Maturity Assessment Tool for Digital ID Systems",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}