import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import "./globals.css";

export const metadata = {
  title: {
    default: "Download Center TAKEAT",
    template: "%s | Download Center TAKEAT"
  },
  description: "Central de downloads para drivers, utilitarios, guias e aplicativos internos.",
  keywords: ["drivers", "impressoras", "TAKEAT", "download center", "utilitarios"],
  icons: {
    icon: [
      { url: "/img/takeat-favicon.png", type: "image/png", sizes: "64x64" },
      { url: "/img/TakeatLogo.avif", type: "image/avif" }
    ],
    shortcut: ["/img/takeat-favicon.png"],
    apple: [{ url: "/img/takeat-favicon.png", sizes: "64x64" }]
  },
  openGraph: {
    title: "Download Center TAKEAT",
    description: "Drivers, guias de instalacao, apps internos e tutoriais em uma central moderna.",
    type: "website"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var theme=localStorage.getItem('takeat-theme');if(theme==='dark'||theme==='light'){document.documentElement.dataset.theme=theme;}}catch(error){}"
          }}
        />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
