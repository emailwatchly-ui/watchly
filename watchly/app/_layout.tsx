import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useRouter, useSegments } from 'expo-router'
import { AuthProvider, useAuth } from '../hooks/useAuth'

function NavigationGuard() {
  const { session, loading } = useAuth()
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    if (loading) return

    const inAuthGroup = segments[0] === '(auth)'
    const inTabsGroup = segments[0] === '(tabs)'

    if (session && inAuthGroup) {
      // Logged in but on auth screen — go to app
      router.replace('/(tabs)/map')
    } else if (!session && inTabsGroup) {
      // Not logged in but in app — go to login
      router.replace('/(auth)/login')
    }
  }, [session, loading, segments])

  return null
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <NavigationGuard />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  )
}
