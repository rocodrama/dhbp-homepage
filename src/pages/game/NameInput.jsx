import { useState } from 'react'

export default function NameInput({ names, setNames, placeholder }) {
  const [text, setText] = useState('')

  const add = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    setNames([...names, trimmed])
    setText('')
  }

  const remove = (i) => setNames(names.filter((_, idx) => idx !== i))

  return (
    <div>
      <div className="name-input-row">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          placeholder={placeholder}
        />
        <button type="button" className="btn-secondary" onClick={add}>
          추가
        </button>
      </div>
      <div className="name-chips">
        {names.map((n, i) => (
          <span className="name-chip" key={i}>
            {n}
            <button type="button" onClick={() => remove(i)}>
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
