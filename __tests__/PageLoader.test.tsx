import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PageLoader from '../app/components/PageLoader'

describe('PageLoader', () => {
  it('renders the default loading message', () => {
    render(<PageLoader />)
    
    // Check if the default message is in the document
    const message = screen.getByText('Verifying secure session...')
    expect(message).toBeInTheDocument()
  })

  it('renders a custom loading message when provided', () => {
    const customMessage = 'Loading your custom dashboard...'
    render(<PageLoader message={customMessage} />)
    
    // Check if the custom message is in the document
    const message = screen.getByText(customMessage)
    expect(message).toBeInTheDocument()
  })

  it('renders the EduAgent logo text', () => {
    render(<PageLoader />)
    const logoText = screen.getByText('EduAgent')
    expect(logoText).toBeInTheDocument()
  })
})
