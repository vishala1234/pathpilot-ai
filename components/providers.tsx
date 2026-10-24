"use client";

import { ThemeProvider } from "next-themes";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreHydration } from "@/components/providers/store-hydration";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <StoreHydration />
      <TooltipProvider>
        {children}
        <Toaster position="top-center" closeButton />
      </TooltipProvider>
    </ThemeProvider>
  );
}
