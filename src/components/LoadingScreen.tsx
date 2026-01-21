import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const LoadingScreen = ({ onLoadingComplete, }: { onLoadingComplete: () => void; }) => {
  const [showLoader, setShowLoader] = useState(true);
  const [zoomStart, setZoomStart] = useState(false);

  useEffect(() => {
    if (!zoomStart) return;
    const zoomDuration = 1000; // ms
    const timer = setTimeout(() => {
      setShowLoader(false);
      onLoadingComplete();
    }, zoomDuration + 50);

    return () => clearTimeout(timer);
  }, [zoomStart, onLoadingComplete]);

  if (!showLoader) return null;

  const containerVariants = {
    initial: { opacity: 1 },
    exit: {
      opacity: 0,
      transition: { duration: 0.5 },
    },
  };

  const ballVariants = {
    initial: { x: "-240px", scale: 1 },
    animate: {
      x: "calc(100vw + 240px)",
      transition: {
        duration: 4.5,
        ease: "easeInOut",
      },
    },
  };

  const textVariants = {
    initial: {
      opacity: 0,
      filter: "blur(14px)",
      scale: 0.95,
    },
    animate: (i: number) => ({
      opacity: 1,
      filter: "blur(0px)",
      scale: 1,
      transition: {
        delay: 0.9 + i * 0.12,
        duration: 0.9,
        ease: "easeOut",
      },
    }),
  };

  const zoomVariant = {
    initial: { scale: 1, opacity: 1 },
    zooming: {
      scale: 28,
      opacity: 0,
      transition: { duration: 1, ease: "easeIn" },
    },
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(circle, #1a1a1a 0%, #000000 100%)" }}
      variants={containerVariants}
      initial="initial"
      exit="exit"
    >
      <motion.div
        className="relative w-full h-full flex items-center justify-center"
        variants={zoomVariant}
        initial="initial"
        animate={zoomStart ? "zooming" : "initial"}
      >
        {/* Rolling Ball */}
        <motion.div
          className="absolute rounded-full bg-white"
          style={{
            width: "40px",
            height: "40px",
            filter: "drop-shadow(0 0 20px rgba(255, 255, 255, 0.6))",
          }}
          variants={ballVariants}
          initial="initial"
          animate="animate"
        />

        {/* Text that gets revealed by the ball */}
        <div className="relative z-0 flex items-center justify-center gap-2">
          {"I AM TMB".split("").map((char, i, arr) => (
            <motion.span
              key={i}
              className="text-6xl font-bold text-white tracking-widest"
              variants={textVariants}
              initial="initial"
              animate="animate"
              custom={i}
              onAnimationComplete={() => {
                // when the last character finishes its reveal, start the zoom
                if (i === arr.length - 1) setZoomStart(true);
              }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
