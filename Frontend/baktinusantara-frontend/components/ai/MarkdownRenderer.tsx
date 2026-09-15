'use client';

import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface MarkdownRendererProps {
  content: string;
  isUser?: boolean;
}

// Subcomponent for Code Block with copy functionality
function CodeBlock({ code, language, isUser }: { code: string; language?: string; isUser?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Kode berhasil disalin!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`my-2.5 rounded-xl overflow-hidden border shadow-sm max-w-full ${
      isUser
        ? 'bg-black/30 border-white/20 text-white'
        : 'bg-navy-950 dark:bg-[#030d1a] border-slate-800 text-slate-100'
    }`}>
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-white/5 border-b border-white/10 text-[11px] font-mono text-slate-400">
        <span className="font-semibold uppercase tracking-wider text-slate-300">
          {language || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          title="Salin kode"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-sans">Tersalin</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[10px] font-sans">Salin</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <pre className="p-3.5 overflow-x-auto text-xs font-mono leading-relaxed text-emerald-300 dark:text-emerald-400 scrollbar-thin scrollbar-thumb-white/10">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// Inline Markdown Parser
function parseInline(text: string, isUser: boolean = false): React.ReactNode[] {
  const tokenRegex = /(`[^`]+`|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Inline Code: `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const codeContent = part.slice(1, -1);
      return (
        <code
          key={index}
          className={`px-1.5 py-0.5 rounded-md font-mono text-[11.5px] sm:text-xs font-semibold mx-0.5 ${
            isUser
              ? 'bg-white/20 text-white border border-white/25'
              : 'bg-slate-100 dark:bg-navy-950 text-primary-700 dark:text-primary-300 border border-slate-200 dark:border-navy-800'
          }`}
        >
          {codeContent}
        </code>
      );
    }

    // Bold-Italic: ***text***
    if (part.startsWith('***') && part.endsWith('***') && part.length >= 6) {
      return (
        <strong key={index} className="font-bold italic">
          {parseInline(part.slice(3, -3), isUser)}
        </strong>
      );
    }

    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong
          key={index}
          className={`font-semibold ${
            isUser ? 'text-white' : 'text-navy-950 dark:text-white font-bold'
          }`}
        >
          {parseInline(part.slice(2, -2), isUser)}
        </strong>
      );
    }

    // Italic: *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em
          key={index}
          className={`italic ${isUser ? 'text-white/90' : 'text-slate-700 dark:text-slate-300'}`}
        >
          {parseInline(part.slice(1, -1), isUser)}
        </em>
      );
    }

    // Strikethrough: ~~text~~
    if (part.startsWith('~~') && part.endsWith('~~') && part.length >= 4) {
      return (
        <del key={index} className="line-through opacity-70">
          {parseInline(part.slice(2, -2), isUser)}
        </del>
      );
    }

    // Link: [text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const linkText = linkMatch[1];
      const linkUrl = linkMatch[2];
      return (
        <a
          key={index}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-0.5 font-semibold underline underline-offset-2 break-all transition-colors ${
            isUser
              ? 'text-white hover:text-white/80'
              : 'text-primary dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300'
          }`}
        >
          <span>{linkText}</span>
          <ExternalLink className="w-3 h-3 inline-block shrink-0 opacity-80" />
        </a>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

export function MarkdownRenderer({ content, isUser = false }: MarkdownRendererProps) {
  if (!content) return null;

  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeLanguage = '';
  let codeBuffer: string[] = [];

  let listType: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];

  let tableBuffer: string[] = [];
  let inTable = false;

  const flushList = () => {
    if (listItems.length > 0 && listType) {
      const currentListType = listType;
      const currentItems = [...listItems];
      const listKey = `list-${blocks.length}`;

      if (currentListType === 'ul') {
        blocks.push(
          <ul
            key={listKey}
            className={`my-2 space-y-1 pl-4 sm:pl-5 list-disc ${
              isUser
                ? 'marker:text-white/80'
                : 'marker:text-primary dark:marker:text-primary-400 text-slate-800 dark:text-slate-200'
            }`}
          >
            {currentItems.map((item, idx) => (
              <li key={idx} className="leading-[1.65] pl-1 text-[13.5px] sm:text-[14px]">
                {parseInline(item, isUser)}
              </li>
            ))}
          </ul>
        );
      } else {
        blocks.push(
          <ol
            key={listKey}
            className={`my-2 space-y-1 pl-4 sm:pl-5 list-decimal ${
              isUser
                ? 'marker:text-white/80'
                : 'marker:text-primary dark:marker:text-primary-400 marker:font-semibold text-slate-800 dark:text-slate-200'
            }`}
          >
            {currentItems.map((item, idx) => (
              <li key={idx} className="leading-[1.65] pl-1 text-[13.5px] sm:text-[14px]">
                {parseInline(item, isUser)}
              </li>
            ))}
          </ol>
        );
      }
      listItems = [];
      listType = null;
    }
  };

  const flushTable = () => {
    if (tableBuffer.length > 0) {
      const rawRows = tableBuffer.map((r) =>
        r
          .trim()
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map((c) => c.trim())
      );

      const isDivider = (row: string[]) => row.every((c) => /^:?-+:?$/.test(c));
      const validRows = rawRows.filter((row) => !isDivider(row));

      if (validRows.length > 0) {
        const headerRow = validRows[0];
        const bodyRows = validRows.slice(1);
        const tableKey = `table-${blocks.length}`;

        blocks.push(
          <div
            key={tableKey}
            className="my-2.5 overflow-x-auto rounded-xl border border-slate-200 dark:border-navy-800 shadow-2xs max-w-full"
          >
            <table className="min-w-full text-xs text-left divide-y divide-slate-200 dark:divide-navy-800 font-sans">
              <thead className="bg-slate-100 dark:bg-navy-950 font-bold text-navy-950 dark:text-white">
                <tr>
                  {headerRow.map((cell, cIdx) => (
                    <th key={cIdx} className="px-3 py-2 text-xs font-semibold">
                      {parseInline(cell, isUser)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-900/60 bg-white/50 dark:bg-navy-900/50">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-navy-800/50 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-2 text-xs text-slate-700 dark:text-slate-300">
                        {parseInline(cell, isUser)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      tableBuffer = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Code Block Fence ```
    if (trimmed.startsWith('```')) {
      if (!inCodeBlock) {
        flushList();
        flushTable();
        inCodeBlock = true;
        codeLanguage = trimmed.slice(3).trim();
        codeBuffer = [];
      } else {
        inCodeBlock = false;
        blocks.push(
          <CodeBlock
            key={`code-${blocks.length}`}
            code={codeBuffer.join('\n')}
            language={codeLanguage}
            isUser={isUser}
          />
        );
        codeBuffer = [];
        codeLanguage = '';
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // 2. Table Row | ... |
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2) {
      flushList();
      inTable = true;
      tableBuffer.push(trimmed);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // 3. Headings (#, ##, ###, ####)
    if (trimmed.startsWith('#')) {
      flushList();
      flushTable();

      const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2];
        const hKey = `h-${blocks.length}-${i}`;

        if (level === 1) {
          blocks.push(
            <h1
              key={hKey}
              className={`text-[15.5px] sm:text-[16px] font-bold tracking-tight mt-3 mb-1.5 pb-1 border-b ${
                isUser
                  ? 'text-white border-white/20'
                  : 'text-navy-950 dark:text-white border-slate-200/80 dark:border-navy-800'
              }`}
            >
              {parseInline(text, isUser)}
            </h1>
          );
        } else if (level === 2) {
          blocks.push(
            <h2
              key={hKey}
              className={`text-[14px] sm:text-[15px] font-bold tracking-tight mt-2.5 mb-1 ${
                isUser ? 'text-white' : 'text-navy-950 dark:text-white'
              }`}
            >
              {parseInline(text, isUser)}
            </h2>
          );
        } else if (level === 3) {
          blocks.push(
            <h3
              key={hKey}
              className={`text-[13.5px] sm:text-[14px] font-semibold mt-2 mb-1 ${
                isUser ? 'text-white/95' : 'text-primary dark:text-primary-400'
              }`}
            >
              {parseInline(text, isUser)}
            </h3>
          );
        } else {
          blocks.push(
            <h4
              key={hKey}
              className={`text-[13px] font-semibold mt-1.5 mb-1 ${
                isUser ? 'text-white/90' : 'text-slate-800 dark:text-slate-200'
              }`}
            >
              {parseInline(text, isUser)}
            </h4>
          );
        }
        continue;
      }
    }

    // 4. Horizontal Rule (---, ***, ___)
    if (/^(\*{3,}|-{3,}|_{3,})$/.test(trimmed)) {
      flushList();
      flushTable();
      blocks.push(
        <hr
          key={`hr-${blocks.length}`}
          className={`my-2.5 ${isUser ? 'border-white/20' : 'border-slate-200 dark:border-navy-800'}`}
        />
      );
      continue;
    }

    // 5. Blockquote (> ...)
    if (trimmed.startsWith('>')) {
      flushList();
      flushTable();
      const quoteText = trimmed.replace(/^>\s?/, '');
      blocks.push(
        <blockquote
          key={`quote-${blocks.length}`}
          className={`border-l-3 pl-3 py-1.5 my-2 italic text-[13px] leading-relaxed rounded-r-lg ${
            isUser
              ? 'border-white/40 bg-white/10 text-white/90'
              : 'border-primary/60 dark:border-primary-400 bg-slate-50/80 dark:bg-navy-950/50 text-slate-700 dark:text-slate-300'
          }`}
        >
          {parseInline(quoteText, isUser)}
        </blockquote>
      );
      continue;
    }

    // 6. Unordered List Items (- item, * item, + item)
    const ulMatch = trimmed.match(/^[-*+]\s+(.*)$/);
    if (ulMatch) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      listItems.push(ulMatch[1]);
      continue;
    }

    // 7. Ordered List Items (1. item, 2. item)
    const olMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      listItems.push(olMatch[1]);
      continue;
    }

    flushList();

    if (!trimmed) {
      continue;
    }

    // 8. Standard Paragraph
    blocks.push(
      <p
        key={`p-${blocks.length}`}
        className={`leading-[1.65] my-1.5 text-[13.5px] sm:text-[14px] ${
          isUser ? 'text-white' : 'text-slate-800 dark:text-slate-100'
        }`}
      >
        {parseInline(trimmed, isUser)}
      </p>
    );
  }

  flushList();
  flushTable();

  if (inCodeBlock && codeBuffer.length > 0) {
    blocks.push(
      <CodeBlock
        key={`code-${blocks.length}`}
        code={codeBuffer.join('\n')}
        language={codeLanguage}
        isUser={isUser}
      />
    );
  }

  return <div className="space-y-0.5 font-sans break-words">{blocks}</div>;
}
