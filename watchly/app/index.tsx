import { View, ActivityIndicator } from 'react-native'
import { COLORS } from '../constants'

export default function Index() {
  // NavigationGuard in _layout.tsx handles all routing decisions
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg }}>
      <ActivityIndicator color={COLORS.primary} size="large" />
    </View>
  )
}
