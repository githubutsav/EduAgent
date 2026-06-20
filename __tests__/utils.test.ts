import { describe, it, expect } from 'vitest'
import { cn } from '../lib/utils'

describe('utils', () => {
  describe('cn', () => {
    it('merges tailwind classes correctly', () => {
      // tailwind-merge resolves conflicts, so bg-blue-500 should override bg-red-500
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
      expect(cn('text-sm', 'text-lg')).toBe('text-lg')
    })

    it('handles conditional classes', () => {
      const isActive = true
      expect(cn('p-4', isActive && 'bg-blue-500')).toBe('p-4 bg-blue-500')
    })

    it('handles arrays and objects', () => {
      expect(cn('p-4', ['text-center', 'font-bold'])).toBe('p-4 text-center font-bold')
      expect(cn('p-4', { 'bg-blue-500': true, 'text-white': false })).toBe('p-4 bg-blue-500')
    })
  })
})
