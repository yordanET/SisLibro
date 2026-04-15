import type { Metadata } from "next";
import { Cormorant_Garamond, Questrial } from "next/font/google";
import "./globals.css";

const displayFont = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bodyFont = Questrial({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "SisLibro | Biblioteca Universitaria",
  description: "Plataforma universitaria para visualización y gestión de libros",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>
  );
}
