"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  DownloadCloud,
  GraduationCap,
  Home,
  Menu,
  PackageOpen,
  ShieldCheck,
  Wrench,
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

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} onClick={() => setIsOpen(false)}>
          <span className={styles.brandIcon}>
            <Wrench size={20} strokeWidth={2.4} />
          </span>
          <span>
            <strong>Download Center</strong>
            <small>TAKEAT</small>
          </span>
        </Link>

        <button
          className={styles.menuButton}
          type="button"
          aria-label="Abrir menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

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
      </div>
    </header>
  );
}
