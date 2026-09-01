import { useMemo } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml'
import java from 'highlight.js/lib/languages/java'
import cpp from 'highlight.js/lib/languages/cpp'
import sql from 'highlight.js/lib/languages/sql'
import yaml from 'highlight.js/lib/languages/yaml'
import plaintext from 'highlight.js/lib/languages/plaintext'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('json', json)
hljs.registerLanguage('css', css)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('java', java)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('yaml', yaml)
// 언어를 못 찾았을 때의 폴백. lib/core는 아무 언어도 기본 등록하지 않으므로
// 이걸 빼먹으면 hljs.highlight(..., 'plaintext')가 throw 하고 렌더 전체가 죽는다.
hljs.registerLanguage('plaintext', plaintext)

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ESCAPES[c])
}

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

marked.use({
  renderer: {
    code({ text, lang }) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext'
      let html
      try {
        html = hljs.highlight(text, { language }).value
      } catch {
        // 하이라이트 실패가 페이지 전체를 죽이지 않게 원문을 그대로 보여준다.
        html = escapeHtml(text)
      }
      return `<pre><code class="hljs language-${language}">${html}</code></pre>`
    },
  },
})

// sanitize 이전 단계. 예전에 크래시가 나던 지점이라 node로 검증할 수 있게 분리했다
// (scripts/check-markdown.mjs). 화면에 꽂을 때는 반드시 renderMarkdown을 쓸 것.
export function markdownToUnsafeHtml(markdown) {
  return marked.parse(markdown ?? '', { breaks: true, gfm: true })
}

export function renderMarkdown(markdown) {
  return DOMPurify.sanitize(markdownToUnsafeHtml(markdown), { ADD_ATTR: ['class'] })
}

export function useMarkdownHtml(markdown) {
  return useMemo(() => renderMarkdown(markdown), [markdown])
}
