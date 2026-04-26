import React from 'react';
import { renderInlineMath, renderBlockMath, extractMath } from './renderMath';

/**
 * Renders simple inline markdown: `code`, **bold**, *italic*, _italic_,
 * fenced code blocks (```...```), and LaTeX math ($...$, $$...$$).
 */
export function renderInlineMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let key = 0;

  // Split by fenced code blocks first
  const parts = text.split(/(```[\s\S]*?```)/g);

  for (const part of parts) {
    if (part.startsWith('```') && part.endsWith('```')) {
      const inner = part.slice(3, -3);
      // Strip optional language identifier on first line
      const newlineIdx = inner.indexOf('\n');
      const code = newlineIdx >= 0 ? inner.slice(newlineIdx + 1) : inner;
      nodes.push(
        <pre key={key++} className="inline-code-block">
          <code>{code.trim()}</code>
        </pre>
      );
    } else {
      // Process inline markdown with math support
      nodes.push(...renderInlineWithMath(part, key));
      key++;
    }
  }

  return nodes;
}

/**
 * Renders inline text with math support.
 * Math delimiters are processed first, then inline markdown.
 */
function renderInlineWithMath(text: string, startKey: number): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let key = startKey;
  let remaining = text;

  while (remaining.length > 0) {
    // Try to extract math first
    const mathMatch = extractMath(remaining);

    if (!mathMatch) {
      // No more math, process rest as inline markdown
      if (remaining.length > 0) {
        nodes.push(...renderInline(remaining, key));
        key += countNodes(renderInline(remaining, key));
      }
      break;
    }

    // Text before math
    if (mathMatch.before.length > 0) {
      nodes.push(...renderInline(mathMatch.before, key));
      key += countNodes(renderInline(mathMatch.before, key));
    }

    // Math content
    if (mathMatch.isBlock) {
      nodes.push(
        <div
          key={key++}
          className="math-block"
          dangerouslySetInnerHTML={{ __html: renderBlockMath(mathMatch.math) }}
        />
      );
    } else {
      nodes.push(
        <span
          key={key++}
          className="math-inline"
          dangerouslySetInnerHTML={{ __html: renderInlineMath(mathMatch.math) }}
        />
      );
    }

    remaining = mathMatch.after;
  }

  return nodes;
}

function renderInline(text: string, startKey: number): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let key = startKey;

  // Match inline patterns: [text](url), `code`, **bold**, *italic*, _italic_, bare URLs
  const regex = /(\[([^\]]+)\]\((https?:\/\/[^)]+)\)|`[^`]+`|\*\*[^*]+\*\*|(?<!\w)_([^_\s](?:[\s\S]*?[^_\s])?)_(?!\w)|\*[^*]+\*|https?:\/\/[^\s<)\]]+)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (match[1] && match[2] && match[3]) {
      // Markdown link: [text](url)
      nodes.push(
        <a key={key++} href={match[3]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          {match[2]}
        </a>
      );
    } else if (token.startsWith('`')) {
      nodes.push(<code key={key++} className="inline-code">{token.slice(1, -1)}</code>);
    } else if (token.startsWith('**')) {
      nodes.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('_')) {
      const italicText = match[4];
      nodes.push(<em key={key++}>{italicText}</em>);
    } else if (token.startsWith('*')) {
      nodes.push(<em key={key++}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith('http')) {
      // Bare URL
      nodes.push(
        <a key={key++} href={token} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
          {token}
        </a>
      );
    }

    lastIndex = match.index + token.length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

/**
 * Counts the number of nodes produced by renderInline.
 * Used to increment key properly when chaining renders.
 */
function countNodes(nodes: React.ReactNode[]): number {
  return nodes.filter(n => typeof n === 'object' && n !== null).length;
}