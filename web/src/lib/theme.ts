import { useCallback, useEffect, useState } from "react";

type Theme = "" | "light" | "dark";

function read(): Theme {
  try {
    const v = localStorage.getItem("eventops-theme");
    if (v === "light" || v === "dark") return v;
  } catch {
    /* storage unavailable */
  }
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(read);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light" || theme === "dark") root.setAttribute("data-theme", theme);
    else root.removeAttribute("data-theme");
    try {
      if (theme) localStorage.setItem("eventops-theme", theme);
      else localStorage.removeItem("eventops-theme");
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);
  return { theme, toggle, isDark: theme === "dark" };
}
