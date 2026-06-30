"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Components = {
  h2: ({ children }) => (
    <h2 className="mb-3 mt-6 font-display text-lg font-bold tracking-tight text-ink first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-5 font-display text-base font-bold tracking-tight text-ink first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-2 mt-4 text-sm font-semibold text-ink">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="mb-3 text-sm leading-relaxed text-[#33433A] last:mb-0">{children}</p>
  ),
  hr: () => <hr className="my-5 border-0 border-t border-line/80" />,
  ul: ({ children }) => (
    <ul className="mb-3 ml-1 space-y-1.5 text-sm leading-relaxed text-[#33433A]">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 ml-1 list-decimal space-y-1.5 pl-4 text-sm leading-relaxed text-[#33433A]">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  em: ({ children }) => <em className="text-[#54635A]">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="font-semibold text-amber-deep underline decoration-amber-deep/30 underline-offset-2 hover:decoration-amber-deep"
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-2 border-amber/60 pl-4 text-sm italic text-[#54635A]">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-paper-2 px-1.5 py-0.5 font-mono text-[12px] text-ink">
      {children}
    </code>
  ),
};

export function PlannerMarkdown({ content }: { content: string }) {
  if (!content.trim()) return null;

  return (
    <div className="planner-markdown max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
