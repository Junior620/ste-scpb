/**
 * Unit tests for bundle analysis helper functions
 * 
 * Requirements: 6.5, 11.5
 */

import { describe, it, expect } from 'vitest';
import {
  calculateGzipSize,
  identifyLargestChunks,
  formatBytes,
  checkBundleBudgets,
  generateBundleReport,
  type BundleChunkStats,
  type BundleStats,
} from './bundle-analysis';

describe('Bundle Analysis Utilities', () => {
  describe('calculateGzipSize', () => {
    it('should calculate gzipped size for string content', () => {
      const content = 'Hello World! '.repeat(100);
      const gzipSize = calculateGzipSize(content);
      
      expect(gzipSize).toBeGreaterThan(0);
      expect(gzipSize).toBeLessThan(content.length);
    });
    
    it('should calculate gzipped size for buffer content', () => {
      const content = Buffer.from('Hello World! '.repeat(100));
      const gzipSize = calculateGzipSize(content);
      
      expect(gzipSize).toBeGreaterThan(0);
      expect(gzipSize).toBeLessThan(content.length);
    });
    
    it('should compress repetitive content more efficiently', () => {
      const repetitive = 'A'.repeat(1000);
      const random = Array.from({ length: 1000 }, () => 
        String.fromCharCode(65 + Math.floor(Math.random() * 26))
      ).join('');
      
      const repetitiveSize = calculateGzipSize(repetitive);
      const randomSize = calculateGzipSize(random);
      
      expect(repetitiveSize).toBeLessThan(randomSize);
    });
  });
  
  describe('identifyLargestChunks', () => {
    const mockChunks: BundleChunkStats[] = [
      { name: 'main.js', path: '/main.js', size: 100000, gzipSize: 30000, type: 'js' },
      { name: 'vendor.js', path: '/vendor.js', size: 200000, gzipSize: 60000, type: 'js' },
      { name: 'three.js', path: '/three.js', size: 500000, gzipSize: 150000, type: 'js' },
      { name: 'styles.css', path: '/styles.css', size: 50000, gzipSize: 10000, type: 'css' },
      { name: 'small.js', path: '/small.js', size: 5000, gzipSize: 1500, type: 'js' },
    ];
    
    it('should identify largest chunks by gzipped size', () => {
      const largest = identifyLargestChunks(mockChunks, 3);
      
      expect(largest).toHaveLength(3);
      expect(largest[0].name).toBe('three.js');
      expect(largest[1].name).toBe('vendor.js');
      expect(largest[2].name).toBe('main.js');
    });
    
    it('should respect the limit parameter', () => {
      const largest = identifyLargestChunks(mockChunks, 2);
      
      expect(largest).toHaveLength(2);
    });
    
    it('should return all chunks if limit exceeds array length', () => {
      const largest = identifyLargestChunks(mockChunks, 100);
      
      expect(largest).toHaveLength(mockChunks.length);
    });
    
    it('should not mutate original array', () => {
      const original = [...mockChunks];
      identifyLargestChunks(mockChunks, 3);
      
      expect(mockChunks).toEqual(original);
    });
  });
  
  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 B');
      expect(formatBytes(500)).toBe('500.00 B');
      expect(formatBytes(1024)).toBe('1.00 KB');
      expect(formatBytes(1536)).toBe('1.50 KB');
      expect(formatBytes(1048576)).toBe('1.00 MB');
      expect(formatBytes(1073741824)).toBe('1.00 GB');
    });
    
    it('should handle decimal values', () => {
      const result = formatBytes(1536);
      expect(result).toContain('1.50');
    });
  });
  
  describe('checkBundleBudgets', () => {
    const mockStats: BundleStats = {
      totalSize: 1000000,
      totalGzipSize: 300000,
      jsSize: 800000,
      jsGzipSize: 240000,
      cssSize: 200000,
      cssGzipSize: 60000,
      chunks: [],
      largestChunks: [],
      initialBundleSize: 180000,
    };
    
    it('should pass when all budgets are met', () => {
      const result = checkBundleBudgets(mockStats, {
        maxJsSize: 250000,
        maxCssSize: 70000,
        maxTotalSize: 350000,
        maxInitialBundle: 200000,
      });
      
      expect(result.withinBudget).toBe(true);
      expect(result.violations).toHaveLength(0);
    });
    
    it('should detect JS size budget violation', () => {
      const result = checkBundleBudgets(mockStats, {
        maxJsSize: 200000, // Less than actual 240000
      });
      
      expect(result.withinBudget).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0]).toContain('JS size');
    });
    
    it('should detect CSS size budget violation', () => {
      const result = checkBundleBudgets(mockStats, {
        maxCssSize: 50000, // Less than actual 60000
      });
      
      expect(result.withinBudget).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0]).toContain('CSS size');
    });
    
    it('should detect total size budget violation', () => {
      const result = checkBundleBudgets(mockStats, {
        maxTotalSize: 250000, // Less than actual 300000
      });
      
      expect(result.withinBudget).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0]).toContain('Total size');
    });
    
    it('should detect initial bundle budget violation', () => {
      const result = checkBundleBudgets(mockStats, {
        maxInitialBundle: 150000, // Less than actual 180000
      });
      
      expect(result.withinBudget).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0]).toContain('Initial bundle');
    });
    
    it('should detect multiple budget violations', () => {
      const result = checkBundleBudgets(mockStats, {
        maxJsSize: 200000,
        maxCssSize: 50000,
        maxTotalSize: 250000,
      });
      
      expect(result.withinBudget).toBe(false);
      expect(result.violations).toHaveLength(3);
    });
  });
  
  describe('generateBundleReport', () => {
    const mockStats: BundleStats = {
      totalSize: 1000000,
      totalGzipSize: 300000,
      jsSize: 800000,
      jsGzipSize: 240000,
      cssSize: 200000,
      cssGzipSize: 60000,
      chunks: [
        { name: 'main.js', path: '/main.js', size: 100000, gzipSize: 30000, type: 'js' },
        { name: 'vendor.js', path: '/vendor.js', size: 200000, gzipSize: 60000, type: 'js' },
      ],
      largestChunks: [
        { name: 'three.js', path: '/three.js', size: 500000, gzipSize: 150000, type: 'js' },
        { name: 'vendor.js', path: '/vendor.js', size: 200000, gzipSize: 60000, type: 'js' },
      ],
      initialBundleSize: 180000,
    };
    
    it('should generate a formatted report', () => {
      const report = generateBundleReport(mockStats);
      
      expect(report).toContain('Bundle Analysis Report');
      expect(report).toContain('Total Size');
      expect(report).toContain('JavaScript');
      expect(report).toContain('CSS');
      expect(report).toContain('Initial Bundle');
      expect(report).toContain('Largest Chunks');
    });
    
    it('should include chunk count', () => {
      const report = generateBundleReport(mockStats);
      
      expect(report).toContain('Total Chunks: 2');
    });
    
    it('should list largest chunks', () => {
      const report = generateBundleReport(mockStats);
      
      expect(report).toContain('three.js');
      expect(report).toContain('vendor.js');
    });
    
    it('should format sizes in human-readable format', () => {
      const report = generateBundleReport(mockStats);
      
      expect(report).toMatch(/\d+\.\d+ (KB|MB)/);
    });
  });
});
