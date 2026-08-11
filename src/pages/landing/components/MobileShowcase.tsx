import { WifiOff, Zap, Smartphone } from "lucide-react";
import { GradientBlob } from "./GradientBlob";
import { PhoneFrame } from "./DeviceFrame";
import { Reveal } from "./Reveal";

const POINTS = [
  {
    icon: Smartphone,
    title: "Giao diện gọn gàng",
    text: "Tối ưu thao tác một tay, học nhanh trong vài phút rảnh rỗi.",
  },
  {
    icon: WifiOff,
    title: "Hoạt động offline",
    text: "Công nghệ PWA giúp bạn ôn từ vựng kể cả khi không có mạng.",
  },
  {
    icon: Zap,
    title: "Đồng bộ tức thì",
    text: "Thêm từ mới trên điện thoại, xem lại ngay trên máy tính.",
  },
];

export const MobileShowcase = () => {
  return (
    <section id="mobile" className="relative overflow-hidden py-16 md:py-24">
      <GradientBlob
        className="left-1/2 top-0 h-[26rem] w-[26rem] -translate-x-1/2 bg-gradient-to-br from-brand-start/15 via-brand-end/15 to-transparent"
        duration={22}
      />
      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <Reveal direction="left" className="order-2 flex justify-center md:order-1">
            <PhoneFrame src="/home-4.png" alt="English Master trên giao diện di động" />
          </Reveal>

          <Reveal direction="right" className="order-1 text-center md:order-2 md:text-left">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Mọi thiết bị
            </span>
            <h2 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
              Mang theo từ vựng của bạn ở{" "}
              <span className="bg-gradient-to-r from-brand-start to-brand-end bg-clip-text text-transparent">
                bất cứ đâu
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground md:mx-0 md:text-lg">
              Cài đặt như một ứng dụng thật trên điện thoại, học liền mạch dù
              đang di chuyển hay mất kết nối mạng.
            </p>

            <div className="mt-8 space-y-5">
              {POINTS.map((point) => {
                const Icon = point.icon;
                return (
                  <div
                    key={point.title}
                    className="flex items-start gap-4 rounded-2xl border border-border bg-card/70 p-4 text-left backdrop-blur-xl"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">{point.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {point.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
