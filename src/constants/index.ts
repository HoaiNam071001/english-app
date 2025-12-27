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

export const STORAGE_KEY = {
  IS_GUEST: "is_GUEST",
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

export const GUEST_INFO = {
  name: "Guest",
  id: "guest",
  storageKey: {
    topic: "topic_storage",
    vocabulary: "vocabulary_storage",
  },
};

export const ROUTES = {
  // Public
  HOME: "/",
  LOGIN: "/login",

  // Admin Area
  ADMIN: {
    ROOT: "/admin", // Đường dẫn gốc của admin
    USERS: "users", // Đường dẫn tương đối (để dùng trong Route con)
  },
};
export const ABSOLUTE_ROUTES = {
  ADMIN_USERS: `${ROUTES.ADMIN.ROOT}/${ROUTES.ADMIN.USERS}`,
};
