'use client';

/**
 * Footer Component
 * B2B-focused footer with export documentation, consistent contact info
 * Optimized for international buyers
 */

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, Ship, FileCheck } from 'lucide-react';
import { NewsletterForm } from '@/components/forms/NewsletterForm';

export function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const tContact = useTranslations('contact.info');

  // Quick links - added B2B conversion links + all key pages for SEO
  const quickLinks = [
    { href: '/', label: tNav('home') },
    { href: '/produits', label: tNav('products') },
    { href: '/produits/cacao', label: t('links.quality') },
    { href: '/a-propos', label: tNav('about') },
    { href: '/equipe', label: tNav('team') },
    { href: '/actualites', label: tNav('news') },
    { href: '/statistiques', label: tNav('statistics') },
    { href: '/devis', label: tNav('quote') },
  ];

  const legalLinks = [
    { href: '/mentions-legales', label: tNav('legalMentions') },
    { href: '/politique-confidentialite', label: tNav('privacyPolicy') },
  ];

  return (
    <footer className="bg-background-secondary border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info - Consistent contact */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/logo.png"
                alt="STE-SCPB"
                width={64}
                height={64}
                className="h-14 w-auto"
              />
            </Link>
            <p className="text-foreground-muted text-sm mb-4">{t('tagline')}</p>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2 text-foreground-muted">
                <MapPin className="w-4 h-4 mt-0.5 text-primary" />
                <span>{tContact('addressValue')}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground-muted">
                <Phone className="w-4 h-4 text-primary" />
                <a href="tel:+237676905938" className="hover:text-primary transition-colors">
                  +237 676 905 938
                </a>
              </div>
              <div className="flex items-center gap-2 text-foreground-muted">
                <Mail className="w-4 h-4 text-primary" />
                <a
                  href="mailto:direction@scpb-kameragro.com"
                  className="hover:text-primary transition-colors"
                >
                  direction@scpb-kameragro.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-foreground-muted">
                <Clock className="w-4 h-4 text-primary" />
                <span>{tContact('hoursValue')}</span>
              </div>
            </div>

            {/* USA Office - Partner */}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-foreground-muted mb-2 font-medium">{t('usaOffice')}</p>
              <div className="flex items-center gap-2 text-foreground-muted text-sm">
                <Phone className="w-4 h-4 text-primary" />
                <a href="tel:+19175939310" className="hover:text-primary transition-colors">
                  +1 917 593 9310
                </a>
              </div>
              <p className="text-xs text-foreground-muted mt-2">
                {t('partner')}: <span className="font-medium">KAMER AGRO LLC</span>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground-muted hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">{t('legal')}</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground-muted hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            {/* Contact link */}
            <div className="mt-4 pt-4 border-t border-border">
              <Link
                href="/contact"
                className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
              >
                {t('links.contact')}
              </Link>
            </div>
          </div>

          {/* Newsletter - B2B focused */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Newsletter</h3>
            <p className="text-xs text-foreground-muted mb-4">{t('newsletterDesc')}</p>
            <NewsletterForm compact />
          </div>
        </div>

        {/* Export documentation line - Premium international */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-foreground-muted">
            <span className="flex items-center gap-1">
              <FileCheck className="w-3 h-3 text-primary" />
              {t('export.docs')}
            </span>
            <span className="flex items-center gap-1">
              <Ship className="w-3 h-3 text-primary" />
              {t('export.ports')}
            </span>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-sm text-foreground-muted">
            {t('copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
