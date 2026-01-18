import {
  Anchor,
  Atom,
  Award,
  Book,
  Briefcase,
  Calculator,
  Camera,
  Car,
  Code,
  Coffee,
  Dumbbell,
  Folder,
  Gamepad2,
  Globe,
  GraduationCap,
  Headphones,
  Heart,
  Home,
  Laptop,
  Lightbulb,
  LucideIcon,
  MapPin,
  Music,
  Palette,
  Plane,
  ShoppingBag,
  Smile,
  Star,
  Sun,
  Utensils,
  Zap,
} from "lucide-react";

const {
  VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID,
  VITE_FIREBASE_MEASUREMENT_ID,
} = import.meta.env;

export const FIREBASE_API_KEY = VITE_FIREBASE_API_KEY;
export const FIREBASE_AUTH_DOMAIN = VITE_FIREBASE_AUTH_DOMAIN;
export const FIREBASE_PROJECT_ID = VITE_FIREBASE_PROJECT_ID;
export const FIREBASE_STORAGE_BUCKET = VITE_FIREBASE_STORAGE_BUCKET;
export const FIREBASE_MESSAGING_SENDER_ID = VITE_FIREBASE_MESSAGING_SENDER_ID;
export const FIREBASE_APP_ID = VITE_FIREBASE_APP_ID;
export const FIREBASE_MEASUREMENT_ID = VITE_FIREBASE_MEASUREMENT_ID;

export const HEADER_HEIGHT = 56;

export const STORAGE_KEY = {
  IS_GUEST: "is_GUEST",
  SAVED_ACCOUNTS: "SAVED_ACCOUNTS",
  CAR_TABS: "CAR_TABS",
  NOTE_LAYOUT: "NOTE_LAYOUT",
  NOTE_GROUPED: "NOTE_GROUPED",
  NOTE_EXPANDED: "NOTE_EXPANDED",

  MOBILE_HOME_COLLAPSE_ACTION: "MOBILE_HOME_COLLAPSE_ACTION",
};

export const ADMIN_INFO = {
  email: "nam215543694@gmail.com",
};

export const ICON_MAP: Record<string, LucideIcon> = {
  folder: Folder,
  book: Book,
  graduation: GraduationCap,
  briefcase: Briefcase,
  globe: Globe,
  plane: Plane,
  car: Car,
  home: Home,
  shopping: ShoppingBag,
  utensils: Utensils,
  coffee: Coffee,
  music: Music,
  headphones: Headphones,
  camera: Camera,
  gamepad: Gamepad2,
  laptop: Laptop,
  code: Code,
  atom: Atom,
  calculator: Calculator,
  palette: Palette,
  dumbbell: Dumbbell,
  heart: Heart,
  star: Star,
  smile: Smile,
  sun: Sun,
  zap: Zap,
  lightbulb: Lightbulb,
  award: Award,
  anchor: Anchor,
  map: MapPin,
};

export const ICON_KEYS = Object.keys(ICON_MAP);

