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

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Handle deep link callbacks
    const handleUrl = async (url: string) => {
      if (url.includes('access_token') || url.includes('code=')) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(url)
        if (error) console.log('Session exchange error:', error.message)
      }
    }

    // Listen for incoming links
    const subscription2 = Linking.addEventListener('url', ({ url }) => handleUrl(url))

    // Check if app was opened with a link
    Linking.getInitialURL().then(url => { if (url) handleUrl(url) })

    return () => {
      subscription.unsubscribe()
      subscription2.remove()
    }
  }, [])

  const signInWithGoogle = async () => {
    try {
      // Build the redirect URL using expo-linking
      const redirectUrl = Linking.createURL('auth/callback')

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl, {
          showInRecents: true,
          preferEphemeralSession: false,
        })

        if (result.type === 'success' && result.url) {
          await supabase.auth.exchangeCodeForSession(result.url)
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
