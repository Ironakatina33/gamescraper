import { cx } from '../../lib/ui';

type BrandLogoProps = {
  className?: string;
  withText?: boolean;
};

export default function BrandLogo({ className, withText = true }: BrandLogoProps) {
  return (
    <div className={cx('inline-flex items-center gap-3', className)}>
      <span className="grid h-9 w-9 place-items-center rounded-md border border-[#334155] bg-[#1e293b]">
        <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
          <path
            d="M6 14.5c0-1.3 1-2.3 2.3-2.3H23v23.6H8.3c-1.3 0-2.3-1-2.3-2.3V14.5Z"
            fill="#2563eb"
          />
          <path
            d="M25 12.2h14.7c1.3 0 2.3 1 2.3 2.3v19c0 1.3-1 2.3-2.3 2.3H25V12.2Z"
            fill="#334155"
          />
          <circle cx="24" cy="24" r="5.2" fill="#1e293b" />
          <circle cx="24" cy="24" r="2.6" fill="#2563eb" />
        </svg>
      </span>
      {withText ? (
        <span>
          <span className="block text-[11px] uppercase tracking-wider text-[#2563eb]">
            tracker
          </span>
          <span className="block text-sm font-semibold text-white">GameScraper</span>
        </span>
      ) : null}
    </div>
  );
}
