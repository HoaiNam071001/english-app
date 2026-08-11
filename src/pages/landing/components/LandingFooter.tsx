export const LandingFooter = () => {
  return (
    <footer className="relative border-t border-border py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row md:px-8">
        <a href="#top" className="flex items-center gap-2">
          <img src="/logo.svg" alt="English Master" className="h-6 w-6" />
          <span className="text-sm font-semibold text-foreground">
            English Master
          </span>
        </a>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} English Master. Học từ vựng mỗi ngày.
        </p>
      </div>
    </footer>
  );
};
