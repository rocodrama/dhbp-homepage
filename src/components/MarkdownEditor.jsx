import { useState } from 'react'
import { useMarkdownHtml } from '../pages/manual/useMarkdown'
import './MarkdownEditor.css'

export default function MarkdownEditor({ value, onChange }) {
  const [tab, setTab] = useState('write')
  const html = useMarkdownHtml(value)

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

      {tab === 'write' ? (
        <textarea
          className="md-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="마크다운으로 작성하세요. # 제목, **굵게**, - 목록 등을 쓸 수 있어요."
        />
      ) : (
        <div className="md-preview" dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </div>
  )
}
