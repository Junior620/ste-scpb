'use client';

/**
 * Value Chain Section Component
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4
 *
 * Scroll-driven animation showing the supply chain:
 * - Farm (points)
 * - Collecte (connecting lines)
 * - Contrôle qualité (scan/halo effect)
 * - Logistique/Export (trajectories to EU/USA/Asia)
 */

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui';
import { FileText, Phone, ArrowRight } from 'lucide-react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface ValueChainProps {
  /** Custom class name */
  className?: string;
}

/**
 * Value chain stage configuration
 */
export interface ValueChainStage {
  id: 'farm' | 'collection' | 'quality' | 'packaging' | 'export';
  icon: React.ReactNode;
  color: string;
  glowColor: string;
}

/**
 * Get the 5 stages of the value chain
 */
export function getValueChainStages(): ValueChainStage[] {
  return [
    {
      id: 'farm',
      icon: <FarmIcon />,
      color: '#4ade80', // green
      glowColor: 'rgba(74, 222, 128, 0.4)',
    },
    {
      id: 'collection',
      icon: <CollectionIcon />,
      color: '#fbbf24', // amber
      glowColor: 'rgba(251, 191, 36, 0.4)',
    },
    {
      id: 'quality',
      icon: <QualityIcon />,
      color: '#60a5fa', // blue
      glowColor: 'rgba(96, 165, 250, 0.4)',
    },
    {
      id: 'packaging',
      icon: <PackagingIcon />,
      color: '#a78bfa', // purple
      glowColor: 'rgba(167, 139, 250, 0.4)',
    },
    {
      id: 'export',
      icon: <ExportIcon />,
      color: '#d4a853', // gold
      glowColor: 'rgba(212, 168, 83, 0.4)',
    },
  ];
}

/**
 * Value Chain Section with scroll-triggered animations
 */
