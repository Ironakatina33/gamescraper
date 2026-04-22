'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-[#222] py-8">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#666]">
            © {new Date().getFullYear()} GameScraper
          </p>
          <div className="flex gap-6">
            <Link 
              href="/admin?secret=14102004" 
              className="text-sm text-[#666] hover:text-white"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
