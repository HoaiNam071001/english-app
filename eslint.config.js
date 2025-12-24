import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      ...tseslint.configs.recommended, // Đảm bảo dùng spread operator nếu cần
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    // --- THÊM PHẦN RULES VÀO ĐÂY ---
    rules: {
      // Tắt quy tắc gốc của JS
      "no-unused-expressions": "off",
      // Cấu hình quy tắc của TypeScript
      "@typescript-eslint/no-unused-expressions": [
        "error",
        {
          allowShortCircuit: true, // Cho phép: a && b()
          allowTernary: true, // Cho phép: a ? b() : c()
          allowTaggedTemplates: true,
        },
      ],
      // --- TẮT LỖI SET STATE TRONG EFFECT TẠI ĐÂY ---
      "react-hooks/set-state-in-effect": "off",
    },
    // ------------------------------
  },
]);
