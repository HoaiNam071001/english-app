import { NotebookPen, Table, ListChecks, Users, Import, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { CtaSection } from "./components/CtaSection";
import { FeatureGrid } from "./components/FeatureGrid";
import { FeatureShowcase } from "./components/FeatureShowcase";
import { LandingFooter } from "./components/LandingFooter";
import { LandingHeader } from "./components/LandingHeader";
import { HeroSection } from "./components/HeroSection";
import { MobileShowcase } from "./components/MobileShowcase";

const LandingPage = () => {
  useEffect(() => {
    document.title = "English Master - Học từ vựng tiếng Anh mỗi ngày";
    const previousBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = previousBehavior;
    };
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground transition-colors duration-300">
      <LandingHeader />
      <main>
        <HeroSection />

        <FeatureShowcase
          id="features"
          eyebrow="Ghi chú thông minh"
          title={
            <>
              Lưu ngữ pháp & mẫu câu vào{" "}
              <span className="bg-gradient-to-r from-brand-start to-brand-end bg-clip-text text-transparent">
                một nơi duy nhất
              </span>
            </>
          }
          description="Tạo note dạng bảng, danh sách hay markdown ngay trong ứng dụng. Không cần chuyển qua lại giữa nhiều công cụ để ôn lại kiến thức."
          points={[
            { icon: Table, text: "Bảng biểu trực quan cho ngữ pháp" },
            { icon: ListChecks, text: "Danh sách checklist dễ theo dõi" },
            { icon: NotebookPen, text: "Soạn thảo mượt mà như Notion" },
          ]}
          image="/home-2.png"
          imageAlt="Trang ghi chú ngữ pháp của English Master"
        />

        <FeatureShowcase
          id="community"
          eyebrow="Cộng đồng"
          title={
            <>
              Học nhanh hơn nhờ{" "}
              <span className="bg-gradient-to-r from-brand-start to-brand-end bg-clip-text text-transparent">
                kho từ vựng có sẵn
              </span>
            </>
          }
          description="Khám phá và import bộ từ vựng được cộng đồng chia sẻ, tiết kiệm hàng giờ tự soạn thẻ mới cho từng chủ đề."
          points={[
            { icon: Users, text: "Hàng trăm bộ từ vựng theo chủ đề" },
            { icon: Import, text: "Import chỉ với một cú nhấp chuột" },
            { icon: Sparkles, text: "Cập nhật liên tục từ người dùng" },
          ]}
          image="/home-3.png"
          imageAlt="Thư viện từ vựng cộng đồng của English Master"
          reverse
        />

        <MobileShowcase />

        <FeatureGrid />

        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
