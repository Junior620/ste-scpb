'use client';

import { ReactNode, MouseEvent, ComponentProps } from 'react';
import { Link } from '@/i18n/routing';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';

type AppHref = ComponentProps<typeof Link>['href'];

interface SmartLinkProps {
  href: AppHref;
  children: ReactNode;
  className?: string;
  saveScroll?: boolean;
  [key: string]: unknown;
}

/**
 * SmartLink - Link component with scroll position saving
 */
export function SmartLink({
  href,
  children,
  className,
  saveScroll = true,
  ...props
}: SmartLinkProps) {
  const { navigateWithReturn } = useSmartNavigation();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey && saveScroll) {
      e.preventDefault();
      const hrefString = typeof href === 'string' ? href : href.pathname;
      navigateWithReturn(hrefString, { saveScroll });
    }
  };

  return (
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
