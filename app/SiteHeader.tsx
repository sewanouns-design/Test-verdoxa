"use client";

import Link from "next/link";

export default function SiteHeader({
  siteName,
  logoUrl,
}: {
  siteName: string;
  logoUrl: string | null;
}) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-brand">
          <span className="site-logo-badge">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="site-logo" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/icon-192.png" alt="" className="site-logo" />
            )}
          </span>
          <span className="site-title">{siteName}</span>
        </Link>
        <nav className="site-nav" aria-label="Navigation principale">
          <Link href="/jouer/classement" className="header-menu-link">🏆 Classement</Link>
        </nav>
      </div>
    </header>
  );
}
