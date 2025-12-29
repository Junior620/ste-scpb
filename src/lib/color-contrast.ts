/**
 * Color Contrast Utilities
 * WCAG 2.1 AA compliance helpers
 * **Validates: Requirements 13.3**
 */

/**
 * Parses a hex color string to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  const cleanHex = hex.replace(/^#/, '');
  
  // Handle 3-digit hex
  const fullHex = cleanHex.length === 3
    ? cleanHex.split('').map(c => c + c).join('')
    : cleanHex;
  
  if (fullHex.length !== 6) {
    return null;
  }
  
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculates the relative luminance of a color
 * Based on WCAG 2.1 formula
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const sRGB = c / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates the contrast ratio between two colors
 * Returns a value between 1 and 21
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) {
    throw new Error('Invalid hex color format');
  }
  
  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * WCAG 2.1 AA minimum contrast ratios
 */
export const WCAG_AA_NORMAL_TEXT = 4.5;
export const WCAG_AA_LARGE_TEXT = 3.0;
export const WCAG_AA_UI_COMPONENTS = 3.0;

/**
 * WCAG 2.1 AAA minimum contrast ratios
 */
export const WCAG_AAA_NORMAL_TEXT = 7.0;
export const WCAG_AAA_LARGE_TEXT = 4.5;

/**
 * Checks if a color combination meets WCAG AA for normal text
 */
export function meetsWcagAA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= WCAG_AA_NORMAL_TEXT;
}

/**
 * Checks if a color combination meets WCAG AA for large text (18pt+ or 14pt bold)
 */
export function meetsWcagAALargeText(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= WCAG_AA_LARGE_TEXT;
}

/**
 * Checks if a color combination meets WCAG AAA for normal text
 */
export function meetsWcagAAA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= WCAG_AAA_NORMAL_TEXT;
}

/**
 * Design system color palette for testing
 */
export const DESIGN_COLORS = {
  background: '#0a0a0f',
  backgroundSecondary: '#12121a',
  backgroundTertiary: '#1a1a25',
  foreground: '#f0f0f5',
  foregroundMuted: '#b8b8c8',
  primary: '#d4a853',
  primaryLight: '#e8c77a',
  primaryDark: '#b08a3a',
  primaryForeground: '#0a0a0f',
  secondary: '#3a5a9a',
  secondaryLight: '#4a7ac0',
  secondaryDark: '#2a4a7a',
  secondaryForeground: '#f0f0f5',
  accent: '#7a9aff',
  accentLight: '#9ab8ff',
  accentDark: '#5a7aef',
  success: '#4ade80',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#60a5fa',
} as const;

/**
 * Common text/background combinations that must meet WCAG AA
 */
export const REQUIRED_CONTRAST_PAIRS: Array<{
  name: string;
  foreground: keyof typeof DESIGN_COLORS;
  background: keyof typeof DESIGN_COLORS;
  isLargeText?: boolean;
}> = [
  { name: 'Body text on background', foreground: 'foreground', background: 'background' },
  { name: 'Muted text on background', foreground: 'foregroundMuted', background: 'background' },
  { name: 'Primary text on background', foreground: 'primary', background: 'background', isLargeText: true },
  { name: 'Accent text on background', foreground: 'accent', background: 'background' },
  { name: 'Primary button text', foreground: 'primaryForeground', background: 'primary' },
  { name: 'Secondary button text', foreground: 'secondaryForeground', background: 'secondary' },
  { name: 'Success text on background', foreground: 'success', background: 'background' },
  { name: 'Warning text on background', foreground: 'warning', background: 'background' },
  { name: 'Error text on background', foreground: 'error', background: 'background' },
  { name: 'Info text on background', foreground: 'info', background: 'background' },
  { name: 'Body text on secondary bg', foreground: 'foreground', background: 'backgroundSecondary' },
  { name: 'Muted text on secondary bg', foreground: 'foregroundMuted', background: 'backgroundSecondary' },
  { name: 'Body text on tertiary bg', foreground: 'foreground', background: 'backgroundTertiary' },
];
