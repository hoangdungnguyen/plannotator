/**
 * Markdown renderer for AI chat responses in the review sidebar.
 *
 * Distinct from the plan editor's markdown rendering (packages/ui) which
 * parses into Block objects for annotation. This is a simpler HTML pipeline
 * for streaming chat messages: marked → DOMPurify → dangerouslySetInnerHTML.
 */
import type React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { renderInlineMath, renderBlockMath, extractMath } from './renderMath';

/**
 * Pre-processes text to protect math delimiters from markdown parsing.
 * Returns placeholder markers that will be replaced with rendered math after sanitization.
 */
function preprocessMath(text: string): { processed: string; mathBlocks: Map<string, string> } {
  const mathBlocks = new Map<string, string>();
  let processed = text;
  let counter = 0;

  // Process block math first ($$...$$)
  processed = processed.replace(/\$\$([\s\S]+?)\$\$/g, (_match, math) => {
    const placeholder = `MATHBLOCK${counter}`;
    mathBlocks.set(placeholder, renderBlockMath(math));
    counter++;
    return placeholder;
  });

  // Process inline math ($...$)
  processed = processed.replace(/\$([^\$\n]+?)\$/g, (_match, math) => {
    const placeholder = `MATHINLINE${counter}`;
    mathBlocks.set(placeholder, renderInlineMath(math));
    counter++;
    return placeholder;
  });

  return { processed, mathBlocks };
}

/**
 * Post-processes sanitized HTML to restore rendered math.
 */
function postprocessMath(html: string, mathBlocks: Map<string, string>): string {
  let result = html;
  for (const [placeholder, rendered] of mathBlocks) {
    result = result.replace(new RegExp(placeholder, 'g'), rendered);
  }
  return result;
}

export function renderChatMarkdown(text: string): React.ReactNode {
  // Pre-process math expressions to protect them from marked
  const { processed, mathBlocks } = preprocessMath(text);

  const html = marked.parse(processed, { async: false, breaks: true }) as string;

  // DOMPurify sanitization - allow math-related tags
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'code', 'pre', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'a', 'blockquote',
      'span', 'div',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOWED_CLASSES: {
      'span': ['math-inline', 'math-error', 'katex'],
      'div': ['math-block', 'katex'],
    },
  });

  // Restore rendered math
  const withMath = postprocessMath(clean, mathBlocks);

  return (
    <div
      className="ai-markdown"
      dangerouslySetInnerHTML={{ __html: withMath }}
    />
  );
}