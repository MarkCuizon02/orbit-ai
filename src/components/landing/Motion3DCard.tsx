import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface Motion3DCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "indigo" | "emerald" | "amber" | "purple" | "cyan" | "rose";
  depth?: number;
  onClick?: () => void;
}

export const Motion3DCard: React.FC<Motion3DCardProps> = ({
  children,
  className = "",
  glowColor = "indigo",
  depth = 20,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse position relative to card center (-0.5 to 0.5)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for tilt angles
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 25 });

  // Map mouse movement to subtle 3D rotation degrees (-12deg to +12deg)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  // Glow position percentages
  const glowX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const glowY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const glowMap = {
    indigo: "from-indigo-500/20 via-indigo-500/5 to-transparent border-indigo-500/30 shadow-indigo-500/10",
    emerald: "from-emerald-500/20 via-emerald-500/5 to-transparent border-emerald-500/30 shadow-emerald-500/10",
    amber: "from-amber-500/20 via-amber-500/5 to-transparent border-amber-500/30 shadow-amber-500/10",
    purple: "from-purple-500/20 via-purple-500/5 to-transparent border-purple-500/30 shadow-purple-500/10",
    cyan: "from-cyan-500/20 via-cyan-500/5 to-transparent border-cyan-500/30 shadow-cyan-500/10",
    rose: "from-rose-500/20 via-rose-500/5 to-transparent border-rose-500/30 shadow-rose-500/10",
  };

  return (
    <motion.div
      ref={cardRef}
      style={{
        perspective: 1000,
      }}
      className="relative group"
      onClick={onClick}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={{
          scale: isHovered ? 1.02 : 1,
          translateZ: isHovered ? depth : 0,
        }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`relative rounded-3xl bg-zinc-900/80 border backdrop-blur-xl transition-colors duration-300 ${glowMap[glowColor]} ${className}`}
      >
        {/* Specular Ambient Glow Overlay following mouse */}
        <motion.div
          style={{
            background: `radial-gradient(400px circle at ${glowX} ${glowY}, rgba(255,255,255,0.08), transparent 80%)`,
          }}
          className="absolute inset-0 rounded-3xl pointer-events-none z-10 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        />

        {/* 3D Depth Inner Wrapper */}
        <div style={{ transform: `translateZ(${depth}px)` }} className="relative z-20">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};
