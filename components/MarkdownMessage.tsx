import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownMessageProps {
  content: string;
}

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl border border-gray-800 bg-gray-950/80 overflow-hidden shadow-lg">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-gray-900/90 border-b border-gray-800 text-xs font-mono text-gray-400">
        <span className="uppercase tracking-wider font-semibold text-[11px] text-cyan-400">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center space-x-1.5 px-2 py-1 rounded text-[11px] text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-400" />
              <span className="text-green-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-4 text-[13px] sm:text-sm font-mono leading-relaxed text-cyan-100 bg-gray-950/90">
        <pre className="m-0 whitespace-pre">{code}</pre>
      </div>
    </div>
  );
};

const renderInline = (text: string): React.ReactNode => {
  // Regex tokens: code, bold, link, italic
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Inline code: `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push(
        <code
          key={key++}
          className="px-1.5 py-0.5 rounded bg-gray-950 text-cyan-300 border border-gray-800 font-mono text-[13px] inline-block my-0.5"
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Bold: **text**
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      parts.push(
        <strong key={key++} className="font-semibold text-white">
          {renderInline(boldMatch[1])}
        </strong>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Link: [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      parts.push(
        <a
          key={key++}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 underline hover:text-cyan-300 transition-colors"
        >
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // Italic: *text* or _text_
    const italicMatch = remaining.match(/^(\*|_)([^*_]+)\1/);
    if (italicMatch) {
      parts.push(
        <em key={key++} className="italic text-gray-200">
          {italicMatch[2]}
        </em>
      );
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Regular character or chunk up to next special char
    const nextSpecial = remaining.search(/[`*\[_]/);
    if (nextSpecial === -1) {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    } else if (nextSpecial === 0) {
      // Character didn't match formatting pattern, output literally
      parts.push(<span key={key++}>{remaining[0]}</span>);
      remaining = remaining.slice(1);
    } else {
      parts.push(<span key={key++}>{remaining.slice(0, nextSpecial)}</span>);
      remaining = remaining.slice(nextSpecial);
    }
  }

  return parts;
};

const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content }) => {
  // Parse blocks: code blocks, tables, headers, lists, hr, blockquote, paragraphs
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  let elementIndex = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced Code Block: ```lang
    if (line.trim().startsWith('```')) {
      const language = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing ```
      elements.push(
        <CodeBlock
          key={elementIndex++}
          language={language}
          code={codeLines.join('\n')}
        />
      );
      continue;
    }

    // Table: starts with | and next line has | --- |
    if (
      line.trim().startsWith('|') &&
      i + 1 < lines.length &&
      lines[i + 1].trim().startsWith('|') &&
      lines[i + 1].includes('---')
    ) {
      const headerLine = line;
      i += 2; // skip header and divider
      const bodyLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        bodyLines.push(lines[i]);
        i++;
      }

      const parseRow = (rowStr: string) =>
        rowStr
          .trim()
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());

      const headers = parseRow(headerLine);

      elements.push(
        <div
          key={elementIndex++}
          className="my-3.5 overflow-x-auto rounded-xl border border-gray-800 bg-gray-950/60 shadow"
        >
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-gray-900/90 border-b border-gray-800">
                {headers.map((h, hIdx) => (
                  <th
                    key={hIdx}
                    className="px-3.5 py-2 font-mono font-bold text-cyan-400 uppercase tracking-wider"
                  >
                    {renderInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyLines.map((bRow, rIdx) => {
                const cells = parseRow(bRow);
                return (
                  <tr
                    key={rIdx}
                    className="border-b border-gray-800/50 hover:bg-gray-900/40 transition-colors last:border-0"
                  >
                    {cells.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3.5 py-2 text-gray-200">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Horizontal Rule: --- or ***
    if (/^(\s*[-*_]\s*){3,}$/.test(line)) {
      elements.push(
        <hr key={elementIndex++} className="my-4 border-gray-800/80" />
      );
      i++;
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(
        <h1
          key={elementIndex++}
          className="text-xl sm:text-2xl font-bold text-white mt-4 mb-2 first:mt-0 font-mono tracking-tight"
        >
          {renderInline(line.slice(2))}
        </h1>
      );
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2
          key={elementIndex++}
          className="text-lg sm:text-xl font-bold text-cyan-300 mt-3.5 mb-2 first:mt-0 font-mono tracking-tight"
        >
          {renderInline(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h3
          key={elementIndex++}
          className="text-base sm:text-lg font-semibold text-cyan-400 mt-3 mb-1.5 first:mt-0 font-mono"
        >
          {renderInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith('#### ')) {
      elements.push(
        <h4
          key={elementIndex++}
          className="text-sm font-semibold text-gray-300 uppercase tracking-wider mt-2.5 mb-1 first:mt-0 font-mono"
        >
          {renderInline(line.slice(5))}
        </h4>
      );
      i++;
      continue;
    }

    // Blockquote: > text
    if (line.startsWith('> ')) {
      const quoteLines: string[] = [line.slice(2)];
      i++;
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <blockquote
          key={elementIndex++}
          className="border-l-2 border-cyan-500/80 bg-cyan-950/20 px-4 py-2 my-2.5 rounded-r-lg italic text-gray-200 text-sm leading-relaxed"
        >
          {quoteLines.map((ql, qIdx) => (
            <p key={qIdx} className="my-1 first:mt-0 last:mb-0">
              {renderInline(ql)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    // Unordered List: * or -
    if (/^\s*[-*•]\s+/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\s*[-*•]\s+/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\s*[-*•]\s+/, ''));
        i++;
      }
      elements.push(
        <ul
          key={elementIndex++}
          className="list-disc list-outside pl-5 my-2.5 space-y-1.5 text-gray-200 text-[15px] sm:text-[16px] leading-[1.65]"
        >
          {listItems.map((item, itemIdx) => (
            <li key={itemIdx} className="pl-1">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered List: 1. or 2.
    if (/^\s*\d+\.\s+/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      elements.push(
        <ol
          key={elementIndex++}
          className="list-decimal list-outside pl-5 my-2.5 space-y-1.5 text-gray-200 text-[15px] sm:text-[16px] leading-[1.65]"
        >
          {listItems.map((item, itemIdx) => (
            <li key={itemIdx} className="pl-1">
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Empty line: just step forward
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph: collect lines until empty line or special block
    const pLines: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('> ') &&
      !/^\s*[-*•]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !lines[i].trim().startsWith('|') &&
      !/^(\s*[-*_]\s*){3,}$/.test(lines[i])
    ) {
      pLines.push(lines[i]);
      i++;
    }

    elements.push(
      <p
        key={elementIndex++}
        className="my-2.5 first:mt-0 last:mb-0 text-[15px] sm:text-[16px] leading-[1.65] text-gray-100 font-sans break-words"
      >
        {pLines.map((pl, plIdx) => (
          <React.Fragment key={plIdx}>
            {renderInline(pl)}
            {plIdx < pLines.length - 1 && ' '}
          </React.Fragment>
        ))}
      </p>
    );
  }

  return <div className="space-y-1 w-full max-w-full overflow-hidden">{elements}</div>;
};

export default MarkdownMessage;
