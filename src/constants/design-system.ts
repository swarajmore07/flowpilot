export const designSystem = {
  radius: {
    card: "rounded-2xl",
    button: "rounded-xl",
    input: "rounded-xl",
    badge: "rounded-full",
  },

  shadow: {
    card: "shadow-sm",
    elevated: "shadow-md",
  },

  colors: {
    primary: "blue-600",
    success: "emerald-600",
    warning: "amber-500",
    danger: "red-500",

    background: "slate-50",
    border: "slate-200",

    text: {
      primary: "slate-900",
      secondary: "slate-500",
    },
  },

  spacing: {
    page: "p-8",
    card: "p-6",
    section: "space-y-8",
  },
} as const;