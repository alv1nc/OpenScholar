"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NavigationProvider>
      <AuthProvider>{children}</AuthProvider>
    </NavigationProvider>
  );
}
