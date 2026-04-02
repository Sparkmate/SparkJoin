import {
  BookOpen,
  FileText,
  Home,
  Palette,
  Settings,
  TrendingUp,
} from "lucide-react";

export const navGroups = [
  {
    title: "Dashboard",
    icon: Home,
    path: "/",
    items: [],
  },
  {
    title: "Culture",
    icon: BookOpen,
    items: [
      {
        id: "culture-vision",
        name: "Vision, Conviction, Mission",
        path: "/culture/vision",
      },
      {
        id: "culture-principles",
        name: "Principles",
        path: "/culture/principles",
      },
      {
        id: "culture-master-plan",
        name: "Master Plan",
        path: "/culture/master-plan",
      },
      { id: "culture-failures", name: "Failures", path: "/culture/failures" },
      { id: "culture-readings", name: "Readings", path: "/culture/readings" },
      { id: "culture-formulas", name: "Formulas", path: "/culture/formulas" },
    ],
  },
  {
    title: "Brand",
    icon: Palette,
    items: [
      { id: "brand-bible", name: "Brand Bible", path: "/brand/bible" },
      { id: "brand-assets", name: "Brand Assets", path: "/brand/assets" },
    ],
  },
  {
    title: "Incentive",
    icon: TrendingUp,
    items: [
      {
        id: "incentive-scheme",
        name: "Incentive Scheme",
        path: "/incentive/scheme",
      },
    ],
  },
  {
    title: "Guides",
    icon: FileText,
    items: [
      {
        id: "guides-belt-system",
        name: "Belt System",
        path: "/guides/belt-system",
      },
      {
        id: "guides-bar-raiser",
        name: "Bar Raiser Meeting",
        path: "/guides/bar-raiser-meeting",
      },
      {
        id: "guides-time-off",
        name: "Time-Off Policy",
        path: "/guides/time-off-policy",
      },
      {
        id: "guides-remote",
        name: "Remote Policy",
        path: "/guides/remote-policy",
      },
    ],
  },
  {
    title: "Admin",
    icon: Settings,
    items: [
      {
        id: "admin-teammates",
        name: "Candidates",
        path: "/admin/candidates",
      },
    ],
  },
];
