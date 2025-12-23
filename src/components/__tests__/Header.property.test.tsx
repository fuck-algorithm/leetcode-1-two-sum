import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { render, cleanup } from '@testing-library/react'
import { Header } from '../Header'

// Arbitrary for valid URLs
const urlArb = fc.webUrl()

// Arbitrary for valid title strings (problem number + Chinese title)
const titleArb = fc
  .tuple(fc.integer({ min: 1, max: 3000 }), fc.string({ minLength: 1, maxLength: 20 }))
  .map(([num, name]) => `${num}. ${name}`)

/**
 * **Feature: page-title-navigation, Property 1: External links open in new tab**
 * **Validates: Requirements 1.3, 2.3, 3.1, 3.2**
 *
 * For any external link (LeetCode problem link or back link) rendered by the Header component,
 * the link element SHALL have `target="_blank"` attribute set.
 */
describe('Property 1: External links open in new tab', () => {
  it('all external links should have target="_blank"', () => {
    fc.assert(
      fc.property(titleArb, urlArb, urlArb, urlArb, (title, leetcodeUrl, githubUrl, backUrl) => {
        cleanup()
        const { container } = render(
          <Header
            title={title}
            leetcodeUrl={leetcodeUrl}
            githubUrl={githubUrl}
            backUrl={backUrl}
          />
        )

        // Get all anchor elements
        const links = container.querySelectorAll('a')

        // All links should have target="_blank"
        links.forEach((link) => {
          expect(link.getAttribute('target')).toBe('_blank')
        })
        cleanup()
      }),
      { numRuns: 100 }
    )
  })
})

/**
 * **Feature: page-title-navigation, Property 2: External links have security attributes**
 * **Validates: Requirements 3.3**
 *
 * For any external link rendered by the Header component with `target="_blank"`,
 * the link element SHALL have `rel="noopener noreferrer"` attribute set.
 */
describe('Property 2: External links have security attributes', () => {
  it('all external links with target="_blank" should have rel="noopener noreferrer"', () => {
    fc.assert(
      fc.property(titleArb, urlArb, urlArb, urlArb, (title, leetcodeUrl, githubUrl, backUrl) => {
        cleanup()
        const { container } = render(
          <Header
            title={title}
            leetcodeUrl={leetcodeUrl}
            githubUrl={githubUrl}
            backUrl={backUrl}
          />
        )

        // Get all anchor elements with target="_blank"
        const links = container.querySelectorAll('a[target="_blank"]')

        // All such links should have rel="noopener noreferrer"
        links.forEach((link) => {
          expect(link.getAttribute('rel')).toBe('noopener noreferrer')
        })
        cleanup()
      }),
      { numRuns: 100 }
    )
  })
})

/**
 * **Feature: page-title-navigation, Property 3: Title text preservation**
 * **Validates: Requirements 1.1**
 *
 * For any valid problem title string passed to the Header component,
 * the rendered title text SHALL contain the original title string unchanged.
 */
describe('Property 3: Title text preservation', () => {
  it('title text should be rendered unchanged', () => {
    fc.assert(
      fc.property(titleArb, urlArb, urlArb, (title, leetcodeUrl, githubUrl) => {
        cleanup()
        const { container } = render(
          <Header title={title} leetcodeUrl={leetcodeUrl} githubUrl={githubUrl} />
        )

        // Find the title link element and check its text content
        const titleLink = container.querySelector('a[class*="title"]')
        expect(titleLink).not.toBeNull()
        expect(titleLink?.textContent).toBe(title)
        cleanup()
      }),
      { numRuns: 100 }
    )
  })
})
