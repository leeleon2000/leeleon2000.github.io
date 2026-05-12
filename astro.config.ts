import { defineConfig, envField, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import { SITE } from "./src/config";
import rehypeMermaid from "rehype-mermaid";
import { visit } from "unist-util-visit";

// Inside mermaid's SVG <foreignObject>, hast-util-to-html serializes every
// <br> as <br></br> because it's nested in the SVG namespace. HTML5 parsers
// treat </br> as another opening <br>, doubling the line breaks and pushing
// labels past mermaid's measured foreignObject height. Replace each <br>
// with a "\n" text node; CSS sets white-space: pre-line on the foreignObject
// content so the newline renders as a visible break.
function rehypeFixMermaidBr() {
  return (tree: any) => {
    visit(tree, "element", (node: any) => {
      if (!Array.isArray(node.children)) return;
      node.children = node.children.map((c: any) =>
        c?.type === "element" && c.tagName === "br"
          ? { type: "text", value: "\n" }
          : c
      );
    });
  };
}

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  integrations: [
    sitemap({
      filter: page => SITE.showArchives || !page.endsWith("/archives"),
    }),
  ],
  markdown: {
    syntaxHighlight: {
      type: "shiki",
      excludeLangs: ["mermaid"],
    },
    remarkPlugins: [remarkToc, [remarkCollapse, { test: "Table of contents" }]],
    shikiConfig: {
      // For more themes, visit https://shiki.style/themes
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
    rehypePlugins: [
      [
        rehypeMermaid,
        {
          strategy: "inline-svg",
          mermaidConfig: {
            theme: "neutral",
            flowchart: { useMaxWidth: true },
          },
        },
      ],
      rehypeFixMermaidBr,
    ],
  },
  vite: {
    // eslint-disable-next-line
    // @ts-ignore
    // This will be fixed in Astro 6 with Vite 7 support
    // See: https://github.com/withastro/astro/issues/14030
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  image: {
    responsiveStyles: true,
    layout: "constrained",
  },
  env: {
    schema: {
      PUBLIC_CF_ANALYTICS_TOKEN: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Google Sans Code",
      cssVariable: "--font-google-sans-code",
    },
  ],
});
