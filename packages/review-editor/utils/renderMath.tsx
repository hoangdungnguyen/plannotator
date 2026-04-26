/**
 * Renders LaTeX math expressions using KaTeX.
 *
 * KaTeX is sandboxed and safe - no additional sanitization needed.
 */
import katex from 'katex';
import 'katex/dist/katex.min.css';

export interface RenderMathOptions {
  displayMode: boolean;
  errorColor?: string;
}

/**
 * Renders LaTeX to HTML string.
 * Returns empty string on parse failure (does not throw).
 */
export function renderMath(latex: string, options: RenderMathOptions = { displayMode: false }): string {
  const { displayMode, errorColor = 'var(--destructive)' } = options;

  try {
    return katex.renderToString(latex.trim(), {
      displayMode,
      throwOnError: false,
      errorColor,
    });
  } catch {
    return `<span class="math-error" style="color: ${errorColor}; font-family: var(--font-mono); font-size: 0.85em;">${escapeHtml(latex)}</span>`;
  }
}

/**
 * Renders inline math ($...$).
 */
export function renderInlineMath(latex: string): string {
  return renderMath(latex, { displayMode: false });
}

/**
 * Renders block math ($$...$$).
 */
export function renderBlockMath(latex: string): string {
  return renderMath(latex, { displayMode: true });
}

/**
 * Detects and extracts math delimiters from text.
 * Returns { before, math, after } for the first match.
 */
export function extractMath(text: string): { before: string; math: string; after: string; isBlock: boolean } | null {
  // Block math: $$...$$
  const blockMatch = text.match(/\$\$(.+?)\$\$/s);
  if (blockMatch) {
    return {
      before: text.slice(0, blockMatch.index),
      math: blockMatch[1],
      after: text.slice(blockMatch.index! + blockMatch[0].length),
      isBlock: true,
    };
  }

  // Inline math: $...$ (not $$)
  const inlineMatch = text.match(/\$([^\$\n]+?)\$/);
  if (inlineMatch) {
    return {
      before: text.slice(0, inlineMatch.index),
      math: inlineMatch[1],
      after: text.slice(inlineMatch.index! + inlineMatch[0].length),
      isBlock: false,
    };
  }

  return null;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}