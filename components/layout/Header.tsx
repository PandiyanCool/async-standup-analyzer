"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">Async Standup</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
