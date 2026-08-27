import React, { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface CodeBlockProps {
  code: string
  language?: string
  className?: string
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'typescript',
  className,
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div
      className={cn(
        'relative rounded-lg border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-950 font-mono text-xs overflow-hidden my-3',
        className
      )}
    >
      <div className="flex items-center justify-between px-3 py-1.5 bg-surface-200/60 dark:bg-surface-900/80 border-b border-surface-200 dark:border-surface-800 text-surface-500 dark:text-surface-400 select-none">
        <span className="text-[11px] font-medium tracking-wide uppercase">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-[11px] hover:text-surface-900 dark:hover:text-surface-200 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-surface-800 dark:text-surface-200 leading-relaxed font-mono">
        <code>{code}</code>
      </pre>
    </div>
  )
}
