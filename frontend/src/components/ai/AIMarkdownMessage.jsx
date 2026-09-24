import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import Prism from 'prismjs';

// Import essential Prism language modules
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/themes/prism-tomorrow.css';

import { Copy, Check, Terminal } from 'lucide-react';

/**
 * Custom CodeBlock with syntax highlighting and copy-to-clipboard functionality
 */
const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const cleanLang = (language || '').toLowerCase().replace(/^language-/, '');
  const grammar = Prism.languages[cleanLang] || Prism.languages.javascript || Prism.languages.markup;

  let highlighted = code;
  try {
    if (grammar) {
      highlighted = Prism.highlight(code, grammar, cleanLang || 'text');
    }
  } catch (e) {
    highlighted = code;
  }

  return (
    <div className="my-3 rounded-2xl overflow-hidden border border-slate-700/60 bg-[#1e1e2e] shadow-md text-left">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#181825] border-b border-slate-700/50 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5 font-mono font-medium text-slate-300">
          <Terminal className="w-3.5 h-3.5 text-purple-400" />
          <span>{cleanLang || 'code'}</span>
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-700/60 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span className="text-[10px]">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="p-3.5 overflow-x-auto text-xs font-mono leading-relaxed">
        <pre className="!bg-transparent !p-0 !m-0">
          <code
            dangerouslySetInnerHTML={{ __html: highlighted }}
            className={`language-${cleanLang}`}
          />
        </pre>
      </div>
    </div>
  );
};

export const AIMarkdownMessage = ({ content }) => {
  if (!content) return null;

  return (
    <div className="ai-markdown-content leading-relaxed text-xs">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Headings
          h1: ({ node, children, ...props }) => (
            <h1 className="text-base font-black text-slate-900 dark:text-slate-100 mt-3 mb-1.5 tracking-tight border-b border-slate-200/60 dark:border-slate-700/60 pb-1" {...props}>
              {children}
            </h1>
          ),
          h2: ({ node, children, ...props }) => (
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-2.5 mb-1 tracking-tight" {...props}>
              {children}
            </h2>
          ),
          h3: ({ node, children, ...props }) => (
            <h3 className="text-xs font-bold text-purple-900 dark:text-purple-300 mt-2 mb-1" {...props}>
              {children}
            </h3>
          ),
          h4: ({ node, children, ...props }) => (
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1.5 mb-0.5" {...props}>
              {children}
            </h4>
          ),

          // Paragraph
          p: ({ node, children, ...props }) => (
            <p className="mb-2 last:mb-0 leading-relaxed text-slate-800 dark:text-slate-200 font-normal" {...props}>
              {children}
            </p>
          ),

          // Emphasis
          strong: ({ node, children, ...props }) => (
            <strong className="font-bold text-slate-900 dark:text-white" {...props}>
              {children}
            </strong>
          ),
          em: ({ node, children, ...props }) => (
            <em className="italic text-slate-700 dark:text-slate-300" {...props}>
              {children}
            </em>
          ),

          // Lists
          ul: ({ node, children, ...props }) => (
            <ul className="list-disc list-outside pl-4 space-y-1 mb-2.5 text-slate-800 dark:text-slate-200" {...props}>
              {children}
            </ul>
          ),
          ol: ({ node, children, ...props }) => (
            <ol className="list-decimal list-outside pl-4 space-y-1 mb-2.5 text-slate-800 dark:text-slate-200" {...props}>
              {children}
            </ol>
          ),
          li: ({ node, children, ...props }) => (
            <li className="leading-relaxed pl-0.5 marker:text-purple-500 dark:marker:text-purple-400" {...props}>
              {children}
            </li>
          ),

          // Blockquote
          blockquote: ({ node, children, ...props }) => (
            <blockquote className="border-l-3 border-purple-500 bg-purple-50/60 dark:bg-purple-950/30 px-3 py-1.5 my-2.5 rounded-r-xl text-slate-700 dark:text-slate-300 italic" {...props}>
              {children}
            </blockquote>
          ),

          // Tables
          table: ({ node, children, ...props }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="min-w-full text-left border-collapse text-xs" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ node, children, ...props }) => (
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700" {...props}>
              {children}
            </thead>
          ),
          tbody: ({ node, children, ...props }) => (
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800" {...props}>
              {children}
            </tbody>
          ),
          tr: ({ node, children, ...props }) => (
            <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors" {...props}>
              {children}
            </tr>
          ),
          th: ({ node, children, ...props }) => (
            <th className="p-2 font-bold text-slate-700 dark:text-slate-300 text-xs" {...props}>
              {children}
            </th>
          ),
          td: ({ node, children, ...props }) => (
            <td className="p-2 text-xs text-slate-700 dark:text-slate-300" {...props}>
              {children}
            </td>
          ),

          // Horizontal rule
          hr: ({ node, ...props }) => (
            <hr className="my-3 border-slate-200 dark:border-slate-700" {...props} />
          ),

          // Links (safe protocol enforcement)
          a: ({ node, href, children, ...props }) => {
            const isSafe = /^https?:\/\//i.test(href || '') || /^mailto:/i.test(href || '');
            return (
              <a
                href={isSafe ? href : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-0.5"
                {...props}
              >
                {children}
              </a>
            );
          },

          // Code
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const rawCode = String(children).replace(/\n$/, '');

            if (!inline && (match || rawCode.includes('\n'))) {
              return <CodeBlock language={match ? match[1] : ''} code={rawCode} />;
            }

            return (
              <code
                className="px-1.5 py-0.5 rounded-md font-mono text-[11px] bg-slate-200/80 dark:bg-slate-700/80 text-purple-700 dark:text-purple-300 font-semibold"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
