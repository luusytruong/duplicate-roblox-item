"use client";

import { Gamepad2, MessageSquare, Video } from "lucide-react";
import Link from "next/link";

type HeaderProps = {
  // props types here
};

const navs = [
  {
    href: "#faq",
    name: "FAQ",
    icon: MessageSquare,
  },
  {
    href: "#games",
    name: "Games",
    icon: Gamepad2,
  },
  // {
  //   href: "#tutorial",
  //   name: "Tutorial",
  //   icon: Video,
  // },
];

function Header({}: HeaderProps) {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-150 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-12">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              onClick={scrollToTop}
              className="text-2xl font-black tracking-tighter text-white font-deco"
            >
              RB<span className="text-blue-500 font-black">X</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-10">
            {navs.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-all flex items-center gap-2.5 group"
              >
                <item.icon className="w-4 h-4 text-blue-500/50 group-hover:text-blue-500 transition-colors" />
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}

export default Header;
