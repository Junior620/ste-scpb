'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="bg-background text-foreground min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-4xl font-bold mb-4 text-primary">Erreur</h1>
          <p className="text-foreground-muted mb-6">
            Une erreur inattendue s&apos;est produite. Notre équipe a été notifiée.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary-light transition-colors"
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
