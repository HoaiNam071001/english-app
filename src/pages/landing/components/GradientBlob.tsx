import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GradientBlobProps {
  className?: string;
  duration?: number;
  range?: number;
}

export const GradientBlob = ({
  className,
  duration = 16,
  range = 24,
}: GradientBlobProps) => {
  return (
    <motion.div
      aria-hidden
      className={cn("absolute rounded-full blur-3xl", className)}
      animate={{
        x: [0, range, 0],
        y: [0, -range, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};
