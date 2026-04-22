import { createContext, useContext, useEffect, useState } from 'react'
import { Alert, Platform } from 'react-native'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// Native Google Sign-In — works in standalone builds without web redirects
let GoogleSignin: any = null
let statusCodes: any = null
try {
  const gs = require('@react-native-google-signin/google-signin')
  GoogleSignin = gs.GoogleSignin
  statusCodes = gs.statusCodes
} catch (e) {
  // Not available in Expo Go
}

const WEB_CLIENT_ID = '128071343253-8ibt959omp4n15sugom9ru67j1ur0rql.apps.googleusercontent.com'
const IOS_CLIENT_ID = '128071343253-cmbv7a3i62tv55voo1qn5vga8k6icl3l.apps.googleusercontent.com'

// Configure Google Sign-In once
if (GoogleSignin) {
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    offlineAccess: false,
    scopes: ['profile', 'email'],
  })
}

type AuthContextType = {
  session: Session | null
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for ALL auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    if (!GoogleSignin) {
      Alert.alert(
        'Not supported',
        'Google Sign-In requires a standalone build. Please use email/password in Expo Go.'
      )
      return
    }

    try {
      // Ensure any previous sign-in is cleared
      await GoogleSignin.signOut().catch(() => {})
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })

      // Trigger native Google Sign-In sheet
      const signInResult = await GoogleSignin.signIn()

      // Get the ID token
      const { idToken } = await GoogleSignin.getTokens()

      if (!idToken) {
        throw new Error('No ID token returned from Google Sign-In')
      }

      // Exchange the Google ID token for a Supabase session
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      })

      if (error) throw error

      // Session is set via onAuthStateChange listener above
    } catch (error: any) {
      if (statusCodes && error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled — no alert needed
        return
      }
      if (statusCodes && error.code === statusCodes.IN_PROGRESS) {
        return
      }
      if (statusCodes && error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Google Play Services not available')
        return
      }
      Alert.alert('Sign in failed', error.message || 'Something went wrong')
    }
  }

  const signOut = async () => {
    if (GoogleSignin) {
      await GoogleSignin.signOut().catch(() => {})
    }
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ session, user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
