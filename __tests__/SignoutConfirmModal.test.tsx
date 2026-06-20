import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SignoutConfirmModal from '../app/components/SignoutConfirmModal'

describe('SignoutConfirmModal', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <SignoutConfirmModal isOpen={false} onClose={vi.fn()} onConfirm={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders correctly when isOpen is true', () => {
    render(
      <SignoutConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} />
    )
    
    expect(screen.getByText('Confirm Sign Out')).toBeInTheDocument()
    expect(screen.getByText(/Are you sure you want to sign out/i)).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument()
  })

  it('calls onClose when Cancel button is clicked', () => {
    const handleClose = vi.fn()
    render(
      <SignoutConfirmModal isOpen={true} onClose={handleClose} onConfirm={vi.fn()} />
    )
    
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)
    
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('calls onConfirm when Sign Out button is clicked', () => {
    const handleConfirm = vi.fn()
    render(
      <SignoutConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={handleConfirm} />
    )
    
    const confirmButton = screen.getByRole('button', { name: 'Sign Out' })
    fireEvent.click(confirmButton)
    
    expect(handleConfirm).toHaveBeenCalledTimes(1)
  })
})
