import { use } from "react";

import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

let highlighter: Promise<HighlighterCore> | null = null;

const loadHighlighter = () =>
  (highlighter ??= createHighlighterCore({
    themes: [
      import("@shikijs/themes/vitesse-dark"),
      import("@shikijs/themes/vitesse-light"),
    ],
    langs: [
      import("@shikijs/langs/typescript"),
      import("@shikijs/langs/tsx"),
      import("@shikijs/langs/javascript"),
      import("@shikijs/langs/json"),
      import("@shikijs/langs/sql"),
      import("@shikijs/langs/shellscript"),
      import("@shikijs/langs/css"),
      import("@shikijs/langs/html"),
    ],
    engine: createJavaScriptRegexEngine(),
  }));

const MarkdownBody = ({ children }: { children: string }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[
      rehypeSanitize,
      [
        rehypeShikiFromHighlighter,
        use(loadHighlighter()),
        {
          themes: { light: "vitesse-light", dark: "vitesse-dark" },
          defaultColor: false,
        },
      ],
    ]}
  >
    {children}
  </ReactMarkdown>
);

export default MarkdownBody;
