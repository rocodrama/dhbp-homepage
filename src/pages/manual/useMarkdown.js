import { useMemo } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

export function useMarkdownHtml(markdown) {
  return useMemo(() => {
    const rawHtml = marked.parse(markdown ?? '', { breaks: true })
    return DOMPurify.sanitize(rawHtml)
  }, [markdown])
}
