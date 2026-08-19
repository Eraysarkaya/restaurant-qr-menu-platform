"use client";

import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      {children}
      <Toaster
        richColors
        position="top-center"
        offset={{ top: 76 }}
        mobileOffset={{ top: 72 }}
        toastOptions={{
          duration: 3600,
          classNames: {
            toast: "shadow-xl",
            actionButton: "!bg-white !text-emerald-800 !font-bold",
          },
        }}
      />
    </TooltipProvider>
  );
}
