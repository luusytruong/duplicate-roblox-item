"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

function Video() {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-100"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        exit={{ y: 20 }}
        className="w-full max-w-4xl"
      >
        <iframe
          src="https://www.youtube.com/embed/xB2_gJdwOQw?autoplay=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="max-w-4xl aspect-video w-full object-cover relative z-0 border-none"
        />
      </motion.div>
    </motion.div>
  );
}

export default Video;
