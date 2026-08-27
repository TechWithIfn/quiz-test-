import React from 'react'
import HeavyMarkdown from './HeavyMarkdown'

export interface MarkdownRendererProps {
  content: string
  className?: string
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  return <HeavyMarkdown content={content} className={className} />
}

export default MarkdownRenderer