export type TopicColor = {
  id: string;
  bg: string;
  text: string;
  border: string;
};
// --- CONFIGURATION ---
export const TOPIC_COLORS: TopicColor[] = [
  {
    id: "blue",
    bg: "bg-blue-100",
    text: "text-blue-600",
    border: "border-blue-200",
  },
  {
    id: "red",
    bg: "bg-red-100",
    text: "text-red-600",
    border: "border-red-200",
  },
  {
    id: "orange",
    bg: "bg-orange-100",
    text: "text-orange-600",
    border: "border-orange-200",
  },
  {
    id: "amber",
    bg: "bg-amber-100",
    text: "text-amber-600",
    border: "border-amber-200",
  },
  {
    id: "yellow",
    bg: "bg-yellow-100",
    text: "text-yellow-600",
    border: "border-yellow-200",
  },
  {
    id: "lime",
    bg: "bg-lime-100",
    text: "text-lime-600",
    border: "border-lime-200",
  },
  {
    id: "green",
    bg: "bg-green-100",
    text: "text-green-600",
    border: "border-green-200",
  },
  {
    id: "emerald",
    bg: "bg-emerald-100",
    text: "text-emerald-600",
    border: "border-emerald-200",
  },
  {
    id: "teal",
    bg: "bg-teal-100",
    text: "text-teal-600",
    border: "border-teal-200",
  },
  {
    id: "cyan",
    bg: "bg-cyan-100",
    text: "text-cyan-600",
    border: "border-cyan-200",
  },
  {
    id: "sky",
    bg: "bg-sky-100",
    text: "text-sky-600",
    border: "border-sky-200",
  },
  {
    id: "indigo",
    bg: "bg-indigo-100",
    text: "text-indigo-600",
    border: "border-indigo-200",
  },
  {
    id: "violet",
    bg: "bg-violet-100",
    text: "text-violet-600",
    border: "border-violet-200",
  },
  {
    id: "purple",
    bg: "bg-purple-100",
    text: "text-purple-600",
    border: "border-purple-200",
  },
  {
    id: "fuchsia",
    bg: "bg-fuchsia-100",
    text: "text-fuchsia-600",
    border: "border-fuchsia-200",
  },
  {
    id: "pink",
    bg: "bg-pink-100",
    text: "text-pink-600",
    border: "border-pink-200",
  },
  {
    id: "rose",
    bg: "bg-rose-100",
    text: "text-rose-600",
    border: "border-rose-200",
  },
  {
    id: "slate",
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
  },
];

export const TYPE_COLORS = [
  {
    id: "red",
    hex: "#ef4444",
    bg: "bg-red-500",
    badge:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  },
  {
    id: "orange",
    hex: "#f97316",
    bg: "bg-orange-500",
    badge:
      "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
  },
  {
    id: "amber",
    hex: "#f59e0b",
    bg: "bg-amber-500",
    badge:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  },
  {
    id: "lime",
    hex: "#84cc16",
    bg: "bg-lime-500",
    badge:
      "bg-lime-100 text-lime-700 border-lime-200 dark:bg-lime-500/10 dark:text-lime-400 dark:border-lime-500/20",
  },
  {
    id: "emerald",
    hex: "#10b981",
    bg: "bg-emerald-500",
    badge:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  },
  {
    id: "teal",
    hex: "#14b8a6",
    bg: "bg-teal-500",
    badge:
      "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20",
  },
  {
    id: "cyan",
    hex: "#06b6d4",
    bg: "bg-cyan-500",
    badge:
      "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20",
  },
  {
    id: "blue",
    hex: "#3b82f6",
    bg: "bg-blue-500",
    badge:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  },
  {
    id: "indigo",
    hex: "#6366f1",
    bg: "bg-indigo-500",
    badge:
      "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
  },
  {
    id: "violet",
    hex: "#8b5cf6",
    bg: "bg-violet-500",
    badge:
      "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
  },
  {
    id: "fuchsia",
    hex: "#d946ef",
    bg: "bg-fuchsia-500",
    badge:
      "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-500/10 dark:text-fuchsia-400 dark:border-fuchsia-500/20",
  },
  {
    id: "rose",
    hex: "#f43f5e",
    bg: "bg-rose-500",
    badge:
      "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
  },
  {
    id: "slate",
    hex: "#64748b",
    bg: "bg-slate-500",
    badge:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20",
  },
];

export const GUEST_INFO = {
  name: "Guest",
  id: "guest",
  storageKey: {
    topic: "topic_storage",
    vocabulary: "vocabulary_storage",
    cardTabs: "cardTabs",
    wordTypes: "wordTypes",
    notes: "Notes",
  },
};

export const ROUTES = {
  // Public
  HOME: "/",
  LOGIN: "/login",
  SHARED: "/shared",
  NOTE: "/note",

  // Admin Area
  ADMIN: {
    ROOT: "/admin", // Đường dẫn gốc của admin
    USERS: "users", // Đường dẫn tương đối (để dùng trong Route con)
  },
};
export const ABSOLUTE_ROUTES = {
  ADMIN_USERS: `${ROUTES.ADMIN.ROOT}/${ROUTES.ADMIN.USERS}`,
};
