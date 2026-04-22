import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useRouter, useSegments } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AuthProvider, useAuth } from '../hooks/useAuth'

function NavigationGuard() {
  const { session, loading } = useAuth()
  const router = useRouter()
  const segments = useSegments()
  const [onboardingChecked, setOnboardingChecked] = useState(false)
  const [onboardingDone, setOnboardingDone] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem('onboarding_complete').then(val => {
      setOnboardingDone(val === 'true')
      setOnboardingChecked(true)
    })
  }, [])

  useEffect(() => {
    if (loading || !onboardingChecked) return
    const inAuthGroup = segments[0] === '(auth)'
    const inTabsGroup = segments[0] === '(tabs)'
    const inOnboarding = segments[0] === 'onboarding'
    if (!onboardingDone && !inOnboarding) {
      router.replace('/onboarding')
      return
    }
    if (onboardingDone) {
      if (session && (inAuthGroup || segments.length === 0)) {
        router.replace('/(tabs)/map')
      } else if (!session && inTabsGroup) {
        router.replace('/(auth)/login')
      }
    }
  }, [session, loading, segments, onboardingChecked, onboardingDone])

  return null
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <NavigationGuard />
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
