import { redirect } from 'next/navigation';

/**
 * Global 404 fallback page
 * Redirects to the French locale not-found page (default locale)
 * This handles cases where the 404 occurs outside of the [locale] route
 */
export default function GlobalNotFound() {
  redirect('/fr');
}
