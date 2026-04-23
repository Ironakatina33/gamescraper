'use client';

import { useState, useEffect, useRef } from 'react';
import { cx } from '../../lib/ui';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--ink-muted)]">
        <span className="text-[var(--ink)]">{startItem}–{endItem}</span>
        <span> sur {totalItems}</span>
      </p>

      <div className="flex items-center gap-0">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cx(
            'mono text-[12px] px-3 py-2 border border-[var(--line-strong)] transition-colors',
            currentPage === 1
              ? 'cursor-not-allowed text-[var(--ink-muted)] opacity-40'
              : 'text-[var(--ink)] hover:bg-[var(--bg-elev)] hover:border-[var(--ink-dim)]'
          )}
          aria-label="Page précédente"
        >
          ←
        </button>

        {visiblePages.map((page, index) => (
          <button
            key={`${page}-${index}`}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={cx(
              'mono text-[12px] min-w-[40px] px-3 py-2 border-t border-b border-r border-[var(--line-strong)] transition-colors',
              page === currentPage
                ? 'bg-[var(--brand)] text-white border-[var(--brand)]'
                : page === '...'
                  ? 'cursor-default text-[var(--ink-muted)]'
                  : 'text-[var(--ink-dim)] hover:text-[var(--ink)] hover:bg-[var(--bg-elev)]'
            )}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cx(
            'mono text-[12px] px-3 py-2 border-t border-b border-r border-[var(--line-strong)] transition-colors',
            currentPage === totalPages
              ? 'cursor-not-allowed text-[var(--ink-muted)] opacity-40'
              : 'text-[var(--ink)] hover:bg-[var(--bg-elev)] hover:border-[var(--ink-dim)]'
          )}
          aria-label="Page suivante"
        >
          →
        </button>
      </div>
    </div>
  );
}

interface UsePaginationProps<T> {
  items: T[];
  itemsPerPage?: number;
  initialPage?: number;
}

export interface UsePaginationResult<T> {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  paginatedItems: T[];
  PaginationComponent: React.FC<{ className?: string }>;
}

export function usePagination<T>({
  items,
  itemsPerPage = 10,
  initialPage = 1,
}: UsePaginationProps<T>): UsePaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  // Ref to track items length for page reset
  const itemsLengthRef = useRef(items.length);
  
  useEffect(() => {
    if (itemsLengthRef.current !== items.length) {
      setCurrentPage(1);
      itemsLengthRef.current = items.length;
    }
  }, [items.length]);

  const paginatedItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const PaginationComponent = ({ className }: { className?: string }) => (
    <div className={className}>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={items.length}
      />
    </div>
  );

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems,
    PaginationComponent,
  };
}
