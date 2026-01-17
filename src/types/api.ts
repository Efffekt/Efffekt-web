/**
 * Type definitions for the website analyzer API
 * Provides type safety for API responses
 */

/**
 * Severity levels for analysis details
 */
export type Severity = 'critical' | 'warning' | 'info';

/**
 * Status colors based on score
 */
export type StatusColor = 'green' | 'yellow' | 'orange' | 'red';

/**
 * Individual analysis detail item
 */
export interface AnalysisDetail {
  /** Severity of the issue (for problems) */
  severity?: Severity;
  /** Type of the detail (for successes) */
  type?: 'success';
  /** Human-readable message describing the finding */
  message: string;
}

/**
 * Result for a single analysis category
 */
export interface CategoryResult {
  /** Score from 0-100 */
  score: number;
  /** Color status based on score */
  status: StatusColor;
  /** List of findings for this category */
  details: AnalysisDetail[];
  /** Norwegian industry benchmark for comparison */
  benchmark: number;
}

/**
 * All analysis categories
 */
export interface AnalysisCategories {
  performance: CategoryResult;
  seo: CategoryResult;
  security: CategoryResult;
  mobile: CategoryResult;
  accessibility: CategoryResult;
}

/**
 * Category keys
 */
export type CategoryKey = keyof AnalysisCategories;

/**
 * Industry benchmarks
 */
export interface Benchmarks {
  performance: number;
  seo: number;
  security: number;
  mobile: number;
  accessibility: number;
}

/**
 * Successful analysis result
 */
export interface AnalysisResult {
  /** Analyzed URL */
  url: string;
  /** ISO timestamp of analysis */
  analyzedAt: string;
  /** Server response time in milliseconds */
  responseTime: number;
  /** Weighted total score (0-100) */
  totalScore: number;
  /** Industry benchmark values */
  benchmarks: Benchmarks;
  /** Results per category */
  categories: AnalysisCategories;
}

/**
 * Error response from API
 */
export interface AnalysisError {
  /** Error message */
  error: string;
}

/**
 * Union type for API response
 */
export type AnalysisResponse = AnalysisResult | AnalysisError;

/**
 * Type guard to check if response is an error
 */
export function isAnalysisError(response: AnalysisResponse): response is AnalysisError {
  return 'error' in response && typeof response.error === 'string';
}

/**
 * Type guard to check if response is a valid result
 */
export function isAnalysisResult(response: AnalysisResponse): response is AnalysisResult {
  return 'totalScore' in response && 'categories' in response;
}

/**
 * Validate that a response matches the expected structure
 * @param data Unknown data from API
 * @returns True if data matches AnalysisResult structure
 */
export function validateAnalysisResult(data: unknown): data is AnalysisResult {
  if (typeof data !== 'object' || data === null) return false;

  const result = data as Record<string, unknown>;

  // Check required fields
  if (typeof result.url !== 'string') return false;
  if (typeof result.totalScore !== 'number') return false;
  if (typeof result.categories !== 'object' || result.categories === null) return false;

  const categories = result.categories as Record<string, unknown>;
  const requiredCategories: CategoryKey[] = ['performance', 'seo', 'security', 'mobile', 'accessibility'];

  for (const cat of requiredCategories) {
    if (typeof categories[cat] !== 'object' || categories[cat] === null) return false;

    const category = categories[cat] as Record<string, unknown>;
    if (typeof category.score !== 'number') return false;
    if (!Array.isArray(category.details)) return false;
  }

  return true;
}

/**
 * Quick win item generated from analysis
 */
export interface QuickWin {
  /** Category the issue belongs to */
  category: CategoryKey;
  /** Issue message */
  message: string;
  /** Issue severity */
  severity: Severity;
  /** Estimated fix time */
  fixTime: string;
  /** Impact level */
  impact: 'Høy' | 'Medium' | 'Lav';
}

/**
 * Get color class based on score
 */
export function getScoreColorClass(score: number): StatusColor {
  if (score >= 90) return 'green';
  if (score >= 70) return 'yellow';
  if (score >= 50) return 'orange';
  return 'red';
}

/**
 * Category labels in Norwegian
 */
export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  performance: 'Hastighet',
  seo: 'SEO',
  security: 'Sikkerhet',
  mobile: 'Mobilvennlig',
  accessibility: 'Tilgjengelighet'
} as const;

/**
 * Category descriptions in Norwegian
 */
export const CATEGORY_DESCRIPTIONS: Record<CategoryKey, string> = {
  performance: 'Hvor raskt siden laster',
  seo: 'Synlighet i Google-søk',
  security: 'Beskyttelse mot angrep',
  mobile: 'Fungerer på telefon/nettbrett',
  accessibility: 'Brukervennlig for alle'
} as const;
