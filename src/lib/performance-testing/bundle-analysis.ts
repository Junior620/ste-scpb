/**
 * Bundle Analysis Helper Functions
 * 
 * Utilities for analyzing Next.js bundle statistics, calculating gzipped sizes,
 * and identifying largest chunks.
 * 
 * Requirements: 6.5, 11.5
 */

import { readFileSync, statSync, readdirSync } from 'fs';
import { join } from 'path';
import { gzipSync } from 'zlib';

/**
 * Bundle statistics for a single chunk
 */
export interface BundleChunkStats {
  name: string;
  path: string;
  size: number; // bytes
  gzipSize: number; // bytes
  type: 'js' | 'css' | 'other';
}

/**
 * Complete bundle statistics
 */
export interface BundleStats {
  totalSize: number; // bytes
  totalGzipSize: number; // bytes
  jsSize: number;
  jsGzipSize: number;
  cssSize: number;
  cssGzipSize: number;
  chunks: BundleChunkStats[];
  largestChunks: BundleChunkStats[];
  initialBundleSize: number; // gzipped size of initial bundle
}

/**
 * Get bundle statistics from Next.js build output
 * 
 * Reads the .next directory and analyzes all static chunks
 * 
 * @param buildDir - Path to the .next build directory (default: '.next')
 * @returns Bundle statistics including sizes and chunk information
 */
export function getBundleStats(buildDir: string = '.next'): BundleStats {
  const staticDir = join(process.cwd(), buildDir, 'static');
  
  const chunks: BundleChunkStats[] = [];
  
  // Scan for chunks in static directory
  try {
    const chunksDir = join(staticDir, 'chunks');
    if (readdirSync(chunksDir)) {
      scanDirectory(chunksDir, chunks);
    }
  } catch (error) {
    // Directory might not exist in test environment
  }
  
  // Calculate totals
  const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
  const totalGzipSize = chunks.reduce((sum, chunk) => sum + chunk.gzipSize, 0);
  
  const jsChunks = chunks.filter(c => c.type === 'js');
  const cssChunks = chunks.filter(c => c.type === 'css');
  
  const jsSize = jsChunks.reduce((sum, chunk) => sum + chunk.size, 0);
  const jsGzipSize = jsChunks.reduce((sum, chunk) => sum + chunk.gzipSize, 0);
  const cssSize = cssChunks.reduce((sum, chunk) => sum + chunk.size, 0);
  const cssGzipSize = cssChunks.reduce((sum, chunk) => sum + chunk.gzipSize, 0);
  
  // Find largest chunks (top 10)
  const largestChunks = [...chunks]
    .sort((a, b) => b.gzipSize - a.gzipSize)
    .slice(0, 10);
  
  // Calculate initial bundle size (main chunks)
  const initialChunks = chunks.filter(chunk => 
    chunk.name.includes('main') || 
    chunk.name.includes('webpack') ||
    chunk.name.includes('framework')
  );
  const initialBundleSize = initialChunks.reduce((sum, chunk) => sum + chunk.gzipSize, 0);
  
  return {
    totalSize,
    totalGzipSize,
    jsSize,
    jsGzipSize,
    cssSize,
    cssGzipSize,
    chunks,
    largestChunks,
    initialBundleSize,
  };
}

/**
 * Recursively scan directory for bundle chunks
 */
function scanDirectory(dir: string, chunks: BundleChunkStats[]): void {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath, chunks);
      } else if (entry.isFile()) {
        const ext = entry.name.split('.').pop();
        if (ext === 'js' || ext === 'css') {
          const stats = getChunkStats(fullPath, entry.name);
          chunks.push(stats);
        }
      }
    }
  } catch (error) {
    // Ignore errors for missing directories
  }
}

/**
 * Get statistics for a single chunk file
 */
