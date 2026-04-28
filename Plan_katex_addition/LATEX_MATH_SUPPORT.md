# Feature Concern: LaTeX Math Support in Review Editor

## Summary

Add KaTeX-based LaTeX math rendering to the plannotator review editor to support inline and block math expressions in review comments, AI chat responses, and annotation text.

## Problem Statement

Currently, when users write LaTeX math expressions (e.g., `$E = mc^2$` or `$$\int_0^1 x \, dx$$`) in review comments or AI chat responses, they appear as raw text instead of rendered equations. This is particularly limiting for:
- Academic/technical document reviews
- Code reviews involving mathematical content
- Documentation that includes formulas

## Solution

Integrate KaTeX (fast, lightweight math rendering library) into the review editor's rendering pipeline.

## Delimiters

| Type | Syntax | Example |
|------|--------|---------|
| Inline math | `$...$` | `$E = mc^2$` |
| Block math | `$$...$$` | `$$\int_0^1 x \, dx$$` |

## Files Modified

### Review Editor (code review comments & chat)

| File | Change |
|------|--------|
| `packages/review-editor/package.json` | Added `katex` dependency |
| `packages/review-editor/utils/renderMath.tsx` | **NEW** - KaTeX rendering utility |
| `packages/review-editor/utils/renderInlineMarkdown.tsx` | Added math detection |
| `packages/review-editor/utils/renderChatMarkdown.tsx` | Added math pre/post-processing |
| `packages/review-editor/index.css` | Added KaTeX styling |

### Plan Editor / Annotate (packages/ui - used by annotate mode)

| File | Change |
|------|--------|
| `packages/ui/package.json` | Added `katex` dependency |
| `packages/ui/utils/renderMath.ts` | **NEW** - KaTeX rendering utility |
| `packages/ui/components/InlineMarkdown.tsx` | Added math detection at start of parse loop |
| `packages/ui/theme.css` | Added KaTeX styling |

## Technical Details

### `renderMath.tsx/.ts` - New Utility (shared by both editors)
- `renderMath(latex, options)` - Core rendering with error handling
- `renderInlineMath(latex)` - For `$...$` patterns
- `renderBlockMath(latex)` - For `$$...$$` patterns
- `extractMath(text)` - Regex-based delimiter detection
- `escapeHtml()` - XSS protection for error display

### `packages/review-editor` - Code Review Rendering
- `renderInlineMarkdown.tsx`: `renderInlineWithMath()` - Processes math before inline markdown; code blocks (```) are protected
- `renderChatMarkdown.tsx`: `preprocessMath()` / `postprocessMath()` - Protect math from marked parsing via placeholders; DOMPurify ALLOWED_TAGS includes `span` and `div`

### `packages/ui` - Plan Editor / Annotate Rendering
- `InlineMarkdown.tsx`: Math detection at the START of the parse loop (before all other patterns); recursively renders text before math via recursive `InlineMarkdown` call; block math (`$$`) uses `<div>`, inline math (`$`) uses `<span>`

### CSS Styling
- `.katex`, `.katex-display` - Base KaTeX styling
- `.math-inline` - Inline math container
- `.math-block` - Block math container
- `.math-error` - Error display for invalid LaTeX
- Theme-aware (light/dark mode)
- Reduced-motion support

## Security

KaTeX is **sandboxed** - it renders math only, no HTML/JS execution. Error handling displays escaped plain text for invalid LaTeX rather than potentially dangerous content.

## Testing Checklist

- [ ] Inline math `$x^2$` renders in comments
- [ ] Block math `$$\int_0^1 x dx$$` renders in comments
- [ ] Math in AI chat responses renders
- [ ] Math inside code blocks (```) is NOT rendered
- [ ] Invalid LaTeX shows error gracefully (not crash)
- [ ] Light/dark theme compatibility
- [ ] No XSS vulnerabilities

## Future Enhancements

- Escaped delimiters (`\$` for literal dollar signs)
- Math in diff line comments
- LaTeX preview in annotation toolbar
- Support for `\begin{align}` environments

## Related

- Issue: [Link if exists]
- PR: [Link to PR]
- Commit: `8ea9e76` / `9c04a9d`

---

**Status:** Implemented & Merged to Fork (Extended to plan editor)
**Date:** 2026-04-26
**Updated:** 2026-04-26 - Extended to `packages/ui` for annotate mode