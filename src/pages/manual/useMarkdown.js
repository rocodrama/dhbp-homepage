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
import 'highlight.js/styles/github.css'

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

marked.use({
  renderer: {
    code({ text, lang }) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext'
      const html = hljs.highlight(text, { language }).value
      return `<pre><code class="hljs language-${language}">${html}</code></pre>`
    },
  },
})

export function useMarkdownHtml(markdown) {
  return useMemo(() => {
    const rawHtml = marked.parse(markdown ?? '', { breaks: true, gfm: true })
    return DOMPurify.sanitize(rawHtml, { ADD_ATTR: ['class'] })
  }, [markdown])
}
