'use client';

import { ReactNode, MouseEvent } from 'react';
import { Link } from '@/i18n/routing';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';

interface SmartLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  saveScroll?: boolean;
  [key: string]: any;
}

/**
 * SmartLink - Link component with scroll position saving
 *
 * Usage:
 * ```tsx
 * <SmartLink href="/contact">Contact Us</SmartLink>
 * ```
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
    // Only intercept left clicks without modifiers
    if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey && saveScroll) {
      e.preventDefault();
      navigateWithReturn(href, { saveScroll });
    }
  };

  return (
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
