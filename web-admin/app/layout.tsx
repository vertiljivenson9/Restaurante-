/**
 * Root Layout
 * Layout principal de la aplicación Next.js
 * Define metadatos, fuentes y estructura base
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Configuración de la fuente Inter
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

// Metadatos de la aplicación
export const metadata: Metadata = {
  title: 'Admin - Menú Digital',
  description: 'Panel de administración para gestionar menús digitales',
  keywords: ['menú digital', 'restaurante', 'admin', 'dashboard'],
};

/**
 * RootLayout
 * Envuelve todas las páginas de la aplicación
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
