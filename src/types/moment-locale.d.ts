// moment có sẵn file JS cho locale (node_modules/moment/locale/vi.js) nhưng
// không kèm .d.ts. Với `noUncheckedSideEffectImports`, TS kiểm tra cả import
// chỉ-lấy-side-effect nên `import "moment/locale/vi"` báo TS2307.
// Khai báo ambient này để import chạy đúng mà không cần tắt option đó.
declare module "moment/locale/*";
