import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../../firebase'
import TaskModal from './TaskModal'
import './tasks.css'

export default function TaskList() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(undefined) // undefined = closed, null = create, obj = view

  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  return (
    <div>
      <div className="toolbar">
        <div style={{ flex: 1 }} />
        <button className="new-btn" onClick={() => setSelected(null)}>
          + 미션 만들기
        </button>
      </div>

      {loading ? (
        <p>불러오는 중...</p>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <img src="/images/mascot.png" alt="" />
          <p>등록된 미션이 없어요.</p>
        </div>
      ) : (
        <div className="item-list">
          {tasks.map((t) => {
            const assignees = t.assignees || []
            const doneCount = assignees.filter((a) => t.completions?.[a]).length
            return (
              <div className="item-row" key={t.id} onClick={() => setSelected(t)} style={{ cursor: 'pointer' }}>
                <span className="item-row-title">{t.title}</span>
                <span className="task-progress">
                  {t.dueDate && <span className="task-due">마감 {t.dueDate} · </span>}
                  {doneCount}/{assignees.length}명 완료
                </span>
              </div>
            )
          })}
        </div>
      )}

      {selected !== undefined && <TaskModal task={selected} onClose={() => setSelected(undefined)} />}
    </div>
  )
}
