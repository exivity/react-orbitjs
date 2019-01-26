import {
  interactor,
  clickable,
  text,
  selectable,
  scoped,
  hasClass,
  isPresent,
  collection,
  Interactor,
} from '@bigtest/interactor';

class App {
  pageText = text()
}

export type TAppInteractor = App & Interactor;
export const AppInteractor = interactor(App);

export default new (AppInteractor as any)('#testing-root') as TAppInteractor;
