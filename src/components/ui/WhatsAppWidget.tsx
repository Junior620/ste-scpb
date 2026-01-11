'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MessageCircle, X } from 'lucide-react';
import { useCookiePreferences } from './CookieBanner';

export interface WhatsAppWidgetProps {
  phoneNumber?: string;
  className?: string;
}

export function WhatsAppWidget({ phoneNumber, className = '' }: WhatsAppWidgetProps) {
  const t = useTranslations('whatsapp');
  const [isVisible, setIsVisible] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const preferences = useCookiePreferences();

  const phone = phoneNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

  useEffect(() => {
    // Delay appearance for better UX
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Show tooltip after widget appears
    if (isVisible) {
      const timer = setTimeout(() => setIsTooltipVisible(true), 1000);
      const hideTimer = setTimeout(() => setIsTooltipVisible(false), 6000);
      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }
  }, [isVisible]);

  if (!phone) return null;

  const message = encodeURIComponent(t('defaultMessage'));
  const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`;

  // Track click if analytics allowed
  const handleClick = () => {
    if (preferences?.analytics && typeof window !== 'undefined' && 'gtag' in window) {
      (window as unknown as { gtag: (type: string, action: string, params: Record<string, string>) => void }).gtag('event', 'whatsapp_click', {
        event_category: 'engagement',
        event_label: 'WhatsApp Widget',
      });
    }
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1)' : 'scale(0.8)',
        transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
      }}
    >
      {/* Tooltip */}
      {isTooltipVisible && (
        <div
          className="absolute bottom-full right-0 mb-3 bg-background-secondary border border-border rounded-lg p-3 shadow-lg max-w-[200px]"
          style={{
            opacity: isTooltipVisible ? 1 : 0,
            transform: isTooltipVisible ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
          }}
        >
          <button
            onClick={() => setIsTooltipVisible(false)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-background-tertiary rounded-full flex items-center justify-center hover:bg-border transition-colors"
            aria-label="Fermer"
          >
            <X className="w-3 h-3" />
          </button>
          <p className="text-sm text-foreground">{t('tooltip')}</p>
          <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-3 h-3 bg-background-secondary border-r border-b border-border" />
        </div>
      )}

      {/* WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        aria-label={t('ariaLabel')}
      >
        <MessageCircle className="w-7 h-7" fill="currentColor" />
      </a>
    </div>
  );
}
