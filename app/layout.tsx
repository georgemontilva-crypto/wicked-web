import {siteOrigin} from '@/lib/seo';
import type { Metadata } from 'next';
import './globals.css';
import './brand-refresh.css';
import { readCatalog } from '@/lib/store';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await readCatalog();
  return {
    metadataBase: new URL(siteOrigin()),
    title: { default: `${settings.brand} — Product Collections`, template: `%s | ${settings.brand}` },
    description: settings.footerText,
    icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { settings } = await readCatalog();
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head><link rel="preload" href="/fonts/FugazOne-Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous"/></head>
      <body style={{ '--brand-accent': settings.accent } as React.CSSProperties}>
        <a className="skip-link" href="#content">Skip to content</a>
        <SiteHeader settings={{...settings,contactRecipientEmail:''}}/>
        <div id="content">{children}</div>
        <SiteFooter settings={{...settings,contactRecipientEmail:''}}/>
      </body>
    </html>
  );
}
