import { useState } from 'react'
import { useMarkdownHtml } from '../pages/manual/useMarkdown'
import './MarkdownEditor.css'

const TAB_SPACES = '    '

export default function MarkdownEditor({ value, onChange }) {
  const [tab, setTab] = useState('write')
  const html = useMarkdownHtml(value)

  const handleTabKey = (e) => {
    if (e.key !== 'Tab') return
    e.preventDefault()
    const el = e.target
    const { selectionStart, selectionEnd } = el
    const newValue = value.slice(0, selectionStart) + TAB_SPACES + value.slice(selectionEnd)
    onChange(newValue)
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = selectionStart + TAB_SPACES.length
    })
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
      </div>

      <textarea
        className="md-textarea"
        hidden={tab !== 'write'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleTabKey}
        placeholder="마크다운으로 작성하세요. # 제목, **굵게**, - 목록, ```python 코드블럭 등을 쓸 수 있어요."
      />
      {tab === 'preview' && (
        <div className="md-preview" dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </div>
  )
}
