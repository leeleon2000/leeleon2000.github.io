export const SITE = {
  website: "https://leeleon2000.github.io/",
  author: "Leon Lee",
  profile: "https://github.com/leeleon2000",
  desc: "Notes on cross-platform mobile from the platform boundary — iOS, Android, Flutter, and the C++/JNI seam in between.",
  title: "Leon Lee",
  ogImage: "", // empty → Layout falls back to auto-generated /og.png
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: false,
    text: "Edit page",
    url: "https://github.com/leeleon2000/leeleon2000.github.io/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr", // "rtl" | "auto"
  lang: "en", // html lang code. Set this empty and default will be "en"
  timezone: "Asia/Taipei", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;
