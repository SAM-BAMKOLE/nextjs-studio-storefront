import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/use-auth';
import { CartProvider } from '@/hooks/use-cart';
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'Storefront Manager',
  description: 'Manage your e-commerce store with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased min-h-screen flex flex-col", "font-body")}>
        <AuthProvider>
          <CartProvider>
            <SiteHeader />
            <main className="flex-1 container py-8 px-5">
              {children}
            </main>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
