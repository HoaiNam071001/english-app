import { motion } from "framer-motion";
import { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
}

export const Reveal = ({
  children,
  className,
  delay = 0,
  direction = "up",
}: RevealProps) => {
  const hidden = {
    opacity: 0,
    y: direction === "up" ? 36 : 0,
    x: direction === "left" ? -48 : direction === "right" ? 48 : 0,
  };

  return (
    <motion.div
      className={className}
      initial={hidden}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
};
