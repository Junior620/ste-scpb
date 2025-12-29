/**
 * Accessibility Utilities
 * WCAG 2.1 AA compliance helpers using axe-core
 * **Validates: Requirements 13.1**
 */

import type { AxeResults, Result } from 'axe-core';

/**
 * Severity levels for accessibility violations
 */
export type ViolationSeverity = 'critical' | 'serious' | 'moderate' | 'minor';

/**
 * Simplified violation report
 */
export interface AccessibilityViolation {
  id: string;
  impact: ViolationSeverity;
  description: string;
  help: string;
  helpUrl: string;
  nodes: number;
  wcagTags: string[];
}

/**
 * Accessibility audit result
 */
export interface AccessibilityAuditResult {
  passed: boolean;
  violations: AccessibilityViolation[];
  passes: number;
  incomplete: number;
  inapplicable: number;
}

/**
 * Transforms axe-core results into a simplified format
 */
export function transformAxeResults(results: AxeResults): AccessibilityAuditResult {
  const violations: AccessibilityViolation[] = results.violations.map((violation: Result) => ({
    id: violation.id,
    impact: (violation.impact || 'minor') as ViolationSeverity,
    description: violation.description,
    help: violation.help,
    helpUrl: violation.helpUrl,
    nodes: violation.nodes.length,
    wcagTags: violation.tags.filter((tag: string) => tag.startsWith('wcag')),
  }));

  // Consider audit passed if no critical or serious violations
  const hasCriticalOrSerious = violations.some(
    (v) => v.impact === 'critical' || v.impact === 'serious'
  );

  return {
    passed: !hasCriticalOrSerious,
    violations,
    passes: results.passes.length,
    incomplete: results.incomplete.length,
    inapplicable: results.inapplicable.length,
  };
}

/**
 * WCAG 2.1 AA rules that must pass
 */
export const WCAG_21_AA_RULES = [
  // Perceivable
  'image-alt',
  'input-image-alt',
  'area-alt',
  'object-alt',
  'video-caption',
  'audio-caption',
  'color-contrast',
  'meta-viewport',
  'orientation',
  'text-spacing',
  
  // Operable
  'keyboard',
  'no-keyboard-trap',
  'focus-visible',
  'focus-order-semantics',
  'bypass',
  'page-has-heading-one',
  'heading-order',
  'link-name',
  'button-name',
  'label',
  'frame-title',
  'target-size',
  
  // Understandable
  'html-has-lang',
  'html-lang-valid',
  'valid-lang',
  'label-title-only',
  'form-field-multiple-labels',
  'autocomplete-valid',
  
  // Robust
  'duplicate-id',
  'duplicate-id-active',
  'duplicate-id-aria',
  'aria-valid-attr',
  'aria-valid-attr-value',
  'aria-allowed-attr',
  'aria-required-attr',
  'aria-roles',
  'aria-hidden-body',
  'aria-hidden-focus',
];

/**
 * Common accessibility issues and their fixes
 */
export const ACCESSIBILITY_FIXES: Record<string, string> = {
  'image-alt': 'Add alt attribute to all <img> elements',
  'color-contrast': 'Ensure text has sufficient contrast ratio (4.5:1 for normal text, 3:1 for large text)',
  'keyboard': 'Ensure all interactive elements are keyboard accessible',
  'bypass': 'Add skip navigation link to bypass repetitive content',
  'page-has-heading-one': 'Add a single <h1> element to the page',
  'heading-order': 'Ensure heading levels increase by one (h1 → h2 → h3)',
  'link-name': 'Ensure all links have accessible names',
  'button-name': 'Ensure all buttons have accessible names',
  'label': 'Ensure all form inputs have associated labels',
  'html-has-lang': 'Add lang attribute to <html> element',
  'duplicate-id': 'Ensure all id attributes are unique',
  'aria-valid-attr': 'Use valid ARIA attributes',
  'aria-valid-attr-value': 'Use valid values for ARIA attributes',
  'focus-visible': 'Ensure focus indicators are visible',
};

/**
 * Checks if a violation is WCAG 2.1 AA related
 */
export function isWcag21AAViolation(violation: AccessibilityViolation): boolean {
  return violation.wcagTags.some(
    (tag) => tag.includes('wcag2a') || tag.includes('wcag21a')
  );
}

/**
 * Filters violations to only WCAG 2.1 AA level
 */
export function filterWcag21AAViolations(
  violations: AccessibilityViolation[]
): AccessibilityViolation[] {
  return violations.filter(isWcag21AAViolation);
}

/**
 * Gets the fix suggestion for a violation
 */
export function getFixSuggestion(violationId: string): string {
  return ACCESSIBILITY_FIXES[violationId] || 'Review the violation and fix according to WCAG guidelines';
}