export function ValueChain({ className = '' }: ValueChainProps) {
  const t = useTranslations('valueChain');
  const sectionRef = useRef<HTMLElement>(null);
  const stagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const connectorsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [activeStage, setActiveStage] = useState<number>(-1);

  const stages = getValueChainStages();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const section = sectionRef.current;
    if (!section) return;

    // Create scroll trigger for the entire section
    const ctx = gsap.context(() => {
      // Main timeline for the section
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
      });

      // Animate each stage sequentially
      stagesRef.current.forEach((stage, index) => {
        if (!stage) return;

        // Stage card animation
        tl.fromTo(
          stage,
          {
            opacity: 0,
            y: 50,
            scale: 0.9,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: 'power2.out',
            onStart: () => setActiveStage(index),
          },
          index * 0.3
        );

        // Connector line animation (except for last stage)
        if (index < connectorsRef.current.length && connectorsRef.current[index]) {
          tl.fromTo(
            connectorsRef.current[index],
            {
              scaleX: 0,
              opacity: 0,
            },
            {
              scaleX: 1,
              opacity: 1,
              duration: 0.4,
              ease: 'power2.inOut',
            },
            index * 0.3 + 0.3
          );
        }
      });

      // Individual stage hover effects
      stagesRef.current.forEach((stage, index) => {
        if (!stage) return;

        const stageConfig = stages[index];
        
        stage.addEventListener('mouseenter', () => {
          gsap.to(stage, {
            scale: 1.05,
            boxShadow: `0 0 30px ${stageConfig.glowColor}, 0 0 60px ${stageConfig.glowColor}`,
            duration: 0.3,
            ease: 'power2.out',
          });
        });

        stage.addEventListener('mouseleave', () => {
          gsap.to(stage, {
            scale: 1,
            boxShadow: `0 0 20px ${stageConfig.glowColor}`,
            duration: 0.3,
            ease: 'power2.out',
          });
        });
      });
    }, section);

    return () => ctx.revert();
  }, [stages]);

  return (
    <section
      ref={sectionRef}
      className={`relative py-20 lg:py-32 overflow-hidden ${className}`}
      aria-label={t('title')}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background-secondary to-background" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-gradient-gold">
            {t('title')}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-foreground-muted">
            {t('subtitle')}
          </p>
        </div>

        {/* Value chain stages */}
        <div className="relative">
          {/* Desktop layout - horizontal */}
          <div className="hidden lg:flex lg:items-center lg:justify-between">
            {stages.map((stage, index) => (
              <div key={stage.id} className="flex items-center">
                {/* Stage card */}
                <div
                  ref={(el) => { stagesRef.current[index] = el; }}
                  className="value-chain-stage relative flex flex-col items-center p-6 rounded-xl border border-border bg-background-secondary/80 backdrop-blur-sm transition-all duration-300"
                  style={{
                    boxShadow: `0 0 20px ${stage.glowColor}`,
                  }}
                  data-stage={stage.id}
                  data-stage-index={index}
                >
                  {/* Icon with glow */}
                  <div
                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: `${stage.color}20`,
                      boxShadow: `0 0 20px ${stage.glowColor}`,
                    }}
                  >
                    <div style={{ color: stage.color }}>{stage.icon}</div>
                  </div>

                  {/* Stage number */}
                  <div
                    className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                    style={{
                      backgroundColor: stage.color,
                      color: '#0a0a0f',
                    }}
                  >
                    {index + 1}
                  </div>

                  {/* Title */}
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {t(`stages.${stage.id}.title`)}
                  </h3>

                  {/* Description */}
                  <p className="text-center text-sm text-foreground-muted max-w-[180px]">
                    {t(`stages.${stage.id}.description`)}
                  </p>

                  {/* Active indicator */}
                  {activeStage >= index && (
                    <div
                      className="absolute -bottom-2 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                  )}
                </div>

                {/* Connector line (except for last stage) */}
                {index < stages.length - 1 && (
                  <div
                    ref={(el) => { connectorsRef.current[index] = el; }}
                    className="value-chain-connector mx-4 h-0.5 w-16 xl:w-24 origin-left"
                    style={{
                      background: `linear-gradient(90deg, ${stage.color}, ${stages[index + 1].color})`,
                    }}
                    data-connector-index={index}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Mobile/Tablet layout - vertical */}
          <div className="lg:hidden space-y-8">
            {stages.map((stage, index) => (
              <div key={stage.id} className="relative">
                {/* Stage card */}
                <div
                  ref={(el) => { 
                    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                      stagesRef.current[index] = el;
                    }
                  }}
                  className="value-chain-stage relative flex items-start gap-4 p-4 sm:p-6 rounded-xl border border-border bg-background-secondary/80 backdrop-blur-sm"
                  style={{
                    boxShadow: `0 0 20px ${stage.glowColor}`,
                  }}
                  data-stage={stage.id}
                  data-stage-index={index}
                >
                  {/* Icon with glow */}
                  <div
                    className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: `${stage.color}20`,
                      boxShadow: `0 0 20px ${stage.glowColor}`,
                    }}
                  >
                    <div style={{ color: stage.color }}>{stage.icon}</div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    {/* Stage number badge */}
                    <span
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold mb-2"
                      style={{
                        backgroundColor: stage.color,
                        color: '#0a0a0f',
                      }}
                    >
                      {index + 1}
                    </span>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-foreground">
                      {t(`stages.${stage.id}.title`)}
                    </h3>

                    {/* Description */}
                    <p className="mt-1 text-sm text-foreground-muted">
                      {t(`stages.${stage.id}.description`)}
                    </p>
                  </div>
                </div>

                {/* Vertical connector (except for last stage) */}
                {index < stages.length - 1 && (
                  <div
                    ref={(el) => {
                      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                        connectorsRef.current[index] = el;
                      }
                    }}
                    className="value-chain-connector absolute left-7 top-full h-8 w-0.5 origin-top"
                    style={{
                      background: `linear-gradient(180deg, ${stage.color}, ${stages[index + 1].color})`,
                    }}
                    data-connector-index={index}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <p className="text-lg text-foreground-muted mb-6">{t('cta.title')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/produits">
              <Button variant="outline" size="lg">
                <ArrowRight className="w-4 h-4 mr-2" />
                {t('cta.process')}
              </Button>
            </Link>
            <Link href="/devis">
              <Button variant="outline" size="lg">
                <FileText className="w-4 h-4 mr-2" />
                {t('cta.docs')}
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="primary" size="lg">
                <Phone className="w-4 h-4 mr-2" />
                {t('cta.contact')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Farm icon - represents agricultural production
 */
function FarmIcon() {
  return (
    <svg
      className="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
      />
      <circle cx="12" cy="12" r="4" strokeWidth={1.5} />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 16v5m-2-3l2 3 2-3"
      />
    </svg>
  );
}

/**
 * Collection icon - represents gathering/network
 */
function CollectionIcon() {
  return (
    <svg
      className="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 11v4m-2-2h4"
      />
    </svg>
  );
}

/**
 * Quality icon - represents quality control/scanning
 */
function QualityIcon() {
  return (
    <svg
      className="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}

/**
 * Packaging icon - represents preparation and conditioning
 */
function PackagingIcon() {
  return (
    <svg
      className="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
}

/**
 * Export icon - represents global shipping/logistics
 */
function ExportIcon() {
  return (
    <svg
      className="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export default ValueChain;
