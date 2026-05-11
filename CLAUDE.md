# CLAUDE.md

Personal technical blog built on AstroPaper, deployed to GitHub Pages at the root of `leeleon2000.github.io`.

## Stack

- Astro 6.3 (static output) with the AstroPaper template
- Tailwind v4 via `@tailwindcss/vite`
- Shiki for code highlighting (with `@shikijs/transformers`)
- `rehype-mermaid` (server-side, `strategy: "inline-svg"`) for Mermaid diagrams — renders SVGs at build time through Playwright
- Pagefind for client-side search

## Commands

| Command | Notes |
|---|---|
| `npm run dev` | Dev server, default port 4321. If Vite re-optimizes deps mid-load you may see a one-time 504; hard-refresh. |
| `npm run build` | `astro check` → `astro build` → builds Pagefind index → copies into `public/pagefind`. |
| `npm run preview` | Serves the production build locally. |
| `npm run sync` | Regenerates content-collection types after schema changes. |
| `npm run format` / `format:check` | Prettier. |
| `npm run lint` | ESLint. |

## Authoring blog posts

Posts live under `src/data/blog/**/*.md`. The content collection uses the glob pattern `**/[^_]*.md` (see `src/content.config.ts`), so any file or directory whose name starts with `_` is silently excluded from the build — use that for drafts you want to keep locally without polluting the published site. Filenames are slugified into post URLs unless `slug:` is set in frontmatter.

Required frontmatter (validated by Zod):

```yaml
---
title: "The title"
description: "One-paragraph summary used for SEO + cards."
pubDatetime: 2026-05-11T00:00:00Z
---
```

Optional fields worth knowing: `modDatetime`, `featured`, `draft`, `tags` (defaults to `["others"]`), `ogImage` (relative image path or absolute URL — defaults to an auto-generated OG card), `canonicalURL` (use this when cross-posting to dev.to), `hideEditPost`, `timezone`. A `draft: true` post is filtered out of every listing and route by `!data.draft` checks in `src/pages/posts/[...slug]/index.astro` and friends.

## Mermaid pipeline — non-obvious bits

Three workarounds live in `astro.config.ts` + `src/styles/global.css`. Don't remove them without re-checking what they fix.

**Shiki exclusion.** `markdown.syntaxHighlight.excludeLangs: ["mermaid"]` keeps Shiki from highlighting the fenced ```mermaid block before `rehype-mermaid` can transform it. Without this, the diagram is left as a Shiki-styled code block instead of an SVG.

**`<br>` doubling fix.** `rehypeFixMermaidBr` (a tiny inline plugin in `astro.config.ts`) replaces every `<br>` HAST element with a `\n` text node. Mermaid emits `<br/>` inside the SVG's `<foreignObject>`, but `hast-util-to-html` serializes that as `<br></br>` in the SVG namespace, and HTML5 parsers re-interpret `</br>` as another opening `<br>`. The result was every line break being doubled, which pushed labels past the foreignObject's measured height. The CSS counterpart is `white-space: pre-line` on `foreignObject > div` so the `\n` renders as a visible break.

**Font pinning.** `foreignObject` text in `global.css` is pinned to `arial, sans-serif` 16px line-height 1.5 with zeroed `<p>` margins — this matches what mermaid measures with at Playwright render time, so the fixed-width foreignObjects fit their text instead of clipping mid-word.

**Mermaid 11 cross-subgraph "Copy" phantom.** Client-side mermaid 11.x creates a visible `R1Copy`-style phantom node when an edge targets a node inside a subgraph from outside. Server-side via `rehype-mermaid`/`mermaid-isomorphic` does not have this bug — which is the main reason this site uses the server-side approach instead of `astro-mermaid` or similar client-rendered integrations. Don't switch to client-side rendering unless this is fixed upstream.

**Dark-mode SVG re-skin.** Mermaid's neutral theme bakes `#333` text and `#eee` boxes into its inline `<style>` blocks, which look fine on a light page but disappear on the site's dark navy `--background`. `global.css` has explicit `html[data-theme="dark"]` overrides for:
- Flowchart classes: `.node`, `.cluster`, `.flowchart-link`, `.edgePath .path`, `.marker`, `.arrowheadPath`.
- Sequence-diagram classes: `.messageText`, `.loopText`, `.labelText`, `text.actor`, `.actor`, `.labelBox`, `.activation0/1/2`, lifelines, message lines.
- Sequence-diagram arrow-head markers: `marker[id$="-arrowhead"]` etc. — these are unclassed `<path>`s inside named `<marker>`s, so the generic `.arrowheadPath`/`.marker` selectors don't reach them.

**Sequence autonumber + multi-line messages.** Mermaid places the autonumber badge circle assuming single-line messages; a `<br/>` in a self-message overlaps the badge with the second text line. `global.css` translates `path.messageLine0`, `path.messageLine1`, `text.sequenceNumber`, and `line[marker-start*="sequencenumber"]` down by 18px to open a gap. Cross-actor `<line>` arrows are unaffected because the selector targets `<path>`s only.

## Private content

`context.md` at the repo root contains employer-related red lines, personal bios, and the launch distribution strategy. **It is gitignored. Never commit it, paste from it into committed files, embed it in published posts, or include any of its specifics in OG-image text or about-page copy.** A future Claude session running locally can and should read it for project context — that's why it stays in the working tree rather than being moved out of the repo.

## Deployment

This repo is the `<username>.github.io` user-pages repo, so the production site is `https://leeleon2000.github.io/`. Build output is `dist/`. `public/pagefind/` is regenerated by `npm run build` from `dist/pagefind/` and is gitignored — don't commit it.
