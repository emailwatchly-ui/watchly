import { Redirect } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { useAuth } from '../hooks/useAuth'
import { COLORS } from '../constants'

export default function Index() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg }}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    )
  }

  return <Redirect href={session ? '/(tabs)/map' : '/(auth)/login'} />
}
