'use client';

import { useState, useEffect } from 'react';
import { cx, ui } from '../../lib/ui';

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
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <p className="text-sm text-[#8b98a5]">
        Affichage de {startItem} à {endItem} sur {totalItems} résultats
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cx(
            'rounded-lg px-3 py-2 text-sm transition',
            currentPage === 1
              ? 'cursor-not-allowed bg-[#1a2838] text-[#5a6a7a]'
              : 'bg-[#24364a] text-white hover:bg-[#2d455d]'
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
              'min-w-[40px] rounded-lg px-3 py-2 text-sm transition',
              page === currentPage
                ? 'bg-[#66c0f4] font-semibold text-[#0b141b]'
                : page === '...'
                  ? 'cursor-default bg-transparent text-[#8b98a5]'
                  : 'bg-[#1a2838] text-white hover:bg-[#2d455d]'
            )}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cx(
            'rounded-lg px-3 py-2 text-sm transition',
            currentPage === totalPages
              ? 'cursor-not-allowed bg-[#1a2838] text-[#5a6a7a]'
              : 'bg-[#24364a] text-white hover:bg-[#2d455d]'
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

  // Reset to page 1 when items change
  useEffect(() => {
    setCurrentPage(1);
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
