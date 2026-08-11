import {
  BookOpenCheck,
  Layers,
  Moon,
  PersonStanding,
  Volume2,
  BarChart3,
} from "lucide-react";
import { Reveal } from "./Reveal";

const FEATURES = [
  {
    icon: Layers,
    title: "Flashcard lật thẻ",
    description: "Ghi nhớ chủ động với thẻ lật hai mặt, ảnh minh hoạ sinh động.",
  },
  {
    icon: Volume2,
    title: "Phát âm & phiên âm",
    description: "Nghe phát âm chuẩn và xem phiên âm IPA cho từng từ vựng.",
  },
  {
    icon: BarChart3,
    title: "Theo dõi tiến trình",
    description: "Từ vựng được nhóm theo ngày học, dễ dàng ôn tập lại.",
  },
  {
    icon: PersonStanding,
    title: "Chế độ khách",
    description: "Trải nghiệm ngay không cần đăng ký, dữ liệu lưu tại máy.",
  },
  {
    icon: BookOpenCheck,
    title: "Ghi chú ngữ pháp",
    description: "Lưu bảng, danh sách và mẫu câu ngay trong ứng dụng.",
  },
  {
    icon: Moon,
    title: "Giao diện Sáng/Tối",
    description: "Tự động theo hệ thống hoặc tuỳ chỉnh theo sở thích của bạn.",
  },
];

export const FeatureGrid = () => {
  return (
    <section className="relative py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Đầy đủ công cụ
          </span>
          <h2 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
            Mọi thứ bạn cần để học từ vựng hiệu quả
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={(idx % 3) * 0.08}>
                <div className="group h-full rounded-2xl border border-border bg-card/70 p-6 backdrop-blur-xl transition-colors hover:border-primary/30 hover:bg-card">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary transition-transform group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
