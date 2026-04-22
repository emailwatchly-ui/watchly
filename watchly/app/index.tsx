import { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuth } from '../hooks/useAuth'
import { COLORS } from '../constants'

export default function Index() {
  const { session, loading } = useAuth()
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [onboardingDone, setOnboardingDone] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem('onboarding_complete').then(val => {
      setOnboardingDone(val === 'true')
      setReady(true)
    })
  }, [])

  useEffect(() => {
    if (!ready || loading) return
    if (!onboardingDone) {
      router.replace('/onboarding')
    } else if (session) {
      router.replace('/(tabs)/map')
    } else {
      router.replace('/(auth)/login')
    }
  }, [ready, loading, session, onboardingDone])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg }}>
      <ActivityIndicator color={COLORS.primary} size="large" />
    </View>
  )
}