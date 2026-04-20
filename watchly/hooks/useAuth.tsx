import { createContext, useContext, useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { Session, User } from '@supabase/supabase-js'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import { supabase } from '../lib/supabase'

WebBrowser.maybeCompleteAuthSession()

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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth state changes including OAuth callbacks
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    try {
      // Build the redirect URL using the app scheme
      const redirectTo = Linking.createURL('auth/callback')

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      })

      if (error) throw error

      if (data?.url) {
        // Open the OAuth URL in an in-app browser
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectTo,
          { preferEphemeralSession: true }
        )

        if (result.type === 'success' && result.url) {
          // Extract the code from the callback URL and exchange it for a session
          const url = result.url

          // Try PKCE code exchange first
          try {
            const { error: sessionError } = await supabase.auth.exchangeCodeForSession(url)
            if (sessionError) throw sessionError
          } catch {
            // Fallback: parse tokens from URL hash or query params
            const parsed = new URL(url)
            const accessToken = parsed.searchParams.get('access_token') ||
              new URLSearchParams(parsed.hash.replace('#', '')).get('access_token')
            const refreshToken = parsed.searchParams.get('refresh_token') ||
              new URLSearchParams(parsed.hash.replace('#', '')).get('refresh_token')

            if (accessToken && refreshToken) {
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              })
            }
          }

          // Refresh session state
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            setSession(session)
            setUser(session.user)
          }
        }
      }
    } catch (err: any) {
      Alert.alert('Sign in failed', err.message || 'Something went wrong')
    }
  }

  const signOut = async () => {
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
