"use client";

import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm py-4 px-6 text-center mt-auto">
      <div className="flex items-center justify-center gap-2">
        <Sparkles size={14} className="text-primary/60" />
        <p className="text-sm text-muted-foreground">
          Developed By{" "}
          <span className="font-semibold text-foreground">
            Arefin Siddiqui
          </span>
        </p>
        <Sparkles size={14} className="text-primary/60" />
      </div>
    </footer>
  );
}
