"use client";

import { ClerkProvider, SignIn, SignedIn, SignedOut } from '@clerk/nextjs';
import './globals.css';
import Navbar from '@/components/NavBar';
import { Separator } from '@/components/ui/separator';
import { ThemeProvider } from '../providers/ThemeProvider';
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google'; 
import { Toast } from '@/components/ui/toast';
import { Toaster } from '@/components/ui/toaster';
import 'leaflet/dist/leaflet.css';


const inter = Inter({ subsets: ['latin'] }); 

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={cn(inter.className, "dark")}
      style={{colorScheme: "dark"}} suppressHydrationWarning>
        <body>
          <ThemeProvider>
            <div className="flex min-h-screen w-full flex-col dark:bg-black justify-center items-center">
              <SignedIn>
                <Navbar />
                <Separator />
                <main className="flex flex-grow w-full justify-center items-center dark:bg-neutral-950">
                  {children}
                  <Toaster/>
                </main>
              </SignedIn>
              <SignedOut>
                <SignIn routing="hash" />
              </SignedOut>
            </div>
            </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
