import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useRouter, useSegments } from 'expo-router'
import { AuthProvider, useAuth } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useNotifications'

function AuthGuard() {
  const { session, loading } = useAuth()
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    if (loading) return
    const inTabsGroup = segments[0] === '(tabs)'
    const inAuthGroup = segments[0] === '(auth)'
    if (session && inAuthGroup) {
      router.replace('/(tabs)/map')
    } else if (!session && inTabsGroup) {
      router.replace('/(auth)/login')
    }
  }, [session, loading, segments])

  return null
}

function NotificationSetup() {
  useNotifications()
  return null
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AuthGuard />
      <NotificationSetup />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="privacy" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="terms" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  )
}
