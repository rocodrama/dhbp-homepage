import { useState } from 'react'

export default function NameInput({ names, setNames, placeholder }) {
  const [text, setText] = useState('')

  const add = (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    setNames([...names, trimmed])
    setText('')
  }

  const remove = (i) => setNames(names.filter((_, idx) => idx !== i))

  return (
    <div>
      <form className="name-input-row" onSubmit={add}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
        />
        <button type="submit" className="btn-secondary">
          추가
        </button>
      </form>
      <div className="name-chips">
        {names.map((n, i) => (
          <span className="name-chip" key={i}>
            {n}
            <button onClick={() => remove(i)}>✕</button>
          </span>
        ))}
      </div>
    </div>
  )
}
