import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { App } from '@/App'

describe('App Route Navigation & Component Mounting', () => {
  it('renders home page with instant search and featured tests', async () => {
    window.history.pushState({}, 'Home', '/')
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Find a test/i })).toBeInTheDocument()
    })
    expect(screen.getByText(/Start learning\./i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/What do you want to test\?/i)).toBeInTheDocument()
  })

  it('renders test catalog page', async () => {
    window.history.pushState({}, 'Catalog', '/tests')
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/Test Catalog/i)).toBeInTheDocument()
    })
    expect(screen.getAllByText(/All Categories/i).length).toBeGreaterThan(0)
  })

  it('renders about page with manifesto', async () => {
    window.history.pushState({}, 'About', '/about')
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/Learning Should Have Zero Friction/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/No Login • No Personal Data/i)).toBeInTheDocument()
  })

  it('renders test detail landing page with breadcrumbs and direct CTA without login/setup', async () => {
    window.history.pushState({}, 'Test Detail', '/tests/sql-interview-test')
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /SQL Interview Test/i })).toBeInTheDocument()
    })

    // Verify key test landing elements
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Start Test/i }).length).toBeGreaterThan(0)
    expect(screen.getByText(/Topics & Skills Tested/i)).toBeInTheDocument()
    expect(screen.getByText(/What You Will Practice/i)).toBeInTheDocument()
    expect(screen.getByText(/100% free, no login or profile setup required/i)).toBeInTheDocument()
  })

  it('renders single question practice page', async () => {
    window.history.pushState({}, 'Practice Question', '/practice/sql-interview-test/q-sqli-1')
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/Focused Practice Mode/i)).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /Check Answer/i })).toBeInTheDocument()
    expect(screen.getAllByText(/Back to Mistakes/i).length).toBeGreaterThan(0)
  })
})

