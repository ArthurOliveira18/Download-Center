"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  DownloadCloud,
  GraduationCap,
  Home,
  Menu,
  Moon,
  PackageOpen,
  ShieldCheck,
  Sun,
  X
} from "lucide-react";
import styles from "./SiteHeader.module.css";

const navigation = [
  { href: "/", label: "Home", icon: Home },
  { href: "/drivers", label: "Drivers", icon: DownloadCloud },
  { href: "/guias", label: "Guias", icon: BookOpen },
  { href: "/apps", label: "Apps internos", icon: PackageOpen },
  { href: "/tutoriais", label: "Tutoriais", icon: GraduationCap },
  { href: "/admin", label: "Admin", icon: ShieldCheck }
];

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("takeat-theme");
    const initialTheme = storedTheme === "dark" ? "dark" : "light";

    setTheme(initialTheme);
    document.documentElement.dataset.theme = initialTheme;
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("takeat-theme", nextTheme);
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Download Center TAKEAT" onClick={() => setIsOpen(false)}>
          <img className={styles.logoImage} src="/img/TakeatLogo.avif" alt="TAKEAT" />
        </Link>

        <div className={styles.headerActions}>
          <nav className={`${styles.nav} ${isOpen ? styles.navOpen : ""}`} aria-label="Principal">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.active : ""}`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <button
            className={styles.themeButton}
            type="button"
            aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
            title={theme === "dark" ? "Tema claro" : "Tema escuro"}
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          <button
            className={styles.menuButton}
            type="button"
            aria-label="Abrir menu"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((value) => !value)}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
