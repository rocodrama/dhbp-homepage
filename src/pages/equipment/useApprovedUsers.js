import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../../firebase'

export function useApprovedUsers() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    const q = query(collection(db, 'users'), where('status', '==', 'approved'))
    const unsub = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  return users
}
