import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import rehypeSanitize from 'rehype-sanitize'
import remarkMath from 'remark-math'
import 'katex/dist/katex.min.css'
import { cn } from '@/utils/cn'

export interface HeavyMarkdownProps {
  content: string
  className?: string
}

export const HeavyMarkdown: React.FC<HeavyMarkdownProps> = ({ content, className }) => {
  return (
    <div className={cn('markdown-content', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeSanitize, rehypeKatex]}
        components={{
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand-600 underline underline-offset-2 dark:text-brand-400">
              {children}
            </a>
          ),
          code: ({ children, className: codeClassName }) => (
            <code className={cn('rounded bg-surface-100 px-1 py-0.5 font-mono text-[0.9em] dark:bg-surface-800', codeClassName)}>
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default HeavyMarkdown