function getChunkStats(path: string, name: string): BundleChunkStats {
  const content = readFileSync(path);
  const size = statSync(path).size;
  const gzipSize = calculateGzipSize(content);
  
  const ext = name.split('.').pop();
  const type = ext === 'js' ? 'js' : ext === 'css' ? 'css' : 'other';
  
  return {
    name,
    path,
    size,
    gzipSize,
    type,
  };
}

/**
 * Calculate gzipped size of content
 * 
 * @param content - File content as Buffer or string
 * @returns Gzipped size in bytes
 */
export function calculateGzipSize(content: Buffer | string): number {
  const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
  const compressed = gzipSync(buffer, { level: 9 });
  return compressed.length;
}

/**
 * Identify largest chunks in the bundle
 * 
 * @param chunks - Array of bundle chunks
 * @param limit - Number of chunks to return (default: 10)
 * @returns Array of largest chunks sorted by gzipped size
 */
export function identifyLargestChunks(
  chunks: BundleChunkStats[],
  limit: number = 10
): BundleChunkStats[] {
  return [...chunks]
    .sort((a, b) => b.gzipSize - a.gzipSize)
    .slice(0, limit);
}

/**
 * Format bytes to human-readable string
 * 
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "123.45 KB")
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Check if bundle size is within budget
 * 
 * @param stats - Bundle statistics
 * @param budgets - Size budgets in bytes
 * @returns Object indicating which budgets are exceeded
 */
export function checkBundleBudgets(
  stats: BundleStats,
  budgets: {
    maxJsSize?: number;
    maxCssSize?: number;
    maxTotalSize?: number;
    maxInitialBundle?: number;
  }
): {
  withinBudget: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  
  if (budgets.maxJsSize && stats.jsGzipSize > budgets.maxJsSize) {
    violations.push(
      `JS size ${formatBytes(stats.jsGzipSize)} exceeds budget ${formatBytes(budgets.maxJsSize)}`
    );
  }
  
  if (budgets.maxCssSize && stats.cssGzipSize > budgets.maxCssSize) {
    violations.push(
      `CSS size ${formatBytes(stats.cssGzipSize)} exceeds budget ${formatBytes(budgets.maxCssSize)}`
    );
  }
  
  if (budgets.maxTotalSize && stats.totalGzipSize > budgets.maxTotalSize) {
    violations.push(
      `Total size ${formatBytes(stats.totalGzipSize)} exceeds budget ${formatBytes(budgets.maxTotalSize)}`
    );
  }
  
  if (budgets.maxInitialBundle && stats.initialBundleSize > budgets.maxInitialBundle) {
    violations.push(
      `Initial bundle ${formatBytes(stats.initialBundleSize)} exceeds budget ${formatBytes(budgets.maxInitialBundle)}`
    );
  }
  
  return {
    withinBudget: violations.length === 0,
    violations,
  };
}

/**
 * Generate bundle analysis report
 * 
 * @param stats - Bundle statistics
 * @returns Formatted report string
 */
export function generateBundleReport(stats: BundleStats): string {
  const lines: string[] = [];
  
  lines.push('=== Bundle Analysis Report ===\n');
  lines.push(`Total Size: ${formatBytes(stats.totalSize)} (${formatBytes(stats.totalGzipSize)} gzipped)`);
  lines.push(`JavaScript: ${formatBytes(stats.jsSize)} (${formatBytes(stats.jsGzipSize)} gzipped)`);
  lines.push(`CSS: ${formatBytes(stats.cssSize)} (${formatBytes(stats.cssGzipSize)} gzipped)`);
  lines.push(`Initial Bundle: ${formatBytes(stats.initialBundleSize)} gzipped`);
  lines.push(`\nTotal Chunks: ${stats.chunks.length}`);
  
  lines.push('\n=== Largest Chunks ===');
  stats.largestChunks.forEach((chunk, index) => {
    lines.push(
      `${index + 1}. ${chunk.name} - ${formatBytes(chunk.gzipSize)} gzipped (${chunk.type})`
    );
  });
  
  return lines.join('\n');
}
