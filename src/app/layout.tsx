import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Assistcone | AI Support Agent SaaS',
  description: 'Build and Deploy Your AI Support Agent',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} antialiased bg-gray-50 text-slate-900`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
