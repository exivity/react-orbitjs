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
import orgSwitcherInteractor from '@ui/components/sidebar/org-switcher/__tests__/page';

class App {
  orgSwitcher = orgSwitcherInteractor;

  headers = text('h1,h2,h3');

  toast = scoped('.Toastify__toast-container', {
    text: text('.Toastify__toast'),
    messages: collection('.Toastify__toast', {
      text: text(),
      isSuccess: hasClass('Toastify__toast--success'),
      isWarning: hasClass('Toastify__toast--warning'),
      isError: hasClass('Toastify__toast--error'),
      isInfo: hasClass('Toastify__toast--info'),
    }),
  });

  clickNotificationsBell = clickable('[data-test-header-notification]');
  clickLogout = clickable('[data-test-header-menu] [data-test-logout]');
  isLogoutPresent = isPresent('[data-test-header-menu] [data-test-logout]');

  selectLocale = selectable('[data-test-locale-switcher]');
  myProfileText = text('[data-test-header-avatar] [data-test-profile]');

  openSidebar = clickable('[data-test-header-sidebar-button]');
  isSidebarVisible = isPresent('.is-sidebar-visible [data-test-sidebar]');
  openOrgSwitcher = clickable('[data-test-org-switcher-toggler]');
  selectedOrg = text('[data-test-org-switcher-toggler]');

  isOrgSwitcherVisible = isPresent('[data-test-org-switcher]');
  isPaginationVisible = isPresent('[data-test-pagination-footer]');

  isLoaderVisible = isPresent('.spinner');

  waitForDoneLoading = new Interactor('.spinner')
    .when<boolean>((spinner) => {
      return !spinner;
    })
    .do(() => console.log('spinner gone'))
    .timeout(200);
}

export const AppInteractor = interactor(App);

export type TAppInteractor = App & Interactor;

export default new (AppInteractor as any)('#testing-root') as TAppInteractor;
