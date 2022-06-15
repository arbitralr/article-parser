// extractJsonLd.test
/* eslint-env jest */

import { readFileSync } from 'fs'
import extractJsonLd from './extractJsonLd.js'

test('test extractJsonLd an actual case', () => {
  const html = readFileSync('./test-data/html-article-with-json-ld.html', 'utf8')
  const result = extractJsonLd(html, 'example.com')
  expect(result.author.length === 2).toBe(true)
})
