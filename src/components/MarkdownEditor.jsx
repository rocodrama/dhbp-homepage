import { useRef, useState } from 'react'
import { useMarkdownHtml } from '../pages/manual/useMarkdown'
import { lineStartOf, listContinuation } from './markdownEdits'
import './MarkdownEditor.css'

// 들여쓰기는 2칸. 4칸이면 빈 줄에서 Tab 한 번에 "들여쓴 코드블록"이 되어버린다.
const TAB_SPACES = '  '

// 모든 편집을 execCommand로 통일한다. 브라우저 네이티브 실행취소(Ctrl+Z) 스택에
// 그대로 기록되고, input 이벤트가 발생해 React onChange가 알아서 state를 맞춘다.
// 직접 undo 스택을 관리할 필요가 없다.
function insertText(el, text) {
  el.focus()
  if (document.execCommand('insertText', false, text)) return
  // execCommand 미지원 환경 폴백 (실행취소는 못 살린다)
  const { selectionStart, selectionEnd } = el
  el.setRangeText(text, selectionStart, selectionEnd, 'end')
  el.dispatchEvent(new Event('input', { bubbles: true }))
}

function deleteRange(el, start, end) {
  el.focus()
  el.setSelectionRange(start, end)
  if (document.execCommand('delete')) return
  el.setRangeText('', start, end, 'end')
  el.dispatchEvent(new Event('input', { bubbles: true }))
}

const TOOLS = [
  { key: 'bold', label: 'B', title: '굵게 (Ctrl+B)', wrap: ['**', '**'], placeholder: '굵게', style: { fontWeight: 700 } },
  { key: 'italic', label: 'I', title: '기울임 (Ctrl+I)', wrap: ['*', '*'], placeholder: '기울임', style: { fontStyle: 'italic' } },
  { key: 'heading', label: 'H', title: '제목', prefix: '## ' },
  { key: 'list', label: '≡', title: '목록', prefix: '- ' },
  { key: 'quote', label: '❝', title: '인용', prefix: '> ' },
  { key: 'link', label: '🔗', title: '링크 (Ctrl+K)', wrap: ['[', '](url)'], placeholder: '링크 텍스트' },
  { key: 'code', label: '</>', title: '코드블록', wrap: ['```\n', '\n```'], placeholder: '코드' },
]

export default function MarkdownEditor({ value, onChange }) {
  const [tab, setTab] = useState('write')
  const textareaRef = useRef(null)
  // 작성 탭에서는 파싱하지 않는다 — 예전엔 미리보기가 숨겨져 있어도
  // 매 키 입력마다 전체 문서를 파싱·하이라이트·sanitize 했다.
  const html = useMarkdownHtml(tab === 'preview' ? value : '')

  const wrapSelection = (before, after, placeholder) => {
    const el = textareaRef.current
    const { selectionStart, selectionEnd } = el
    const selected = value.slice(selectionStart, selectionEnd)
    const body = selected || placeholder
    insertText(el, before + body + after)
    const bodyStart = selectionStart + before.length
    el.setSelectionRange(bodyStart, bodyStart + body.length)
  }

  const toggleLinePrefix = (prefix) => {
    const el = textareaRef.current
    const start = lineStartOf(value, el.selectionStart)
    if (value.startsWith(prefix, start)) {
      deleteRange(el, start, start + prefix.length)
      return
    }
    el.setSelectionRange(start, start)
    insertText(el, prefix)
  }

  const runTool = (tool) => {
    if (tool.prefix) toggleLinePrefix(tool.prefix)
    else wrapSelection(tool.wrap[0], tool.wrap[1], tool.placeholder)
  }

  const handleKeyDown = (e) => {
    const el = e.target

    if (e.key === 'Tab') {
      e.preventDefault()
      insertText(el, TAB_SPACES)
      return
    }

    if (e.ctrlKey || e.metaKey) {
      const tool = { b: 'bold', i: 'italic', k: 'link' }[e.key.toLowerCase()]
      if (tool) {
        e.preventDefault()
        runTool(TOOLS.find((t) => t.key === tool))
      }
      return
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      const { selectionStart, selectionEnd } = el
      if (selectionStart !== selectionEnd) return
      const start = lineStartOf(value, selectionStart)
      const cont = listContinuation(value.slice(start, selectionStart))
      if (!cont) return
      e.preventDefault()
      // 마커만 있는 빈 항목에서 Enter → 마커를 지우고 목록을 끝낸다
      if (cont.isEmpty) deleteRange(el, start, start + cont.markerLength)
      else insertText(el, '\n' + cont.next)
    }
  }

  return (
    <div className="md-editor">
      <div className="md-toolbar">
        <div className="md-tabs">
          <button
            type="button"
            className={'md-tab' + (tab === 'write' ? ' active' : '')}
            onClick={() => setTab('write')}
          >
            작성
          </button>
          <button
            type="button"
            className={'md-tab' + (tab === 'preview' ? ' active' : '')}
            onClick={() => setTab('preview')}
          >
            미리보기
          </button>
        </div>

        {tab === 'write' &&
          TOOLS.map((tool) => (
            <button
              key={tool.key}
              type="button"
              className="md-btn"
              title={tool.title}
              style={tool.style}
              // 버튼이 포커스를 뺏으면 execCommand가 textarea에 먹지 않는다
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => runTool(tool)}
            >
              {tool.label}
            </button>
          ))}
      </div>

      <textarea
        ref={textareaRef}
        className="md-textarea"
        hidden={tab !== 'write'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="마크다운으로 작성하세요. # 제목, **굵게**, - 목록, ```python 코드블럭 등을 쓸 수 있어요."
      />
      {tab === 'preview' && (
        <div className="md-preview detail-body" dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </div>
  )
}
