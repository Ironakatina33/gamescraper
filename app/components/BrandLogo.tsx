import { cx } from '../../lib/ui';

type BrandLogoProps = {
  className?: string;
  withText?: boolean;
};

export default function BrandLogo({ className, withText = true }: BrandLogoProps) {
  return (
    <div className={cx('inline-flex items-center gap-2.5 group', className)}>
      <span className="relative inline-block h-6 w-6">
        <span className="absolute inset-0 bg-[var(--brand)] transition-transform duration-500 group-hover:rotate-[22deg]" />
        <span className="absolute inset-[3px] bg-[var(--bg)]" />
        <span className="absolute inset-[7px] bg-[var(--brand-hi)]" />
      </span>
      {withText ? (
        <span className="flex items-baseline gap-1.5">
          <span className="text-[15px] font-medium tracking-tight text-[var(--ink)]">
            gamescraper
          </span>
          <span className="mono text-[10px] text-[var(--ink-muted)] uppercase tracking-[0.2em]">
            v2
          </span>
        </span>
      ) : null}
    </div>
  );
}
