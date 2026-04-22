import { cx } from '../../lib/ui';

type BrandLogoProps = {
  className?: string;
  withText?: boolean;
};

export default function BrandLogo({ className, withText = true }: BrandLogoProps) {
  return (
    <div className={cx('inline-flex items-center gap-3', className)}>
      <span className="grid h-10 w-10 place-items-center rounded-lg border border-[#2e4a62] bg-[#0f1b28] shadow-[0_0_26px_rgba(102,192,244,0.28)]">
        <svg viewBox="0 0 48 48" className="h-6 w-6" aria-hidden="true">
          <path
            d="M6 14.5c0-1.3 1-2.3 2.3-2.3H23v23.6H8.3c-1.3 0-2.3-1-2.3-2.3V14.5Z"
            fill="#66c0f4"
          />
          <path
            d="M25 12.2h14.7c1.3 0 2.3 1 2.3 2.3v19c0 1.3-1 2.3-2.3 2.3H25V12.2Z"
            fill="#2a475e"
          />
          <circle cx="24" cy="24" r="5.2" fill="#0b141b" />
          <circle cx="24" cy="24" r="2.6" fill="#9ddcff" />
        </svg>
      </span>
      {withText ? (
        <span>
          <span className="block text-[11px] uppercase tracking-[0.22em] text-[#66c0f4]">
            tracker
          </span>
          <span className="block text-sm font-black text-white">GameScraper</span>
        </span>
      ) : null}
    </div>
  );
}
