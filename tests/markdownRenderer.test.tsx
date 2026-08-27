import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer'

describe('MarkdownRenderer', () => {
  it('renders Markdown and math without executing HTML', async () => {
    const { container } = render(
      <MarkdownRenderer content={'**Important** $x^2$ <script>window.__unsafe = true</script>'} />
    )

    await waitFor(() => {
      expect(screen.getByText('Important')).toBeInTheDocument()
    })
    expect(container.querySelector('.katex')).toBeInTheDocument()
    expect(container.querySelector('script')).not.toBeInTheDocument()
  })

  it('renders a block math expression', async () => {
    const { container } = render(<MarkdownRenderer content={'\n$$\n\\frac{1}{2}\n$$\n'} />)
    await waitFor(() => {
      expect(container.querySelector('.katex-display')).toBeInTheDocument()
    })
  })
})
