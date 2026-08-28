import { createContext, useContext, useEffect, useState } from 'react'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubProfile = null

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubProfile) {
        unsubProfile()
        unsubProfile = null
      }

      setUser(firebaseUser)

      if (!firebaseUser) {
        setProfile(null)
        setLoading(false)
        return
      }

      const userRef = doc(db, 'users', firebaseUser.uid)
      const snap = await getDoc(userRef)

      if (!snap.exists()) {
        // Every new signup starts as a pending member. The first admin is
        // promoted manually in the Firestore console (no client-trusted
        // bootstrap path) — see 기획서.md 개발 로드맵.
        await setDoc(userRef, {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          status: 'pending',
          role: 'member',
          createdAt: serverTimestamp(),
        })
      }

      unsubProfile = onSnapshot(userRef, (docSnap) => {
        setProfile(docSnap.exists() ? docSnap.data() : null)
        setLoading(false)
      })
    })

    return () => {
      unsubAuth()
      if (unsubProfile) unsubProfile()
    }
  }, [])

  const signInWithGoogle = () => signInWithPopup(auth, googleProvider)
  const signOutUser = () => signOut(auth)

  const value = {
    user,
    profile,
    loading,
    isApproved: profile?.status === 'approved',
    isAdmin: profile?.role === 'admin',
    signInWithGoogle,
    signOutUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
