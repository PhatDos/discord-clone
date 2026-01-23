"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:shadow-md transition-all border-0"
        >
          <Sun className="!h-[1.5rem] !w-[1.5rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute !h-[1.5rem] !w-[1.5rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        sideOffset={8} //gap between button & menu
        className="border border-zinc-800 dark:border-zinc-200 rounded-md px-0 py-1 min-w-fit"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:shadow-md transition-all"
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:shadow-md transition-all"
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:shadow-md transition-all"
        >
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
