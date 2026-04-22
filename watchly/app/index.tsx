import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '../hooks/useAuth'
import { COLORS } from '../constants'

export default function Index() {
  const { session, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (session) {
      router.replace('/(tabs)/map')
    } else {
      router.replace('/(auth)/login')
    }
  }, [session, loading])

  // Always show loading spinner while deciding where to go
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg }}>
      <ActivityIndicator color={COLORS.primary} size="large" />
    </View>
  )
}
