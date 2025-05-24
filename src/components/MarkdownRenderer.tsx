import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  return (
    <div className={cn("markdown-content", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom heading styles
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-primary mb-4 pb-2 border-b border-primary/20">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-primary mb-3 flex items-center gap-2">
              <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-sm font-bold">
                {typeof children === 'string' && children.match(/^\d+/) ? children.match(/^\d+/)?.[0] : '•'}
              </span>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium text-primary mb-2 border-l-4 border-primary pl-3">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-medium text-foreground mb-2">
              {children}
            </h4>
          ),
          
          // Custom paragraph styles
          p: ({ children }) => (
            <p className="text-muted-foreground leading-relaxed mb-3">
              {children}
            </p>
          ),
          
          // Custom list styles
          ul: ({ children }) => (
            <ul className="space-y-2 mb-4 ml-4">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-2 mb-4 ml-4">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-3">
              <div className="min-w-2 h-2 rounded-full bg-gradient-to-r from-primary to-primary/60 mt-2 flex-shrink-0"></div>
              <span className="text-muted-foreground leading-relaxed">{children}</span>
            </li>
          ),
          
          // Custom strong (bold) styles
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground bg-primary/10 px-1 py-0.5 rounded">
              {children}
            </strong>
          ),
          
          // Custom emphasis (italic) styles
          em: ({ children }) => (
            <em className="italic text-muted-foreground/80">
              {children}
            </em>
          ),
          
          // Custom blockquote styles
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/40 pl-4 py-2 bg-muted/30 rounded-r-lg mb-4 italic">
              {children}
            </blockquote>
          ),
          
          // Custom code styles
          code: ({ children }) => (
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary">
              {children}
            </code>
          ),
          
          // Custom table styles
          table: ({ children }) => (
            <table className="w-full border-collapse border border-border rounded-lg mb-4 overflow-hidden">
              {children}
            </table>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/50">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="border border-border px-3 py-2 text-left font-semibold text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-3 py-2 text-muted-foreground">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer; 