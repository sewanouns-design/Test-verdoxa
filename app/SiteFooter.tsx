"use client";

import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link href="/admin" className="footer-admin-link">
        <span aria-hidden="true">👤</span> Administration
      </Link>
    </footer>
  );
}
