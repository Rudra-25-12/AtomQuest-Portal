"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TubesBackgroundProps {
  children?: React.ReactNode;
}

export default function TubesBackground({ children }: TubesBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement("script");
    script.type = "module";
    script.textContent = `
      import { Tubes } from "https://cdn.jsdelivr.net/npm/threejs-toys@0.0.8/build/threejs-toys.module.cdn.min.js";

      const container = document.getElementById("tubes-bg");
      if (container) {
        Tubes({
          el: container,
          background: 0x000000,
          color: 0x4080ff,
        });
        window.dispatchEvent(new CustomEvent("tubes-loaded"));
      }
    `;

    const handleLoaded = () => setIsLoading(false);
    window.addEventListener("tubes-loaded", handleLoaded);
    document.body.appendChild(script);

    // Fallback: hide loader after 3 seconds even if event doesn't fire
    const timeout = setTimeout(() => setIsLoading(false), 3000);

    return () => {
      window.removeEventListener("tubes-loaded", handleLoaded);
      clearTimeout(timeout);
      script.remove();
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div
        id="tubes-bg"
        ref={containerRef}
        className="absolute inset-0 z-0"
      />

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-black"
          >
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-20">{children}</div>
    </div>
  );
}