import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GradientBlob } from "./GradientBlob";
import { Reveal } from "./Reveal";

export const CtaSection = () => {
  const navigate = useNavigate();
  const { userProfile, isGuest } = useAuth();
  const isAuthed = !!userProfile || isGuest;

  return (
    <section className="relative py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 md:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-6 py-14 text-center backdrop-blur-xl sm:px-12">
            <GradientBlob
              className="left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-blue-500/30 via-violet-500/30 to-fuchsia-500/20"
              duration={20}
            />
            <div className="relative">
              <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                Sẵn sàng nâng trình từ vựng của bạn?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-slate-300">
                Tham gia English Master ngay hôm nay — hoàn toàn miễn phí,
                không cần thẻ tín dụng.
              </p>
              <Button
                size="lg"
                onClick={() => navigate(isAuthed ? ROUTES.HOME : ROUTES.LOGIN)}
                className="mt-8 gap-2 bg-gradient-to-r from-blue-500 to-violet-500 px-8 text-white shadow-lg shadow-blue-500/25 hover:from-blue-400 hover:to-violet-400"
              >
                {isAuthed ? "Vào ứng dụng của bạn" : "Bắt đầu miễn phí ngay"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
