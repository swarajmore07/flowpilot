export interface PageConfig {
  section: string;
  title: string;
  description: string;
}

/*
 * Keys must match `data/navigation.ts` exactly — the navbar breadcrumb reads
 * from here while the sidebar reads from there, so a drifting key shows up as
 * a route that silently falls back to "Dashboard".
 */
export const pageConfig: Record<string, PageConfig> = {
  "/": {
    section: "Operations",
    title: "Dashboard",
    description: "AI-Powered Supply Chain Command Center",
  },

  "/inventory": {
    section: "Operations",
    title: "Inventory",
    description: "Inventory Management Center",
  },

  "/suppliers": {
    section: "Operations",
    title: "Suppliers",
    description: "Supplier Relationship Management",
  },

  "/production": {
    section: "Operations",
    title: "Production",
    description: "Production Control Center",
  },

  "/analytics": {
    section: "Intelligence",
    title: "Analytics",
    description: "Business Intelligence Dashboard",
  },

  "/ai": {
    section: "Intelligence",
    title: "AI Copilot",
    description: "Operational AI Assistant",
  },

  "/rescue-plan": {
    section: "Execution",
    title: "Rescue Plan",
    description: "AI Recovery Planning",
  },

  "/settings": {
    section: "System",
    title: "Settings",
    description: "Application Configuration",
  },
};

export const fallbackPageConfig: PageConfig = {
  section: "Operations",
  title: "Dashboard",
  description: "AI-Powered Supply Chain Command Center",
};

/**
 * Resolves a pathname to its page config. Tries an exact match first, then the
 * longest registered prefix, so a detail route such as `/suppliers/SUP-1001`
 * still reports the Suppliers section instead of collapsing to the fallback.
 */
export function getPageConfig(pathname: string): PageConfig {
  const exact = pageConfig[pathname];

  if (exact) {
    return exact;
  }

  let match: PageConfig | undefined;
  let matchLength = 0;

  for (const [href, config] of Object.entries(pageConfig)) {
    // "/" prefixes everything, so it can only ever match exactly.
    if (href === "/") continue;

    if (pathname.startsWith(`${href}/`) && href.length > matchLength) {
      match = config;
      matchLength = href.length;
    }
  }

  return match ?? fallbackPageConfig;
}
