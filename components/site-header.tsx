"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { FiMusic } from "react-icons/fi";

import { siteConfig } from "@/config/site";
import { Button } from "./ui/button";
import { ModeSwitcher } from "./mode-switcher";
import { MainNav } from "./main-nav";
import { MobileNav } from "./mobile-nav";
import { CommandMenu } from "./command-menu";
import { Icons } from "./icons";

export function SiteHeader() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
    setPlaying(!playing);
  };

  return (
    <header className="border-grid sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-wrapper">
        <div className="container flex items-center gap-2 h-14 md:gap-4">
          <MainNav />

          {/* Mobile Nav receives toggleMusic & playing */}
          <MobileNav toggleMusic={toggleMusic} playing={playing} />

          {/* Desktop Nav */}
          <div className="items-center gap-2 ml-auto md:flex-1 md:justify-end hidden md:flex">
            <div className="flex-1 hidden w-full md:flex md:w-auto md:flex-none">
              <CommandMenu />
            </div>

            <nav className="flex items-center gap-2">
              {/* Music */}
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 px-0 transition hover:scale-110"
                onClick={toggleMusic}
                title={playing ? "Pause Music" : "Play Music"}
              >
                <FiMusic
                  className={`w-6 h-6 ${playing ? "text-pink-500" : "text-foreground/60"}`}
                />
              </Button>

              {/* Mode Switcher */}
              <ModeSwitcher className="w-6 h-6" />

              {/* GitHub */}
              <Link href={siteConfig.links.github} target="_blank" rel="noreferrer">
                <Icons.gitHub className="w-6 h-6" />
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Persistent Audio */}
      <audio ref={audioRef} src="/music/theme.mp3" loop preload="auto" />
    </header>
  );
}
