import { useEffect } from 'react';

/**
 * Keeps the browser tab title in sync with the current page. Dashboards are
 * client-side routes, so without setting this the title carries over from
 * whatever page the user navigated from.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
