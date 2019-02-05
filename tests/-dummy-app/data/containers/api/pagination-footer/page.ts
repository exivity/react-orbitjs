import { interactor, clickable, text, Interactor } from '@bigtest/interactor';

class Pagination {
  clickFirst = clickable('a[type="firstItem"]');
  clickPrev = clickable('a[type="prevItem"]');
  clickNext = clickable('a[type="nextItem"]');
  clickLast = clickable('a[type="lastItem"]');

  activePage = text('a.active.time');
}

export const PaginationInteractor = interactor(Pagination);

export type TPageinationInteractor = Pagination & Interactor;

export default new (PaginationInteractor as any)(
  '[data-test-pagination-footer]'
) as TPageinationInteractor;
