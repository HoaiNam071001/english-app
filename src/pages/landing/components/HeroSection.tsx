import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BrowserFrame } from "./DeviceFrame";
import { GradientBlob } from "./GradientBlob";

export const HeroSection = () => {
  const navigate = useNavigate();
  const { userProfile, isGuest } = useAuth();
  const isAuthed = !!userProfile || isGuest;

  return (
    <section
      id="top"
      className="relative overflow-hidden pb-20 pt-32 md:pb-32 md:pt-44"
    >
      <GradientBlob
        className="-left-32 -top-32 h-[28rem] w-[28rem] bg-gradient-to-br from-brand-start/25 via-brand-mid/15 to-transparent"
        duration={18}
      />
      <GradientBlob
        className="-right-24 top-10 h-[24rem] w-[24rem] bg-gradient-to-br from-brand-end/25 via-brand-start/15 to-transparent"
        duration={20}
        range={30}
      />

      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-xl"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Miễn phí • Học offline • Không giới hạn thẻ từ
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl"
          >
            Học từ vựng tiếng Anh,{" "}
            <span className="bg-gradient-to-r from-brand-start via-brand-mid to-brand-end bg-clip-text text-transparent">
              nhớ mãi không quên
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-6 max-w-xl text-base text-muted-foreground md:text-lg"
          >
            English Master gom flashcard, ghi chú ngữ pháp và kho từ vựng
            cộng đồng vào một nơi duy nhất — học mọi lúc, mọi nơi, kể cả khi
            mất mạng.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button
              size="lg"
              onClick={() => navigate(isAuthed ? ROUTES.HOME : ROUTES.LOGIN)}
              className="w-full gap-2 bg-gradient-to-r from-brand-start via-brand-mid to-brand-end px-6 text-primary-foreground shadow-lg shadow-primary/20 hover:from-brand-hover-start hover:to-brand-hover-end sm:w-auto"
            >
              {isAuthed ? "Vào ứng dụng của bạn" : "Bắt đầu miễn phí"}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="w-full bg-background/60 backdrop-blur-xl sm:w-auto"
            >
              <a href="#features">Khám phá tính năng</a>
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto mt-16 max-w-5xl"
        >
          <div className="absolute inset-x-8 -bottom-6 h-24 rounded-full bg-primary/15 blur-3xl" />
          <BrowserFrame
            src="/home-1.png"
            alt="Giao diện quản lý flashcard từ vựng của English Master"
            className="relative"
          />
        </motion.div>
      </div>
    </section>
  );
};
