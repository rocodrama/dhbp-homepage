import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import { useApprovedUsers } from './useApprovedUsers'
import { STATUS_COLOR } from './constants'
import EquipmentModal from './EquipmentModal'
import './equipment.css'

export default function EquipmentList() {
  const { isAdmin } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(undefined) // undefined = closed, null = create, obj = view
  const approvedUsers = useApprovedUsers()

  useEffect(() => {
    const q = query(collection(db, 'equipment'), orderBy('name'))
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  return (
    <div>
      <div className="toolbar">
        <div style={{ flex: 1 }} />
        {isAdmin && (
          <button className="new-btn" onClick={() => setSelected(null)}>
            + 장비 추가
          </button>
        )}
      </div>

      {loading ? (
        <p>불러오는 중...</p>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <img src="/images/mascot.png" alt="" />
          <p>등록된 장비가 없어요.</p>
        </div>
      ) : (
        <div className="equip-table-wrap">
          <table className="equip-table">
            <thead>
              <tr>
                <th>장비명</th>
                <th>담당자</th>
                <th>상태</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} onClick={() => setSelected(it)}>
                  <td>{it.name}</td>
                  <td>{it.ownerName}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        background: STATUS_COLOR[it.status] + '22',
                        color: STATUS_COLOR[it.status],
                      }}
                    >
                      {it.status}
                    </span>
                  </td>
                  <td>{it.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected !== undefined && (
        <EquipmentModal
          equipment={selected}
          approvedUsers={approvedUsers}
          onClose={() => setSelected(undefined)}
        />
      )}
    </div>
  )
}
