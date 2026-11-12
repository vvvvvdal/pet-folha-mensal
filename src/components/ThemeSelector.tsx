"use client";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/lib/theme";
export function ThemeSelector() {
  const { preference, setTheme } = useTheme();
  return <div className="theme-options" role="group" aria-label="Tema">
    {([{ value: "light", label: "Claro", Icon: Sun }, { value: "dark", label: "Escuro", Icon: Moon }, { value: "system", label: "Sistema", Icon: Monitor }] as const).map(({value, label, Icon}) =>
      <button type="button" key={value} aria-pressed={preference === value} onClick={() => setTheme(value)}><Icon size={18} aria-hidden="true" />{label}</button>)}
  </div>;
}
